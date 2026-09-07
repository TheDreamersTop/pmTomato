// Wraps a player (play, pause, seekTo) with two rules:
// once: restart from 0 on every play. limitSec: pause after that many seconds.
export function withPolicy(base, { once, limitSec }) {
  let timer = null;
  const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
  return {
    play() {
      clear();
      if (once) base.seekTo(0);
      base.play();
      if (limitSec) timer = setTimeout(() => { timer = null; base.pause(); }, limitSec * 1000);
    },
    pause() {
      clear();
      base.pause();
    },
  };
}
