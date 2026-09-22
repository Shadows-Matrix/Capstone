import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? "587");
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM ?? USER ?? "SERVEX <no-reply@servex.local>";

export const mailConfigured = Boolean(HOST && USER && PASS);

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!mailConfigured) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }
  await getTransporter().sendMail({ from: FROM, to, subject, html, text });
}

export function otpEmailHtml(code: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e5e5;border-radius:12px">
    <h2 style="margin:0 0 8px">Your SERVEX verification code</h2>
    <p style="color:#555">Enter this code to finish signing in. It expires in 10 minutes.</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#f4f4f4;border-radius:8px;padding:16px;margin:16px 0">${code}</div>
    <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}
