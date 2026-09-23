import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SERVEX",
  description: "The rules for using SERVEX.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p>By using SERVEX you agree to provide accurate information, use the platform lawfully, and treat other users respectfully.</p>
        <p>Customers book services directly with providers; SERVEX provides discovery, booking management, reviews and messaging. Service quality is the provider&apos;s responsibility.</p>
        <p>Providers must honour confirmed bookings or cancel in good time. Fake reviews, spam and abuse lead to suspension.</p>
        <p>Bookings may be cancelled per the status rules shown in your dashboard. Payments in this release are simulated for demonstration.</p>
      </div>
    </div>
  );
}