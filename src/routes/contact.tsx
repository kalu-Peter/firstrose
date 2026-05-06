import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { villas } from "@/data/villas";
import { submitBooking, checkAvailability, calculatePrice, type Availability, type PricingResult } from "@/lib/api";
import { whatsappUrl } from "@/lib/config";

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

function buildWhatsAppMessage(
  villaName?: string,
  checkIn?: string,
  checkOut?: string,
  room?: number | null,
): string {
  let msg = `Hi, I'd like to book at Firstrose Villas, Mwabungo Diani.`;
  if (villaName) msg += `\n\nVilla: ${villaName}`;
  if (room) msg += ` — Room ${room}`;
  if (checkIn)  msg += `\nCheck-in: ${checkIn}`;
  if (checkOut) msg += `\nCheck-out: ${checkOut}`;
  msg += `\n\nCould you confirm availability and pricing? Thank you.`;
  return msg;
}

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

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
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

        {/* WhatsApp alternative */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <a
          href={whatsappUrl(buildWhatsAppMessage(villa?.name, checkIn, checkOut, selectedRoom))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:opacity-90"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Book via WhatsApp
        </a>
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
