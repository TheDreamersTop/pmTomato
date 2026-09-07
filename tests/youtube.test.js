import { describe, it, expect } from 'vitest';
import { parseVideoId } from '../youtube.js';

describe('parseVideoId: accepts the URL shapes people actually paste', () => {
  it('watch URL', () => {
    expect(parseVideoId('https://www.youtube.com/watch?v=jfKfPfyJRdk')).toBe('jfKfPfyJRdk');
  });
  it('watch URL with extra params', () => {
    expect(parseVideoId('https://www.youtube.com/watch?v=jfKfPfyJRdk&t=42s')).toBe('jfKfPfyJRdk');
  });
  it('youtu.be short link', () => {
    expect(parseVideoId('https://youtu.be/jfKfPfyJRdk?si=abc')).toBe('jfKfPfyJRdk');
  });
  it('bare 11-char id', () => {
    expect(parseVideoId('jfKfPfyJRdk')).toBe('jfKfPfyJRdk');
  });
  it('garbage returns null so the UI can complain', () => {
    expect(parseVideoId('not a url')).toBeNull();
    expect(parseVideoId('')).toBeNull();
  });
});
