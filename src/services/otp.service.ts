import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { otpRequestSchema, otpVerifySchema } from "@/lib/validation";

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

const OTP_TTL_MINS = 10;
const OTP_MAX_ATTEMPTS = 5;
const GRANT_TTL_MINS = 5;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Delivery point for the one-time code.
 * No SMS provider is configured, so the code is logged server-side and —
 * in non-production only — echoed back to the caller so the demo is usable.
 * Swap this body for Twilio/MSG91/etc. to send real SMS messages.
 */
async function sendOtpCode(destination: string, code: string) {
  console.log(`[OTP] code for ${destination}: ${code}`);
}

export const otpService = {
  /**
   * Step 1 — validate email+password. Admins skip OTP; customers and
   * providers get a challenge and must verify the code (step 2).
   */
  async request(input: OtpRequestInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    if (user.role === "ADMIN") {
      return { requiresOtp: false as const };
    }

    // One active challenge per user — invalidate older ones.
    await prisma.otpChallenge.deleteMany({ where: { userId: user.id } });

    const code = String(randomInt(100000, 1000000));
    const challenge = await prisma.otpChallenge.create({
      data: {
        userId: user.id,
        codeHash: sha256(code),
        expiresAt: new Date(Date.now() + OTP_TTL_MINS * 60_000),
      },
    });

    await sendOtpCode(user.email, code);

    return {
      requiresOtp: true as const,
      challengeId: challenge.id,
      // Demo convenience only — never returned in production.
      devCode: process.env.NODE_ENV === "production" ? undefined : code,
    };
  },

  /**
   * Step 2 — verify the 6-digit code and mint a single-use login grant.
   */
  async verify(input: OtpVerifyInput) {
    const challenge = await prisma.otpChallenge.findUnique({
      where: { id: input.challengeId },
      include: { user: true },
    });
    if (!challenge) {
      throw new ApiError(404, "Verification session expired. Request a new code.", "CHALLENGE_NOT_FOUND");
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      await prisma.otpChallenge.delete({ where: { id: challenge.id } });
      throw new ApiError(410, "Code expired. Request a new one.", "CODE_EXPIRED");
    }
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.otpChallenge.delete({ where: { id: challenge.id } });
      throw new ApiError(429, "Too many wrong attempts. Request a new code.", "TOO_MANY_ATTEMPTS");
    }

    if (!safeEqualHex(sha256(input.code), challenge.codeHash)) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new ApiError(401, "Incorrect code. Try again.", "INVALID_CODE");
    }

    await prisma.otpChallenge.delete({ where: { id: challenge.id } });

    const token = randomBytes(32).toString("hex");
    await prisma.loginGrant.create({
      data: {
        userId: challenge.userId,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + GRANT_TTL_MINS * 60_000),
      },
    });

    return { email: challenge.user.email, loginToken: token };
  },

  /** Consumed by the Credentials provider — single use, short lived. */
  async consumeGrant(email: string, loginToken: string) {
    const grant = await prisma.loginGrant.findUnique({
      where: { tokenHash: sha256(loginToken) },
      include: { user: true },
    });
    if (
      !grant ||
      grant.usedAt ||
      grant.expiresAt.getTime() < Date.now() ||
      grant.user.email.toLowerCase() !== email.toLowerCase()
    ) {
      return null;
    }
    await prisma.loginGrant.update({
      where: { id: grant.id },
      data: { usedAt: new Date() },
    });
    return grant.user;
  },
};