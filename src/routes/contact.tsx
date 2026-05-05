import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { villas } from "@/data/villas";
import { submitBooking, checkAvailability, calculatePrice, type Availability, type PricingResult } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Your Stay — Firstrose" },
      { name: "description", content: "Send us your booking inquiry — we'll respond within 24 hours." },
      { property: "og:title", content: "Book Your Stay — Firstrose" },
    ],
  }),
  component: ContactPage,
});

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function ContactPage() {
  const [villaId, setVillaId]           = useState(villas[0]?.id ?? "");
  const [checkIn, setCheckIn]           = useState("");
  const [checkOut, setCheckOut]         = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [avail, setAvail]               = useState<Availability | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [pricing, setPricing]           = useState<PricingResult | null>(null);
  const [loading, setLoading]           = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState("");

  const villa    = villas.find((v) => v.id === villaId);
  const is3Bed   = villaId === "3bed-upper-floor";
  const minStay  = villa?.minStay ?? 1;
  const minCheckIn  = addDays(0); // today — no past dates
  const minCheckOut = addDays(minStay); // fallback before check-in chosen

  // Check-out must be at least minStay days after check-in
  const checkOutMin = checkIn
    ? (() => {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + minStay);
        return d.toISOString().split("T")[0];
      })()
    : minCheckOut;

  // Reset room + availability when villa or dates change
  useEffect(() => {
    setSelectedRoom(null);
    setAvail(null);
  }, [villaId]);

  useEffect(() => {
    setSelectedRoom(null);
    setPricing(null);
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setAvail(null);
      return;
    }
    setAvailLoading(true);
    Promise.all([
      checkAvailability(villaId, checkIn, checkOut),
      calculatePrice(villaId, checkIn, checkOut),
    ])
      .then(([av, pr]) => { setAvail(av); setPricing(pr); })
      .catch(() => { setAvail(null); setPricing(null); })
      .finally(() => setAvailLoading(false));
  }, [villaId, checkIn, checkOut]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (is3Bed && !selectedRoom) {
      setError("Please select a room.");
      return;
    }
    if (avail?.fully_blocked) {
      setError("No availability for the selected dates.");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitBooking({
        villa_id:    villaId,
        villa_name:  villa?.name ?? villaId,
        guest_name:  fd.get("name") as string,
        email:       fd.get("email") as string,
        phone:       fd.get("phone") as string,
        check_in:    checkIn,
        check_out:   checkOut,
        guests:      Number(fd.get("guests")),
        message:     fd.get("message") as string,
        room_number: selectedRoom ?? undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="rounded-2xl bg-accent/40 p-10 text-center">
          <h2 className="font-serif text-2xl text-foreground">Thank you ✦</h2>
          <p className="mt-3 text-muted-foreground">
            Your request has been received. We'll be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Booking Inquiry</p>
      <h1 className="font-serif text-5xl text-foreground md:text-6xl">Reserve your villa</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Share a few details and our team will reply within 24 hours with confirmation.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-6">
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Villa */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Villa</label>
          <select
            value={villaId}
            onChange={(e) => setVillaId(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {villas.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {is3Bed && (
            <p className="mt-1 text-xs text-muted-foreground">
              Min. {minStay} nights · 45% discount for monthly stays
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Check-in</label>
            <input
              type="date"
              required
              min={minCheckIn}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Check-out</label>
            <input
              type="date"
              required
              min={checkOutMin}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={!checkIn}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Availability */}
        {checkIn && checkOut && (
          <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
            {availLoading ? (
              <p className="text-sm text-muted-foreground">Checking availability…</p>
            ) : avail ? (
              avail.fully_blocked ? (
                <p className="text-sm font-medium text-destructive">
                  {is3Bed ? "All rooms are booked" : "Fully booked"} for these dates.
                </p>
              ) : is3Bed ? (
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    {avail.available_count} of 3 room{avail.available_count !== 1 ? "s" : ""} available
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3].map((room) => {
                      const free = avail.available_rooms.includes(room);
                      return (
                        <button
                          key={room}
                          type="button"
                          disabled={!free}
                          onClick={() => setSelectedRoom(free ? room : null)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                            selectedRoom === room
                              ? "border-primary bg-primary text-primary-foreground"
                              : free
                              ? "border-border text-foreground hover:border-primary hover:text-primary"
                              : "border-border/40 text-muted-foreground/40 cursor-not-allowed line-through"
                          }`}
                        >
                          Room {room}
                        </button>
                      );
                    })}
                  </div>
                  {selectedRoom && (
                    <p className="mt-2 text-xs text-muted-foreground">Room {selectedRoom} selected</p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-emerald-700">Available for these dates ✓</p>
              )
            ) : null}

            {/* Price breakdown */}
            {!availLoading && pricing && !avail?.fully_blocked && (
              <div className={`${avail ? "mt-4 border-t border-border/40 pt-3" : ""}`}>
                <PriceBreakdown pricing={pricing} is3Bed={is3Bed} />
              </div>
            )}
          </div>
        )}

        {/* Guest info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Full Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Guests" name="guests" type="number" defaultValue="1" min="1" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Message (optional)
          </label>
          <textarea
            name="message"
            rows={4}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Anything we should know?"
          />
        </div>

        <button
          type="submit"
          disabled={loading || availLoading || !!avail?.fully_blocked || (is3Bed && !!checkIn && !!checkOut && !selectedRoom)}
          className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Sending…" : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}

function PriceBreakdown({ pricing, is3Bed }: { pricing: PricingResult; is3Bed: boolean }) {
  // Group consecutive days with the same price + label
  const segments: { price: number; label: string | null; nights: number }[] = [];
  pricing.daily_prices.forEach((day) => {
    const last = segments[segments.length - 1];
    if (last && last.price === day.price && last.label === day.label) {
      last.nights++;
    } else {
      segments.push({ price: day.price, label: day.label, nights: 1 });
    }
  });

  return (
    <div className="space-y-1 text-sm">
      {segments.length > 1 && segments.map((seg, i) => (
        <div key={i} className="flex justify-between text-muted-foreground">
          <span>
            {seg.nights} night{seg.nights !== 1 ? "s" : ""}
            {seg.label ? ` · ${seg.label}` : ""}
          </span>
          <span>KSH {(seg.price * seg.nights).toLocaleString()}</span>
        </div>
      ))}
      <div className="flex justify-between font-medium text-foreground">
        <span>
          Total · {pricing.nights} night{pricing.nights !== 1 ? "s" : ""}
          {is3Bed ? " · per room" : ""}
        </span>
        <span>KSH {pricing.total_price.toLocaleString()}</span>
      </div>
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
