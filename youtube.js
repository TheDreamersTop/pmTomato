const ID = /^[\w-]{11}$/;

// Returns { videoId } or { listId }, or null when the input is not YouTube.
// A watch link inside a playlist counts as the playlist.
export function parseYouTube(input) {
  const s = (input || '').trim();
  if (ID.test(s)) return { videoId: s };
  let url;
  try { url = new URL(s); } catch { return null; }
  const listId = url.searchParams.get('list');
  if (listId) return { listId };
  const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  return videoId && ID.test(videoId) ? { videoId } : null;
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
// target is { videoId } or { listId }. Playlists loop through setLoop; a single
// video loops by replaying on ENDED.
export async function createPlayer(elementId) {
  const YT = await loadApi();
  let loop = true;
  let current = null;
  const player = await new Promise((resolve) => {
    const p = new YT.Player(elementId, {
      playerVars: { playsinline: 1 },
      events: {
        onReady: () => resolve(p),
        onStateChange: (e) => {
          if (loop && current?.videoId && e.data === YT.PlayerState.ENDED) { p.seekTo(0); p.playVideo(); }
        },
        // A playlist entry that refuses to embed would stall the whole list. Skip it.
        onError: () => { if (current?.listId) p.nextVideo(); },
      },
    });
  });
  const { PLAYING, PAUSED, BUFFERING, ENDED, CUED } = YT.PlayerState;
  // An empty player already reports CUED, so also check the right thing is loaded.
  const isCued = (target) => player.getPlayerState() === CUED
    && (target.listId ? player.getPlaylistId() === target.listId : player.getVideoData()?.video_id === target.videoId);
  const settled = (target) => new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => (isCued(target) || Date.now() - t0 > 5000 ? resolve() : setTimeout(tick, 50));
    tick();
  });
  return {
    play() {
      // playVideo() only works once something has started. Right after a cue the
      // state is null, then CUED, and playVideo() is dropped. Use the loaders then.
      if ([PLAYING, PAUSED, BUFFERING, ENDED].includes(player.getPlayerState())) player.playVideo();
      else if (current?.listId) player.playVideoAt(Math.max(0, player.getPlaylistIndex()));
      else player.loadVideoById(current.videoId);
    },
    pause: () => player.pauseVideo(),
    setVolume: (v) => player.setVolume(v),
    seekTo(s) { if (current?.listId) player.playVideoAt(0); else player.seekTo(s, true); },
    // Resolves once the cue has settled. Calls made while a cue is in flight are dropped.
    async load(target, opts) {
      loop = opts.loop;
      const key = target.listId ?? target.videoId;
      if (key !== (current?.listId ?? current?.videoId)) {
        current = target;
        if (target.listId) player.cuePlaylist({ listType: 'playlist', list: target.listId });
        else player.cueVideoById(target.videoId);
        await settled(target);
      }
      player.setLoop(!!target.listId && loop);
    },
  };
}
