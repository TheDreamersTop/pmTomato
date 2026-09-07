import { describe, it, expect } from 'vitest';
import { parseYouTube } from '../youtube.js';

describe('parseYouTube: videos and playlists, in the shapes people paste', () => {
  it('watch URL is a video', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=jfKfPfyJRdk')).toEqual({ videoId: 'jfKfPfyJRdk' });
  });
  it('watch URL with extra params', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=jfKfPfyJRdk&t=42s')).toEqual({ videoId: 'jfKfPfyJRdk' });
  });
  it('youtu.be short link', () => {
    expect(parseYouTube('https://youtu.be/jfKfPfyJRdk?si=abc')).toEqual({ videoId: 'jfKfPfyJRdk' });
  });
  it('bare 11-char id', () => {
    expect(parseYouTube('jfKfPfyJRdk')).toEqual({ videoId: 'jfKfPfyJRdk' });
  });
  it('playlist page URL is a playlist', () => {
    expect(parseYouTube('https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-'))
      .toEqual({ listId: 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-' });
  });
  it('a watch URL inside a playlist counts as the playlist', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=jfKfPfyJRdk&list=UUSJ4gkVC6NrvII8umztf0Ow&index=3'))
      .toEqual({ listId: 'UUSJ4gkVC6NrvII8umztf0Ow' });
  });
  it('garbage returns null so the UI can complain', () => {
    expect(parseYouTube('not a url')).toBeNull();
    expect(parseYouTube('')).toBeNull();
    expect(parseYouTube('https://www.youtube.com/playlist?list=')).toBeNull();
  });
});
