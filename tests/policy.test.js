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
    const p = withPolicy(b, { once: false, limitSec: null, resume: true });
    p.play(); p.pause();
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('resume on continues where it left off, so no seek', () => {
    const b = base();
    withPolicy(b, { once: false, limitSec: null, resume: true }).play();
    expect(b.log).toEqual(['play']);
  });

  it('resume off restarts from the beginning on every play', () => {
    const b = base();
    const p = withPolicy(b, { once: true, limitSec: null, resume: false });
    p.play(); p.pause(); p.play();
    expect(b.log).toEqual(['seek:0', 'play', 'pause', 'seek:0', 'play']);
  });

  it('once with resume on picks up where the limit cut it, no seek', () => {
    const b = base();
    const p = withPolicy(b, { once: true, limitSec: 3, resume: true });
    p.play(); vi.advanceTimersByTime(3000); p.play();
    expect(b.log).toEqual(['play', 'pause', 'play']);
  });

  it('limit pauses the player after that many seconds', () => {
    const b = base();
    withPolicy(b, { once: false, limitSec: 10, resume: true }).play();
    vi.advanceTimersByTime(9999);
    expect(b.log).toEqual(['play']);
    vi.advanceTimersByTime(1);
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('a manual pause cancels the pending limit', () => {
    const b = base();
    const p = withPolicy(b, { once: false, limitSec: 10, resume: true });
    p.play(); p.pause();
    vi.advanceTimersByTime(20000);
    expect(b.log).toEqual(['play', 'pause']);
  });

  it('the limit applies again on the next play', () => {
    const b = base();
    const p = withPolicy(b, { once: false, limitSec: 5, resume: true });
    p.play(); vi.advanceTimersByTime(5000);
    p.play(); vi.advanceTimersByTime(5000);
    expect(b.log).toEqual(['play', 'pause', 'play', 'pause']);
  });
});
