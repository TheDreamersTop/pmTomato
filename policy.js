// Wraps a player (play, pause, seekTo) with rules:
// resume off: start from 0 on every play. limitSec: pause after that many seconds.
// once is handled by the player's loop flag, not here.
export function withPolicy(base, { limitSec, resume }) {
  let timer = null;
  const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
  return {
    play() {
      clear();
      if (!resume) base.seekTo(0);
      base.play();
      if (limitSec) timer = setTimeout(() => { timer = null; base.pause(); }, limitSec * 1000);
    },
    pause() {
      clear();
      base.pause();
    },
  };
}
