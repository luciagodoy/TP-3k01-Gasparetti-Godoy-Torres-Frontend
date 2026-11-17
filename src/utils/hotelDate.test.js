import { describe, it, expect } from 'vitest';
import { displayDate, hotelToday } from './hotelDate';

describe('hotelToday', () => {
  // 02:30 UTC del 10/11 todavía es el 9/11 en Argentina (UTC-3).
  it('usa la fecha de Argentina y no la UTC', () => {
    expect(hotelToday(new Date('2026-11-10T02:30:00Z'))).toBe('2026-11-09');
    expect(hotelToday(new Date('2026-11-10T03:00:00Z'))).toBe('2026-11-10');
  });
});

describe('displayDate', () => {
  it('pasa de YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(displayDate('2026-11-04')).toBe('04/11/2026');
    expect(displayDate(undefined)).toBe('');
  });
});
