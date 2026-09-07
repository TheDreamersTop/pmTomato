import { describe, it, expect } from 'vitest';
import { createController } from '../controller.js';

// A fake player that records what it was told to do.
function fakePlayer() {
  return { log: [], play() { this.log.push('play'); }, pause() { this.log.push('pause'); } };
}

function setup() {
  const work = fakePlayer();
  const brk = fakePlayer();
  const c = createController({ work, break: brk });
  return { c, work, brk };
}

describe('controller: the point of the app is swapping music on phase change', () => {
  it('start during work plays work music only', () => {
    const { c, work, brk } = setup();
    c.start('work');
    expect(work.log).toEqual(['play']);
    expect(brk.log).toEqual([]);
  });

  it('start during break plays break music only', () => {
    const { c, work, brk } = setup();
    c.start('break');
    expect(work.log).toEqual([]);
    expect(brk.log).toEqual(['play']);
  });

  it('work -> break pauses work and plays break', () => {
    const { c, work, brk } = setup();
    c.start('work');
    c.setPhase('break');
    expect(work.log).toEqual(['play', 'pause']);
    expect(brk.log).toEqual(['play']);
  });

  it('break -> work pauses break and resumes work', () => {
    const { c, work, brk } = setup();
    c.start('break');
    c.setPhase('work');
    expect(brk.log).toEqual(['play', 'pause']);
    expect(work.log).toEqual(['play']);
  });

  it('same phase reported again is a no-op (ticker fires every second)', () => {
    const { c, work, brk } = setup();
    c.start('work');
    c.setPhase('work');
    c.setPhase('work');
    expect(work.log).toEqual(['play']);
    expect(brk.log).toEqual([]);
  });

  it('phase changes while stopped touch no player', () => {
    const { c, work, brk } = setup();
    c.setPhase('break');
    c.setPhase('work');
    expect(work.log).toEqual([]);
    expect(brk.log).toEqual([]);
  });

  it('stop pauses both', () => {
    const { c, work, brk } = setup();
    c.start('work');
    c.stop();
    expect(work.log).toEqual(['play', 'pause']);
    expect(brk.log).toEqual(['pause']);
    expect(c.running).toBe(false);
  });
});
