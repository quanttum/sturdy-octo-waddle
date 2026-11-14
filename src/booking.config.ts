// All scheduling rules live here. Times are in `timezone`.
export type Weekly = Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, [string, string][]>>; // 1 = Monday

export interface BookingRules {
  timezone: string;
  weekly: Weekly;
  durationMin: number;
  bufferMin: number;
  slotStepMin: number;
  minNoticeHours: number;
  horizonDays: number;
  maxPerDay: number;
}

export const rules: BookingRules = {
  timezone: 'America/Vancouver',
  weekly: {
    1: [['09:00', '17:00']],
    2: [['09:00', '17:00']],
    3: [['09:00', '17:00']],
    4: [['09:00', '17:00']],
    5: [['09:00', '17:00']],
  },
  durationMin: 30,
  bufferMin: 15,
  slotStepMin: 30,
  minNoticeHours: 24,
  horizonDays: 30,
  maxPerDay: 4,
};

export const meeting = {
  title: '30-minute intro call',
  summary: (name: string) => `Intro call: ${name} <> Alexander Strelkov`,
  description:
    'What you want to launch or fix, your constraints, and whether I am the right fit.',
  location: 'Google Meet',
};
