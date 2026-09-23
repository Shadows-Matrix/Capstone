import { redirect } from "next/navigation";

// Signup now happens through the unified email-OTP screen at /login:
// email → 6-digit code → details → account created. This keeps old links working.
export default function RegisterPage() {
  redirect("/login");
}