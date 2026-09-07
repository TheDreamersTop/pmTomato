import { describe, it, expect } from 'vitest';
import { loadSettings, saveSettings, DEFAULTS } from '../settings.js';

const memStorage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

describe('settings survive a reload and never lose a field', () => {
  it('empty storage gives defaults', () => {
    expect(loadSettings(memStorage())).toEqual(DEFAULTS);
  });

  it('saved settings come back unchanged', () => {
    const s = memStorage();
    const mine = { work: { ...DEFAULTS.work, source: 'file', once: true, limitSec: 30 }, break: { ...DEFAULTS.break, url: 'x' } };
    saveSettings(s, mine);
    expect(loadSettings(s)).toEqual(mine);
  });

  it('a field added after an old save falls back to its default', () => {
    const s = memStorage();
    s.setItem('pmTomato.settings', JSON.stringify({ work: { url: 'old' } }));
    const got = loadSettings(s);
    expect(got.work.url).toBe('old');
    expect(got.work.once).toBe(DEFAULTS.work.once);
    expect(got.break).toEqual(DEFAULTS.break);
  });

  it('corrupt storage gives defaults instead of crashing', () => {
    const s = memStorage();
    s.setItem('pmTomato.settings', '{not json');
    expect(loadSettings(s)).toEqual(DEFAULTS);
  });
});
