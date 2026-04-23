import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { villas } from "@/data/villas";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Your Stay — Firstrose" },
      {
        name: "description",
        content: "Send us your booking inquiry — we'll respond within 24 hours.",
      },
      { property: "og:title", content: "Book Your Stay — Firstrose" },
      {
        property: "og:description",
        content: "Send us your booking inquiry — we'll respond within 24 hours.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Booking Inquiry</p>
      <h1 className="font-serif text-5xl text-foreground md:text-6xl">Reserve your villa</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Share a few details and our team will reply within 24 hours with availability and pricing.
      </p>

      {submitted ? (
        <div className="mt-12 rounded-2xl bg-accent/40 p-10 text-center">
          <h2 className="font-serif text-2xl text-foreground">Thank you ✦</h2>
          <p className="mt-3 text-muted-foreground">
            Your request has been received. We'll be in touch soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-12 space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Check-in" name="checkin" type="date" required />
            <Field label="Check-out" name="checkout" type="date" required />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Villa</label>
              <select
                name="villa"
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {villas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.location}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Guests" name="guests" type="number" defaultValue="2" min="1" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Message (optional)
            </label>
            <textarea
              name="message"
              rows={5}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Anything we should know?"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-[1.02] hover:bg-primary/90"
          >
            Send Inquiry
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <input
        name={name}
        type={type}
        {...rest}
        className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
