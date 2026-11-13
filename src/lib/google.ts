import { DateTime } from 'luxon';
import { rules, meeting } from '../booking.config';
import { dayKey, type Interval } from './slots';

const env = (k: string): string | undefined =>
  (typeof process !== 'undefined' ? process.env[k] : undefined) ?? (import.meta.env as Record<string, string | undefined>)[k];

const CAL = 'https://www.googleapis.com/calendar/v3';
const calendarId = () => env('GOOGLE_CALENDAR_ID') || 'primary';
const busyCalendars = () => [calendarId(), ...(env('BUSY_CALENDAR_IDS') ?? '').split(',').map((s) => s.trim()).filter(Boolean)];

/** True when Google credentials are missing: the API serves fake data instead. */
export const isDemo = () => !(env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET') && env('GOOGLE_REFRESH_TOKEN'));

let token: { value: string; expires: number } | null = null;
async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env('GOOGLE_CLIENT_ID')!, client_secret: env('GOOGLE_CLIENT_SECRET')!,
      refresh_token: env('GOOGLE_REFRESH_TOKEN')!, grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, expires: Date.now() + j.expires_in * 1000 };
  return token.value;
}

async function gfetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CAL}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`Google Calendar ${path.split('?')[0]} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ---------- Demo mode: deterministic fake calendar + in-memory bookings ----------
const demoBooked: Interval[] = [];
function demoBusy(from: number, to: number): Interval[] {
  const out: Interval[] = [...demoBooked];
  for (let d = DateTime.fromMillis(from, { zone: rules.timezone }).startOf('day'); d.toMillis() < to; d = d.plus({ days: 1 })) {
    out.push({ start: d.set({ hour: 12 }).toMillis(), end: d.set({ hour: 13 }).toMillis() }); // lunch
    if (d.day % 2 === 0) out.push({ start: d.set({ hour: 10 }).toMillis(), end: d.set({ hour: 11, minute: 30 }).toMillis() });
    if (d.day % 3 === 0) out.push({ start: d.set({ hour: 14, minute: 30 }).toMillis(), end: d.set({ hour: 16 }).toMillis() });
  }
  return out;
}
function demoCounts(from: number, to: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let d = DateTime.fromMillis(from, { zone: rules.timezone }).startOf('day'); d.toMillis() < to; d = d.plus({ days: 1 }))
    if (d.day % 7 === 0) out[d.toISODate()!] = rules.maxPerDay; // a fully booked day now and then
  for (const b of demoBooked) { const k = dayKey(b.start, rules.timezone); out[k] = (out[k] ?? 0) + 1; }
  return out;
}

// ---------- Public API ----------
export async function getBusy(from: number, to: number): Promise<Interval[]> {
  if (isDemo()) return demoBusy(from, to);
  const j = await gfetch<{ calendars: Record<string, { busy: { start: string; end: string }[]; errors?: unknown[] }> }>('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: new Date(from).toISOString(), timeMax: new Date(to).toISOString(), items: busyCalendars().map((id) => ({ id })) }),
  });
  return Object.values(j.calendars).flatMap((c) => c.busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) })));
}

/** Number of site bookings per day (YYYY-MM-DD in rules.timezone). */
export async function getBookingCounts(from: number, to: number): Promise<Record<string, number>> {
  if (isDemo()) return demoCounts(from, to);
  const q = new URLSearchParams({
    timeMin: new Date(from).toISOString(), timeMax: new Date(to).toISOString(),
    singleEvents: 'true', maxResults: '250', privateExtendedProperty: 'booking=site',
  });
  const j = await gfetch<{ items: { status: string; start: { dateTime?: string } }[] }>(`/calendars/${encodeURIComponent(calendarId())}/events?${q}`);
  const out: Record<string, number> = {};
  for (const e of j.items) {
    if (e.status === 'cancelled' || !e.start.dateTime) continue;
    const k = dayKey(Date.parse(e.start.dateTime), rules.timezone);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export interface BookingInput { start: string; name: string; email: string; company: string; topic: string; timeline: string; timezone: string }

export async function createBooking(b: BookingInput): Promise<{ start: string; end: string; meetLink: string | null; demo: boolean }> {
  const start = Date.parse(b.start);
  const end = start + rules.durationMin * 60_000;
  const iso = (ms: number) => new Date(ms).toISOString();
  if (isDemo()) {
    demoBooked.push({ start, end });
    return { start: iso(start), end: iso(end), meetLink: null, demo: true };
  }
  const description = [
    meeting.description, '',
    `Name: ${b.name}`, `Email: ${b.email}`, `Company: ${b.company || '—'}`,
    `Working on: ${b.topic}`, `Timeline: ${b.timeline || '—'}`, `Their time zone: ${b.timezone}`, '',
    'Booked through the website. To reschedule, reply to this invite.',
  ].join('\n');
  const ev = await gfetch<{ hangoutLink?: string }>(
    `/calendars/${encodeURIComponent(calendarId())}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      body: JSON.stringify({
        summary: meeting.summary(b.name),
        description,
        start: { dateTime: iso(start), timeZone: rules.timezone },
        end: { dateTime: iso(end), timeZone: rules.timezone },
        attendees: [{ email: b.email, displayName: b.name }],
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
        extendedProperties: { private: { booking: 'site' } },
        reminders: { useDefault: true },
      }),
    },
  );
  return { start: iso(start), end: iso(end), meetLink: ev.hangoutLink ?? null, demo: false };
}
