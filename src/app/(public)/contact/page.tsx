import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact — SERVEX",
  description: "Get in touch with the SERVEX team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-2 text-muted-foreground">
        Questions about a booking, your provider account, or anything else? Reach out.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, title: "Email", text: "support@servex.local" },
          { icon: Phone, title: "Phone", text: "+91 98765 43210" },
          { icon: MapPin, title: "Office", text: "Tiruchirappalli, Tamil Nadu" },
        ].map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5 text-center">
              <c.icon className="mx-auto size-6 text-primary" />
              <p className="mt-2 font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        We aim to reply within one business day. For urgent issues with an ongoing booking,
        use the in-app messages on your booking.
      </p>
    </div>
  );
}