import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { computeSlots, isSlotOpen } from '../src/lib/slots';
import { rules } from '../src/booking.config';

const tz = rules.timezone;
const at = (iso: string) => DateTime.fromISO(iso, { zone: tz }).toMillis();
const local = (s: string[]) => s.map((x) => DateTime.fromISO(x).setZone(tz).toFormat('HH:mm'));
const noCap = { ...rules, maxPerDay: 99 };
// "now" well before the test days so notice/horizon don't interfere
const NOW = at('2026-11-01T08:00');

describe('computeSlots', () => {
  it('offers 9:00–16:30 starts on a weekday', () => {
    const s = computeSlots(noCap, [], {}, NOW, '2026-11-16', '2026-11-16'); // Monday
    expect(local(s)).toEqual(['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']);
  });

  it('skips weekends', () => {
    expect(computeSlots(noCap, [], {}, NOW, '2026-11-14', '2026-11-15')).toEqual([]);
  });

  it('keeps a 15-minute buffer around busy time', () => {
    const busy = [{ start: at('2026-11-16T11:00'), end: at('2026-11-16T12:00') }];
    const s = local(computeSlots(noCap, busy, {}, NOW, '2026-11-16', '2026-11-16'));
    expect(s).not.toContain('10:30'); // ends 11:00, needs buffer until 11:15
    expect(s).not.toContain('11:00');
    expect(s).not.toContain('12:00'); // busy ended 12:00, buffer to 12:15
    expect(s).toContain('10:00');
    expect(s).toContain('12:30');
  });

  it('enforces 24h minimum notice', () => {
    const now = at('2026-11-16T10:10');
    const s = computeSlots(noCap, [], {}, now, '2026-11-16', '2026-11-17');
    expect(s.every((x) => DateTime.fromISO(x).toMillis() >= now + 24 * 3600_000)).toBe(true);
    expect(local(s)[0]).toBe('10:30'); // Tue 10:30 is the first start ≥ 24h away
  });

  it('enforces the 30-day horizon', () => {
    const s = computeSlots(noCap, [], {}, NOW, '2026-12-14', '2026-12-14');
    expect(s).toEqual([]);
  });

  it('caps bookings per day', () => {
    expect(computeSlots(rules, [], { '2026-11-16': 4 }, NOW, '2026-11-16', '2026-11-16')).toEqual([]);
    expect(computeSlots(rules, [], { '2026-11-16': 3 }, NOW, '2026-11-16', '2026-11-16')).toHaveLength(16);
  });

  it('follows DST changes in the configured zone', () => {
    // Vancouver is on permanent UTC-7 from 2026 in current tz data, so test with New York.
    const ny = { ...noCap, timezone: 'America/New_York' };
    const nyAt = (iso: string) => DateTime.fromISO(iso, { zone: 'America/New_York' }).toMillis();
    const before = computeSlots(ny, [], {}, nyAt('2026-10-25T08:00'), '2026-10-30', '2026-10-30');
    const after = computeSlots(ny, [], {}, nyAt('2026-10-25T08:00'), '2026-11-02', '2026-11-02');
    expect(before[0]).toBe('2026-10-30T13:00:00Z'); // 9:00 EDT
    expect(after[0]).toBe('2026-11-02T14:00:00Z'); // 9:00 EST
  });

  it('isSlotOpen agrees with computeSlots', () => {
    expect(isSlotOpen(noCap, [], {}, NOW, '2026-11-16T16:00:00Z')).toBe(true); // 9:00 Vancouver (UTC-7)
    expect(isSlotOpen(noCap, [], {}, NOW, '2026-11-16T16:10:00Z')).toBe(false); // off-grid
    expect(isSlotOpen(noCap, [], {}, NOW, '2026-11-14T16:00:00Z')).toBe(false); // Saturday
  });
});
