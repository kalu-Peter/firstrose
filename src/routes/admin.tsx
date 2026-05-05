import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminLogin,
  adminLogout,
  getBookings,
  updateBooking,
  getBlockedDates,
  addBlock,
  removeBlock,
  getPricingRules,
  addPricingRule,
  removePricingRule,
  type Booking,
  type BlockedDate,
  type PricingRule,
} from "@/lib/api";
import { villas } from "@/data/villas";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Firstrose" }] }),
  component: AdminPage,
});

type Filter = "all" | "pending" | "approved" | "rejected";

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function AdminPage() {
  const [token, setToken]       = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter]     = useState<Filter>("all");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Restore session after SSR hydration
  useEffect(() => {
    const saved = localStorage.getItem("fr_admin_token");
    if (saved) setToken(saved);
  }, []);

  // ── Load bookings ───────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (tok: string, f: Filter) => {
    setLoading(true);
    setError("");
    try {
      const data = await getBookings(tok, f);
      setBookings(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bookings";
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("expired")) {
        localStorage.removeItem("fr_admin_token");
        setToken(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchBookings(token, filter);
  }, [token, filter, fetchBookings]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleUpdate(id: number, action: "approve" | "reject" | "toggle_deposit") {
    if (!token) return;
    try {
      const updated = await updateBooking(token, id, action);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleLogout() {
    if (!token) return;
    await adminLogout(token).catch(() => {});
    localStorage.removeItem("fr_admin_token");
    setToken(null);
    setBookings([]);
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    all:      bookings.length,
    pending:  bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const displayed =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (!token) return <LoginForm onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <p className="font-serif text-lg text-foreground">
            First<span className="text-primary">rose</span>{" "}
            <span className="text-sm font-sans font-normal text-muted-foreground">Admin</span>
          </p>
          <button
            onClick={handleLogout}
            className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(["all", "pending", "approved", "rejected"] as Filter[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                filter === key
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className="text-2xl font-semibold text-foreground">{stats[key]}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{key === "all" ? "Total bookings" : key}</p>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="font-serif text-lg text-foreground capitalize">
              {filter === "all" ? "All Bookings" : `${filter} Bookings`}
            </h2>
          </div>

          {loading ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : displayed.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-secondary/40">
                  <tr>
                    {["#", "Villa", "Guest", "Dates", "Guests", "Status", "Deposit", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {displayed.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{b.villa_name}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{b.guest_name}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                        {b.phone && <p className="text-xs text-muted-foreground">{b.phone}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        <p>{b.check_in}</p>
                        <p className="text-xs">→ {b.check_out}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{b.guests}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUpdate(b.id, "toggle_deposit")}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            b.deposit_paid
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {b.deposit_paid ? "Paid ✓" : "Pending"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.status !== "approved" && (
                            <button
                              onClick={() => handleUpdate(b.id, "approve")}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}
                          {b.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdate(b.id, "reject")}
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pricing calendar */}
        <PricingPanel token={token} />

        {/* Blocked dates */}
        <BlockedDatesPanel token={token} />
      </main>
    </div>
  );
}

// ── Pricing panel ─────────────────────────────────────────────────────────────

const PRICE_LABELS = ["Peak Season", "Weekend Rate", "Holiday", "Low Season", "Special Offer", "Custom"];

function fmt(price: number) {
  return price >= 1000 ? `${(price / 1000).toFixed(1)}k` : String(price);
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function PricingPanel({ token }: { token: string }) {
  const [villaId, setVillaId]     = useState(villas[0]?.id ?? "");
  const [roomNum, setRoomNum]     = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [rules, setRules]         = useState<PricingRule[]>([]);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd]   = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const villa    = villas.find((v) => v.id === villaId);
  const is3Bed   = villaId === "3bed-upper-floor";
  const defPrice = villa?.price ?? 0;

  // Load rules when villa changes
  useEffect(() => {
    setRules([]);
    setRangeStart(null);
    setRangeEnd(null);
    getPricingRules(token, villaId).then(setRules).catch(() => {});
  }, [token, villaId]);

  // Build date → rule map (highest priority wins)
  const priceMap = useMemo(() => {
    const map: Record<string, PricingRule> = {};
    const filtered = rules.filter(
      (r) => roomNum === "" ? r.room_number === null : r.room_number === null || r.room_number === Number(roomNum)
    );
    const sorted = [...filtered].sort((a, b) => a.priority - b.priority);
    sorted.forEach((rule) => {
      const s = new Date(rule.start_date + "T00:00:00");
      const e = new Date(rule.end_date   + "T00:00:00");
      for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        map[isoDate(d)] = rule;
      }
    });
    return map;
  }, [rules, roomNum]);

  // Calendar helpers
  const { year, month } = currentMonth;
  const totalDays  = daysInMonth(year, month);
  const firstDow   = new Date(year, month, 1).getDay();
  const today      = isoDate(new Date());
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selMin = rangeStart && rangeEnd ? (rangeStart < rangeEnd ? rangeStart : rangeEnd) : null;
  const selMax = rangeStart && rangeEnd ? (rangeStart > rangeEnd ? rangeStart : rangeEnd) : null;

  function handleDayClick(dateStr: string) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
    } else {
      if (dateStr < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(dateStr);
      } else {
        setRangeEnd(dateStr);
      }
    }
  }

  async function handleSave() {
    if (!rangeStart || !rangeEnd || !priceInput) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        villa_id:    villaId,
        room_number: is3Bed && roomNum !== "" ? Number(roomNum) : null,
        start_date:  rangeStart < rangeEnd ? rangeStart : rangeEnd,
        end_date:    rangeStart > rangeEnd ? rangeStart : rangeEnd,
        price:       Number(priceInput),
        label:       labelInput || undefined,
        priority:    1,
      };
      const created = await addPricingRule(token, payload);
      setRules((prev) => [...prev, created]);
      setRangeStart(null);
      setRangeEnd(null);
      setPriceInput("");
      setLabelInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await removePricingRule(token, id).catch(() => {});
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="font-serif text-lg text-foreground">Pricing Calendar</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Select a date range on the calendar, then set a custom price. Days with custom pricing are highlighted.
        </p>
      </div>

      <div className="p-6">
        {error && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Villa</label>
            <select
              value={villaId}
              onChange={(e) => { setVillaId(e.target.value); setRoomNum(""); }}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          {is3Bed && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Room</label>
              <select
                value={roomNum}
                onChange={(e) => setRoomNum(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">All rooms</option>
                <option value="1">Room 1</option>
                <option value="2">Room 2</option>
                <option value="3">Room 3</option>
              </select>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Default: <span className="font-medium text-foreground">KSH {defPrice.toLocaleString()}</span> {villa?.priceLabel}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Calendar */}
          <div>
            {/* Month nav */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(({ year: y, month: m }) =>
                  m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 }
                )}
                className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-primary hover:text-primary"
              >
                ‹
              </button>
              <span className="font-serif text-base text-foreground">{monthLabel}</span>
              <button
                onClick={() => setCurrentMonth(({ year: y, month: m }) =>
                  m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 }
                )}
                className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-primary hover:text-primary"
              >
                ›
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {/* Empty leading cells */}
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
              {/* Day cells */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum  = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const rule    = priceMap[dateStr];
                const price   = rule?.price ?? defPrice;
                const isCustom = !!rule;
                const isToday  = dateStr === today;
                const inRange  = selMin && selMax && dateStr >= selMin && dateStr <= selMax;
                const isStart  = dateStr === selMin;
                const isEnd    = dateStr === selMax;
                const isSel    = dateStr === rangeStart && !rangeEnd;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(dateStr)}
                    className={[
                      "flex flex-col items-center rounded-lg py-1.5 text-xs transition-all",
                      inRange && !isStart && !isEnd ? "bg-primary/10" : "",
                      isStart || isEnd || isSel ? "bg-primary text-primary-foreground" : "",
                      !inRange && !isStart && !isEnd && !isSel
                        ? isCustom
                          ? "bg-amber-50 hover:bg-amber-100 border border-amber-200"
                          : "hover:bg-secondary border border-transparent"
                        : "",
                      isToday && !isStart && !isEnd ? "ring-1 ring-primary ring-offset-1" : "",
                    ].join(" ")}
                  >
                    <span className="font-medium leading-none">{dayNum}</span>
                    <span className={[
                      "mt-0.5 leading-none",
                      isStart || isEnd || isSel ? "text-primary-foreground/80" : isCustom ? "text-amber-700 font-semibold" : "text-muted-foreground",
                    ].join(" ")}>
                      {fmt(price)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border border-transparent bg-secondary" />Default price
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border border-amber-200 bg-amber-50" />Custom price
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-primary" />Selected range
              </span>
            </div>
          </div>

          {/* Set price form */}
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
            <h3 className="mb-4 text-sm font-medium text-foreground">
              {rangeStart && rangeEnd
                ? `${selMin} → ${selMax}`
                : rangeStart
                ? `From ${rangeStart} — pick end date`
                : "Click a start date on the calendar"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Price (KSH)</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder={String(defPrice)}
                  disabled={!rangeEnd}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Label (optional)</label>
                <select
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  disabled={!rangeEnd}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                >
                  <option value="">None</option>
                  {PRICE_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={!rangeStart || !rangeEnd || !priceInput || saving}
                className="w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save price rule"}
              </button>
              {(rangeStart || rangeEnd) && (
                <button
                  onClick={() => { setRangeStart(null); setRangeEnd(null); }}
                  className="w-full rounded-full border border-border py-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Active rules list */}
            {rules.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Active rules</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {rules.map((r) => (
                    <div key={r.id} className="flex items-start justify-between rounded-lg border border-border/60 bg-card p-2.5">
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          KSH {Number(r.price).toLocaleString()}
                          {r.label && <span className="ml-1 text-muted-foreground">· {r.label}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.start_date} → {r.end_date}</p>
                        {r.room_number && (
                          <p className="text-xs text-muted-foreground">Room {r.room_number}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blocked dates panel ────────────────────────────────────────────────────────

const SOURCES = ["Airbnb", "Booking.com", "Vrbo", "Expedia", "Manual", "Other"];

function BlockedDatesPanel({ token }: { token: string }) {
  const [blocks, setBlocks]       = useState<BlockedDate[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState({
    villa_id: villas[0]?.id ?? "",
    room_number: "",
    check_in: "",
    check_out: "",
    source: "Airbnb",
    note: "",
  });

  const is3Bed = form.villa_id === "3bed-upper-floor";

  useEffect(() => {
    getBlockedDates(token)
      .then(setBlocks)
      .catch(() => {});
  }, [token]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const payload = {
        villa_id:    form.villa_id,
        check_in:    form.check_in,
        check_out:   form.check_out,
        source:      form.source,
        note:        form.note || undefined,
        room_number: is3Bed && form.room_number !== "" ? Number(form.room_number) : null,
      };
      const created = await addBlock(token, payload);
      setBlocks((prev) => [...prev, created].sort((a, b) => a.check_in.localeCompare(b.check_in)));
      setForm((f) => ({ ...f, check_in: "", check_out: "", note: "", room_number: "" }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add block");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: number) {
    try {
      await removeBlock(token, id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to remove block");
    }
  }

  const villaName = (id: string) => villas.find((v) => v.id === id)?.name ?? id;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="font-serif text-lg text-foreground">Block Dates</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Block date ranges from Airbnb, Booking.com, or other platforms to prevent double-booking.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="border-b border-border/60 px-6 py-5">
        {error && (
          <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Villa */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Villa</label>
            <select
              value={form.villa_id}
              onChange={(e) => setForm((f) => ({ ...f, villa_id: e.target.value, room_number: "" }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {villas.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Room (3-bed only) */}
          {is3Bed && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Room <span className="text-muted-foreground/60">(blank = all rooms)</span>
              </label>
              <select
                value={form.room_number}
                onChange={(e) => setForm((f) => ({ ...f, room_number: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">All rooms</option>
                <option value="1">Room 1</option>
                <option value="2">Room 2</option>
                <option value="3">Room 3</option>
              </select>
            </div>
          )}

          {/* Source */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Check-in</label>
            <input
              type="date"
              required
              value={form.check_in}
              onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Check-out</label>
            <input
              type="date"
              required
              min={form.check_in || undefined}
              value={form.check_out}
              onChange={(e) => setForm((f) => ({ ...f, check_out: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Booking ref #12345"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={adding}
          className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {adding ? "Blocking…" : "Block these dates"}
        </button>
      </form>

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">No dates blocked.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-secondary/40">
              <tr>
                {["Villa", "Room", "Check-in", "Check-out", "Source", "Note", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {blocks.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{villaName(b.villa_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.room_number ? `Room ${b.room_number}` : "All rooms"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.check_in}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.check_out}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                      {b.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.note ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Login form ─────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(username, password);
      localStorage.setItem("fr_admin_token", token);
      onLogin(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <p className="mb-1 font-serif text-2xl text-foreground">
          First<span className="text-primary">rose</span>
        </p>
        <p className="mb-8 text-sm text-muted-foreground">Management portal</p>

        {error && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
