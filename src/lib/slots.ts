import { DateTime } from 'luxon';
import type { BookingRules } from '../booking.config';

export interface Interval { start: number; end: number } // epoch ms

/** Calendar date (YYYY-MM-DD) of an instant in the rules' timezone. */
export const dayKey = (ms: number, tz: string) => DateTime.fromMillis(ms, { zone: tz }).toISODate()!;

/**
 * Open slot start times (ISO, UTC) between two calendar dates (inclusive, in rules.timezone).
 * `bookingsPerDay` maps YYYY-MM-DD → number of site bookings already on that day;
 * a day that has reached `maxPerDay` offers no slots.
 */
export function computeSlots(
  rules: BookingRules,
  busy: Interval[],
  bookingsPerDay: Record<string, number>,
  now: number,
  fromDate: string,
  toDate: string,
): string[] {
  const tz = rules.timezone;
  const dur = rules.durationMin * 60_000;
  const buf = rules.bufferMin * 60_000;
  const earliest = now + rules.minNoticeHours * 3_600_000;
  const latest = now + rules.horizonDays * 86_400_000;
  const out: string[] = [];

  let day = DateTime.fromISO(fromDate, { zone: tz }).startOf('day');
  const last = DateTime.fromISO(toDate, { zone: tz }).startOf('day');
  if (!day.isValid || !last.isValid) return out;

  for (; day <= last; day = day.plus({ days: 1 })) {
    const key = day.toISODate()!;
    if ((bookingsPerDay[key] ?? 0) >= rules.maxPerDay) continue;
    const windows = rules.weekly[day.weekday as 1] ?? [];
    for (const [from, to] of windows) {
      const [fh, fm] = from.split(':').map(Number);
      const [th, tm] = to.split(':').map(Number);
      // Built from wall-clock time in the zone, so DST is handled by luxon.
      let t = day.set({ hour: fh, minute: fm });
      const end = day.set({ hour: th, minute: tm });
      for (; t.plus({ minutes: rules.durationMin }) <= end; t = t.plus({ minutes: rules.slotStepMin })) {
        const s = t.toMillis();
        if (s < earliest || s > latest) continue;
        const clash = busy.some((b) => b.start < s + dur + buf && b.end > s - buf);
        if (!clash) out.push(t.toUTC().toISO({ suppressMilliseconds: true })!);
      }
    }
  }
  return out;
}

/** Is this exact start time one of the open slots right now? */
export function isSlotOpen(
  rules: BookingRules, busy: Interval[], bookingsPerDay: Record<string, number>, now: number, startIso: string,
): boolean {
  const start = DateTime.fromISO(startIso);
  if (!start.isValid) return false;
  const key = dayKey(start.toMillis(), rules.timezone);
  const target = start.toUTC().toISO({ suppressMilliseconds: true });
  return computeSlots(rules, busy, bookingsPerDay, now, key, key).includes(target!);
}
