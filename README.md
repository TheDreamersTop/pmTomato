# 🍅 pmTomato

A Pomodoro timer locked to the wall clock. Press Start once and it loops all day:

| Minute | Phase |
|---|---|
| :00 – :25 | Work |
| :25 – :30 | Break |
| :30 – :55 | Work |
| :55 – :00 | Break |

Each track, work and break, has its own source and rules:

- **Source**: a YouTube video or playlist link, or an audio file from your disk. The file is kept
  in the browser's IndexedDB, so it survives reloads on that browser.
- **Play once**: do not loop. Off means loop.
- **Resume where it left off**: continue from where the track was paused or cut.
  Off means start from the beginning at each phase start.
- **Stop after N seconds**: cut playback after N seconds each time it starts.
  Blank means no limit.

Every setting is saved as you change it and restored on reload.

At each boundary the app pauses one track and plays the other.

## Use

Open `index.html` from a static server, set both tracks, press Start.
Live at https://thedreamerstop.github.io/pmTomato/.

```bash
npm run serve        # http://127.0.0.1:8766
```

Debug clock: append `?at=HH:MM:SS` to pretend it is that time, e.g.
`?at=14:24:50` to watch the :25 swap ten seconds after loading.

## Files

- `schedule.js` — `phaseAt(date)` maps a time to `{ phase, endsAt, remainingMs }`.
- `controller.js` — decides which player to play or pause on a phase change.
- `policy.js` — wraps a player with the resume and stop-after rules.
- `youtube.js` — YouTube video and playlist link parsing, and a thin IFrame API wrapper.
- `audio.js` — a hidden `<audio>` element behind the same play/pause interface.
- `settings.js` — load and save settings in `localStorage` with defaults.
- `store.js` — save and load audio files in IndexedDB.
- `app.js` — wires the form, ticker, and players together.
- `tests/` — Vitest unit tests for the logic modules.

## Test

```bash
npm test
```

## Limits

- Music must play inside the page. A browser tab cannot pause Spotify, Apple
  Music, or another app. Controlling Spotify would need its Web API and a
  Premium account.
- Audio files stay in the browser that picked them. Another browser or device
  needs the file picked again.
- Playback needs one click on Start. Browsers block sound that starts without a
  user gesture.
- Some YouTube videos refuse to embed. Pick another link if a player stays blank.
