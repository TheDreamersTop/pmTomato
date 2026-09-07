# 🍅 pmTomato

A Pomodoro timer locked to the wall clock. Press Start once and it loops all day:

| Minute | Phase |
|---|---|
| :00 – :25 | Work |
| :25 – :30 | Break |
| :30 – :55 | Work |
| :55 – :00 | Break |

Two YouTube players live on the page: one for work music, one for break music.
At each boundary the app pauses one and plays the other. When work resumes, the
work track continues from where it was paused.

## Use

Open `index.html` from a static server, paste two YouTube links, press Start.
Links are remembered in `localStorage`.

```bash
npm run serve        # http://127.0.0.1:8766
```

Debug clock: append `?at=HH:MM:SS` to pretend it is that time, e.g.
`?at=14:24:50` to watch the :25 swap ten seconds after loading.

## Files

- `schedule.js` — `phaseAt(date)` maps a time to `{ phase, endsAt, remainingMs }`.
- `controller.js` — decides which player to play or pause on a phase change.
- `youtube.js` — YouTube link parsing and a thin IFrame API wrapper.
- `app.js` — wires the UI, ticker, and players together.
- `tests/` — Vitest unit tests for the three logic modules.

## Test

```bash
npm test
```

## Limits

- Music must play inside the page. A browser tab cannot pause Spotify, Apple
  Music, or another app. Controlling Spotify would need its Web API and a
  Premium account.
- Playback needs one click on Start. Browsers block sound that starts without a
  user gesture.
- Some YouTube videos refuse to embed. Pick another link if a player stays blank.
