import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withPolicy } from '../policy.js';

function base() {
  return { log: [], play() { this.log.push('play'); }, pause() { this.log.push('pause'); }, seekTo(s) { this.log.push(`seek:${s}`); } };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('withPolicy: once restarts the clip, limit cuts it short', () => {
  it('no policy passes play and pause straight through', () => {
    const b = base();
    const p = withPolicy(b, { once: false, limitSec: null });
    p.play(); p.pause();
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('loop mode resumes where it left off, so no seek', () => {
    const b = base();
    withPolicy(b, { once: false, limitSec: null }).play();
    expect(b.log).toEqual(['play']);
  });

  it('once restarts from the beginning on every play', () => {
    const b = base();
    const p = withPolicy(b, { once: true, limitSec: null });
    p.play(); p.pause(); p.play();
    expect(b.log).toEqual(['seek:0', 'play', 'pause', 'seek:0', 'play']);
  });

  it('limit pauses the player after that many seconds', () => {
    const b = base();
    withPolicy(b, { once: false, limitSec: 10 }).play();
    vi.advanceTimersByTime(9999);
    expect(b.log).toEqual(['play']);
    vi.advanceTimersByTime(1);
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('a manual pause cancels the pending limit', () => {
    const b = base();
    const p = withPolicy(b, { once: false, limitSec: 10 });
    p.play(); p.pause();
    vi.advanceTimersByTime(20000);
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('the limit applies again on the next play', () => {
    const b = base();
    const p = withPolicy(b, { once: false, limitSec: 5 });
    p.play(); vi.advanceTimersByTime(5000);
    p.play(); vi.advanceTimersByTime(5000);
    expect(b.log).toEqual(['play', 'pause', 'play', 'pause']);
  });
});
