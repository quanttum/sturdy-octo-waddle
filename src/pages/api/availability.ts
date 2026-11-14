import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { rules } from '../../booking.config';
import { computeSlots } from '../../lib/slots';
import { getBusy, getBookingCounts, isDemo } from '../../lib/google';

export const prerender = false;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const GET: APIRoute = async ({ url }) => {
  const tz = rules.timezone;
  const today = DateTime.now().setZone(tz).toISODate()!;
  const from = url.searchParams.get('from') ?? today;
  const to = url.searchParams.get('to') ?? DateTime.fromISO(today, { zone: tz }).plus({ days: rules.horizonDays }).toISODate()!;
  const start = DateTime.fromISO(from, { zone: tz }).startOf('day');
  const end = DateTime.fromISO(to, { zone: tz }).endOf('day');
  if (!DATE.test(from) || !DATE.test(to) || !start.isValid || !end.isValid || end < start || end.diff(start, 'days').days > 32)
    return json({ error: 'Invalid date range' }, 400);
  try {
    const [busy, counts] = await Promise.all([
      getBusy(start.toMillis(), end.toMillis()),
      getBookingCounts(start.toMillis(), end.toMillis()),
    ]);
    const slots = computeSlots(rules, busy, counts, Date.now(), from, to);
    return json({ timezone: tz, durationMin: rules.durationMin, demo: isDemo(), slots }, 200, { 'cache-control': 'public, s-maxage=60' });
  } catch (e) {
    console.error(e);
    return json({ error: 'Could not load availability' }, 502);
  }
};

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
