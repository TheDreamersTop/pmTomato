// A hidden <audio> element behind play/pause/seekTo/load, fed from a Blob.
export function createAudioPlayer(id) {
  const el = document.createElement('audio');
  el.id = id;
  el.preload = 'auto';
  document.body.appendChild(el);
  let url = null;
  let loaded = null;
  return {
    play: () => el.play().catch(() => {}),
    pause: () => el.pause(),
    seekTo: (s) => { el.currentTime = s; },
    load(blob, opts) {
      el.loop = opts.loop;
      if (blob === loaded) return;
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      el.src = url;
      loaded = blob;
    },
  };
}
