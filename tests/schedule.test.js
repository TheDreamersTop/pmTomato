import { describe, it, expect } from 'vitest';
import { phaseAt } from '../schedule.js';

// Local time, fixed date. Only the minute within the hour matters.
const at = (h, m, s = 0) => new Date(2026, 8, 7, h, m, s);

describe('phaseAt: the hour is split :00 work, :25 break, :30 work, :55 break', () => {
  it('top of the hour starts a work block that ends at :25', () => {
    const r = phaseAt(at(14, 0));
    expect(r.phase).toBe('work');
    expect(r.endsAt).toEqual(at(14, 25));
  });

  it('the last second before :25 is still work', () => {
    expect(phaseAt(at(14, 24, 59)).phase).toBe('work');
  });

  it(':25 to :30 is a break', () => {
    const r = phaseAt(at(14, 25));
    expect(r.phase).toBe('break');
    expect(r.endsAt).toEqual(at(14, 30));
  });

  it(':30 to :55 is work', () => {
    const r = phaseAt(at(14, 30));
    expect(r.phase).toBe('work');
    expect(r.endsAt).toEqual(at(14, 55));
  });

  it(':55 break ends at the next top of the hour', () => {
    const r = phaseAt(at(14, 55));
    expect(r.phase).toBe('break');
    expect(r.endsAt).toEqual(at(15, 0));
  });

  it('rolls over midnight: 23:57 break ends at 00:00 next day', () => {
    const r = phaseAt(at(23, 57));
    expect(r.phase).toBe('break');
    expect(r.endsAt).toEqual(new Date(2026, 8, 8, 0, 0, 0));
  });

  it('remainingMs counts down to the phase end, seconds included', () => {
    expect(phaseAt(at(14, 10, 30)).remainingMs).toBe((14 * 60 + 30) * 1000);
  });
});
