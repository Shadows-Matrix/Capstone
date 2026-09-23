import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SERVEX",
  description: "How SERVEX handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p>SERVEX collects only what it needs to run the marketplace: your name, email, phone, city, bookings, reviews and messages.</p>
        <p>Passwords are stored as one-way bcrypt hashes and are never readable. One-time login codes are stored as hashes, expire quickly, and are single-use.</p>
        <p>We never sell your data. Provider profiles, service listings and reviews you publish are visible to other users; everything else stays private to your account.</p>
        <p>Contact support@servex.local to request export or deletion of your data.</p>
      </div>
    </div>
  );
}