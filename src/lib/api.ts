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
