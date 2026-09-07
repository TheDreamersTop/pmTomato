import { phaseAt } from './schedule.js';
import { parseVideoId, createPlayer } from './youtube.js';
import { createController } from './controller.js';

const $ = (id) => document.getElementById(id);
const els = {
  workUrl: $('work-url'), breakUrl: $('break-url'),
  start: $('start'), stop: $('stop'),
  phase: $('phase'), countdown: $('countdown'), clock: $('clock'), status: $('status'),
};

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

const players = {};
let controller = null;
let timer = null;

const pad = (n) => String(n).padStart(2, '0');
const hms = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };

function render() {
  const t = now();
  const { phase, remainingMs } = phaseAt(t);
  els.clock.textContent = hms(t);
  els.phase.textContent = phase === 'work' ? 'Work' : 'Break';
  els.countdown.textContent = mmss(remainingMs);
  document.body.dataset.phase = phase;
  document.title = `${mmss(remainingMs)} ${phase === 'work' ? 'Work' : 'Break'} · pmTomato`;
  if (controller?.running) controller.setPhase(phase);
}

function say(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle('error', isError);
}

async function start() {
  const ids = { work: parseVideoId(els.workUrl.value), break: parseVideoId(els.breakUrl.value) };
  if (!ids.work || !ids.break) return say('Paste a YouTube link for both work and break.', true);
  localStorage.setItem('pmTomato.workUrl', els.workUrl.value);
  localStorage.setItem('pmTomato.breakUrl', els.breakUrl.value);

  els.start.disabled = true;
  say('Loading players…');
  for (const kind of ['work', 'break']) {
    if (players[kind]) players[kind].load(ids[kind]);
    else players[kind] = await createPlayer(`player-${kind}`, ids[kind]);
  }
  controller ??= createController(players);
  controller.start(phaseAt(now()).phase);
  els.stop.disabled = false;
  document.body.classList.add('running');
  say('Running. Music swaps on its own at :25, :30, :55 and :00.');
}

function stop() {
  controller.stop();
  els.start.disabled = false;
  els.stop.disabled = true;
  document.body.classList.remove('running');
  say('Stopped.');
}

els.workUrl.value = localStorage.getItem('pmTomato.workUrl') ?? '';
els.breakUrl.value = localStorage.getItem('pmTomato.breakUrl') ?? 'https://www.youtube.com/watch?v=lTRiuFIWV54';
els.start.addEventListener('click', () => start().catch((e) => { say(e.message, true); els.start.disabled = false; }));
els.stop.addEventListener('click', stop);
render();
timer = setInterval(render, 500);
