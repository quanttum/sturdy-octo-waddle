import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { rules } from '../../booking.config';
import { isSlotOpen } from '../../lib/slots';
import { getBusy, getBookingCounts, createBooking } from '../../lib/google';

export const prerender = false;

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const hits = new Map<string, number[]>(); // best-effort per-instance rate limit
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
};
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  // Honeypot: real people never fill this hidden field.
  if (str(body.website, 200)) return json({ error: 'Invalid request' }, 400);

  const input = {
    start: str(body.start, 40),
    name: str(body.name, 100),
    email: str(body.email, 254),
    company: str(body.company, 120),
    topic: str(body.topic, 1000),
    timeline: str(body.timeline, 120),
    timezone: str(body.timezone, 64) || rules.timezone,
  };
  const errors: Record<string, string> = {};
  if (!input.name) errors.name = 'Please enter your name.';
  if (!EMAIL.test(input.email)) errors.email = 'Please enter a valid email address.';
  if (!input.topic) errors.topic = 'Tell me briefly what you are working on.';
  if (!DateTime.fromISO(input.start).isValid) errors.start = 'Please pick a time.';
  if (Object.keys(errors).length) return json({ error: 'Please check the form.', fields: errors }, 422);

  let ip = 'unknown';
  try { ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress; } catch { /* no address in some runtimes */ }
  if (limited(ip)) return json({ error: 'Too many attempts. Please try again in a few minutes.' }, 429);

  try {
    // Re-check against the live calendar so two people can't take the same slot.
    const s = DateTime.fromISO(input.start).setZone(rules.timezone);
    const from = s.startOf('day').toMillis(), to = s.endOf('day').toMillis();
    const [busy, counts] = await Promise.all([getBusy(from, to), getBookingCounts(from, to)]);
    if (!isSlotOpen(rules, busy, counts, Date.now(), input.start))
      return json({ error: 'Sorry, that time was just taken. Please pick another.' }, 409);
    return json(await createBooking(input), 201);
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong creating the booking. Please try again or email me.' }, 502);
  }
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
