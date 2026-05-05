import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  adminLogin,
  adminLogout,
  getBookings,
  updateBooking,
  type Booking,
} from "@/lib/api";

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
      </main>
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
