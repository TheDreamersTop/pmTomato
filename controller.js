// Decides which player runs. Players expose play() and pause().
export function createController(players) {
  let phase = null;
  const c = {
    running: false,
    start(current) {
      c.running = true;
      phase = current;
      players[current].play();
    },
    stop() {
      c.running = false;
      phase = null;
      players.work.pause();
      players.break.pause();
    },
    setPhase(next) {
      if (!c.running || next === phase) return;
      players[phase].pause();
      players[next].play();
      phase = next;
    },
  };
  return c;
}
