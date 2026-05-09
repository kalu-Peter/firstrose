import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { villas } from "@/data/villas";
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

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string;

function buildWhatsAppMessage(villaName?: string, checkIn?: string, checkOut?: string, room?: number | null) {
  let msg = `Hi, I'd like to book at Firstrose Villas, Mwabungo Diani.`;
  if (villaName) msg += `\n\nVilla: ${villaName}`;
  if (room)      msg += ` — Room ${room}`;
  if (checkIn)   msg += `\nCheck-in: ${checkIn}`;
  if (checkOut)  msg += `\nCheck-out: ${checkOut}`;
  msg += `\n\nCould you confirm availability and pricing? Thank you.`;
  return msg;
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function ContactPage() {
  const [villaId, setVillaId]           = useState(villas[0]?.id ?? "");
  const [checkIn, setCheckIn]           = useState("");
  const [checkOut, setCheckOut]         = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading]           = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState("");

  const villa   = villas.find((v) => v.id === villaId);
  const is3Bed  = villaId === "3bed-upper-floor";
  const minStay = villa?.minStay ?? 1;

  const checkOutMin = checkIn
    ? (() => {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + minStay);
        return d.toISOString().split("T")[0];
      })()
    : addDays(minStay);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (is3Bed && !selectedRoom) {
      setError("Please select a room number.");
      return;
    }

    const fd = new FormData(e.currentTarget);

    setLoading(true);
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          villa_name:  villa?.name ?? villaId,
          room_number: selectedRoom ? `Room ${selectedRoom}` : "Whole villa",
          check_in:    checkIn,
          check_out:   checkOut,
          guest_name:  fd.get("name") as string,
          email:       fd.get("email") as string,
          phone:       fd.get("phone") as string,
          guests:      fd.get("guests") as string,
          message:     fd.get("message") as string,
        },
        PUBLIC_KEY,
      );
      setSubmitted(true);
    } catch {
      setError("Failed to send your inquiry. Please try WhatsApp or email us directly.");
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
            Your request has been received. We'll be in touch within 24 hours.
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
            onChange={(e) => { setVillaId(e.target.value); setSelectedRoom(null); }}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {villas.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Room selection for 3-bed */}
        {is3Bed && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Room <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              {[1, 2, 3].map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                    selectedRoom === room
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-primary"
                  }`}
                >
                  Room {room}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedRoom(0)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                  selectedRoom === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary"
                }`}
              >
                Whole floor
              </button>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Check-in</label>
            <input
              type="date"
              required
              min={addDays(0)}
              value={checkIn}
              onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
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
              disabled={!checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </div>

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
          <label className="mb-2 block text-sm font-medium text-foreground">Message (optional)</label>
          <textarea
            name="message"
            rows={4}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Anything we should know?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
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

function Field({ label, name, type = "text", ...rest }: {
  label: string; name: string; type?: string;
  required?: boolean; defaultValue?: string; min?: string;
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
