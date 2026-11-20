const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost/firstrose/backend'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BookingPayload {
  villa_id: string
  villa_name: string
  guest_name: string
  email: string
  phone?: string
  check_in: string
  check_out: string
  guests: number
  message?: string
  room_number?: number
}

export interface Availability {
  villa_id: string
  total_rooms: number
  available_rooms: number[]
  booked_rooms: number[]
  available_count: number
  fully_blocked: boolean
}

export interface PriceDay {
  date: string
  price: number
  label: string | null
}

export interface PricingResult {
  villa_id: string
  nights: number
  total_price: number
  daily_prices: PriceDay[]
  currency: string
}

export function calculatePrice(villaId: string, checkIn: string, checkOut: string) {
  return request<PricingResult>(
    `/api/calculate-price.php?villa_id=${encodeURIComponent(villaId)}&check_in=${checkIn}&check_out=${checkOut}`
  )
}

export interface PricingRule {
  id: number
  villa_id: string
  room_number: number | null
  start_date: string
  end_date: string
  price: number
  label: string | null
  priority: number
  created_at: string
}

export interface BlockedDate {
  id: number
  villa_id: string
  room_number: number | null
  check_in: string
  check_out: string
  source: string
  note: string | null
  created_at: string
}

export interface BlockPayload {
  villa_id: string
  room_number?: number | null
  check_in: string
  check_out: string
  source: string
  note?: string
}

export interface Booking {
  id: number
  villa_id: string
  villa_name: string
  guest_name: string
  email: string
  phone: string
  check_in: string
  check_out: string
  guests: number
  message: string
  status: 'pending' | 'approved' | 'rejected'
  deposit_paid: boolean
  created_at: string
  updated_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ── Public ────────────────────────────────────────────────────────────────────

export function submitBooking(payload: BookingPayload) {
  return request<{ success: boolean; booking_id: number }>('/api/book.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function checkAvailability(villaId: string, checkIn: string, checkOut: string) {
  return request<Availability>(
    `/api/availability.php?villa_id=${encodeURIComponent(villaId)}&check_in=${checkIn}&check_out=${checkOut}`
  )
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function adminLogin(username: string, password: string) {
  return request<{ token: string; expires_at: string }>('/api/admin/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export function adminLogout(token: string) {
  return request<{ success: boolean }>('/api/admin/logout.php', {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export function getBookings(token: string, status?: string) {
  const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''
  return request<Booking[]>(`/api/admin/bookings.php${qs}`, {
    headers: authHeaders(token),
  })
}

export function updateBooking(token: string, id: number, action: 'approve' | 'reject' | 'toggle_deposit') {
  return request<Booking>('/api/admin/update-booking.php', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ id, action }),
  })
}

export function getPricingRules(token: string, villaId: string) {
  return request<PricingRule[]>(`/api/admin/pricing.php?villa_id=${encodeURIComponent(villaId)}`, {
    headers: authHeaders(token),
  })
}

export function addPricingRule(token: string, payload: {
  villa_id: string; room_number?: number | null; start_date: string; end_date: string;
  price: number; label?: string; priority?: number;
}) {
  return request<PricingRule>('/api/admin/pricing.php', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function removePricingRule(token: string, id: number) {
  return request<{ success: boolean }>(`/api/admin/pricing.php?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function getBlockedDates(token: string) {
  return request<BlockedDate[]>('/api/admin/blocked-dates.php', {
    headers: authHeaders(token),
  })
}

export function addBlock(token: string, payload: BlockPayload) {
  return request<BlockedDate>('/api/admin/blocked-dates.php', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function removeBlock(token: string, id: number) {
  return request<{ success: boolean }>(`/api/admin/blocked-dates.php?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
