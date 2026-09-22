import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { otpService } from "@/services/otp.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().optional().default(""),
  // Present only after a successful OTP verification (customers/providers).
  loginToken: z.string().min(1).optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginToken: { label: "Login token", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, loginToken } = parsed.data;

        // OTP-verified path (customers & providers after code verification).
        if (loginToken) {
          const user = await otpService.consumeGrant(email, loginToken);
          if (!user) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !password) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Password-only sign-in is reserved for admins — everyone else
        // must complete OTP verification (single-use login grant above).
        if (user.role !== "ADMIN") return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});