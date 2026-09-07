const ID = /^[\w-]{11}$/;

// Returns the 11-char video id, or null when the input is not a YouTube video.
export function parseVideoId(input) {
  const s = (input || '').trim();
  if (ID.test(s)) return s;
  let url;
  try { url = new URL(s); } catch { return null; }
  const candidate = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  return candidate && ID.test(candidate) ? candidate : null;
}

let apiPromise;
function loadApi() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT);
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

// Wraps a YouTube iframe player behind play/pause/seekTo/load.
export async function createPlayer(elementId, videoId) {
  const YT = await loadApi();
  let loop = true;
  const player = await new Promise((resolve) => {
    const p = new YT.Player(elementId, {
      videoId,
      playerVars: { playsinline: 1 },
      events: {
        onReady: () => resolve(p),
        onStateChange: (e) => { if (loop && e.data === YT.PlayerState.ENDED) { p.seekTo(0); p.playVideo(); } },
      },
    });
  });
  let current = videoId;
  return {
    play: () => player.playVideo(),
    pause: () => player.pauseVideo(),
    seekTo: (s) => player.seekTo(s, true),
    load(id, opts) {
      loop = opts.loop;
      if (id !== current) { current = id; player.cueVideoById(id); }
    },
  };
}
