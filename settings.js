const KEY = 'pmTomato.settings';

const track = (url) => ({ source: 'youtube', url, fileName: '', once: false, resume: true, limitSec: null, volume: 100 });

export const DEFAULTS = {
  work: track(''),
  break: track('https://www.youtube.com/watch?v=lTRiuFIWV54'),
};

export function loadSettings(storage) {
  let saved = {};
  try { saved = JSON.parse(storage.getItem(KEY)) ?? {}; } catch { saved = {}; }
  return {
    work: { ...DEFAULTS.work, ...saved.work },
    break: { ...DEFAULTS.break, ...saved.break },
  };
}

export function saveSettings(storage, settings) {
  storage.setItem(KEY, JSON.stringify(settings));
}
