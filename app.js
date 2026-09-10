import { phaseAt } from './schedule.js';
import { parseYouTube, createPlayer } from './youtube.js';
import { createAudioPlayer } from './audio.js';
import { createController } from './controller.js';
import { withPolicy } from './policy.js';
import { loadSettings, saveSettings } from './settings.js';
import { saveFile, loadFile } from './store.js';
import { isSpaceToggle } from './hotkey.js';

const KINDS = ['work', 'break'];
const $ = (id) => document.getElementById(id);
const els = { start: $('start'), stop: $('stop'), phase: $('phase'), countdown: $('countdown'), clock: $('clock'), status: $('status') };

// Dev override: ?at=HH:MM:SS shifts the clock so phase changes can be watched now.
const offset = (() => {
  const at = new URLSearchParams(location.search).get('at');
  if (!at) return 0;
  const [h, m, s = 0] = at.split(':').map(Number);
  const fake = new Date();
  fake.setHours(h, m, s, 0);
  return fake - Date.now();
})();
const now = () => new Date(Date.now() + offset);
document.getElementById('clock-label').textContent = offset ? 'Pretend time' : 'Now';

const settings = loadSettings(localStorage);
const persist = () => saveSettings(localStorage, settings);
const yt = {};
const audio = {};
const blobs = {}; // loaded once per track, so a re-Start keeps the playback position
let controller = null;

const pad = (n) => String(n).padStart(2, '0');
const hms = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
const label = (phase) => (phase === 'work' ? 'Work' : 'Break');

function render() {
  const t = now();
  const { phase, remainingMs } = phaseAt(t);
  els.clock.textContent = hms(t);
  els.phase.textContent = label(phase);
  els.countdown.textContent = mmss(remainingMs);
  document.body.dataset.phase = phase;
  document.title = `${mmss(remainingMs)} ${label(phase)} · pmTomato`;
  if (controller?.running) controller.setPhase(phase);
}

function say(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle('error', isError);
}

// Settings form: one block per track, every change saved at once.
function bindForm(kind) {
  const s = settings[kind];
  const sourceRadios = document.querySelectorAll(`input[name="source-${kind}"]`);
  const url = $(`url-${kind}`), file = $(`file-${kind}`), fileName = $(`filename-${kind}`);
  const once = $(`once-${kind}`), resume = $(`resume-${kind}`), limit = $(`limit-${kind}`), card = $(`card-${kind}`);
  const volume = $(`volume-${kind}`), volumeValue = $(`volume-value-${kind}`);

  const show = () => {
    sourceRadios.forEach((r) => { r.checked = r.value === s.source; });
    card.dataset.source = s.source;
    url.value = s.url;
    fileName.textContent = s.fileName || 'No file yet';
    once.checked = s.once;
    resume.checked = s.resume;
    limit.value = s.limitSec ?? '';
    volume.value = s.volume;
    volumeValue.textContent = s.volume;
  };
  sourceRadios.forEach((r) => r.addEventListener('change', () => { s.source = r.value; persist(); show(); }));
  url.addEventListener('input', () => { s.url = url.value; persist(); });
  once.addEventListener('change', () => { s.once = once.checked; persist(); });
  resume.addEventListener('change', () => { s.resume = resume.checked; persist(); });
  limit.addEventListener('input', () => { const n = Number(limit.value); s.limitSec = n > 0 ? n : null; persist(); });
  volume.addEventListener('input', () => {
    s.volume = Number(volume.value);
    volumeValue.textContent = s.volume;
    persist();
    yt[kind]?.setVolume(s.volume);
    audio[kind]?.setVolume(s.volume);
  });
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    await saveFile(kind, f);
    blobs[kind] = f;
    s.fileName = f.name;
    persist();
    show();
  });
  show();
}

const SILENT = { play() {}, pause() {} };

async function buildPlayer(kind) {
  const s = settings[kind];
  if (s.source === 'none') return SILENT;
  const opts = { loop: !s.once };
  let base;
  if (s.source === 'youtube') {
    const target = parseYouTube(s.url);
    if (!target) throw new Error(`${label(kind)}: paste a YouTube video or playlist link.`);
    yt[kind] ??= await createPlayer(`player-${kind}`);
    await yt[kind].load(target, opts);
    base = yt[kind];
  } else {
    const blob = (blobs[kind] ??= await loadFile(kind));
    if (!blob) throw new Error(`${label(kind)}: choose an audio file.`);
    audio[kind] ??= createAudioPlayer(`audio-${kind}`);
    audio[kind].load(blob, opts);
    base = audio[kind];
  }
  base.setVolume(s.volume);
  return withPolicy(base, { limitSec: s.limitSec, resume: s.resume });
}

async function start() {
  els.start.disabled = true;
  say('Loading…');
  Object.values(yt).forEach((p) => p.pause());
  Object.values(audio).forEach((p) => p.pause());
  const players = {};
  for (const kind of KINDS) players[kind] = await buildPlayer(kind);
  controller = createController(players);
  controller.start(phaseAt(now()).phase);
  els.stop.disabled = false;
  document.body.classList.add('running');
  say('Running. Music swaps at :25, :30, :55 and :00.');
}

function stop() {
  controller.stop();
  els.start.disabled = false;
  els.stop.disabled = true;
  document.body.classList.remove('running');
  say('Stopped.');
}

KINDS.forEach(bindForm);
els.start.addEventListener('click', () => start().catch((e) => { say(e.message, true); els.start.disabled = false; }));
els.stop.addEventListener('click', stop);
// Key presses inside a YouTube frame never reach the page. Hand focus back.
window.addEventListener('blur', () => {
  const a = document.activeElement;
  if (a?.tagName === 'IFRAME') setTimeout(() => a.blur(), 0);
});
document.addEventListener('keydown', (e) => {
  if (!isSpaceToggle(e)) return;
  e.preventDefault();
  const btn = els.stop.disabled ? els.start : els.stop;
  if (!btn.disabled) btn.click();
});
render();
setInterval(render, 500);
