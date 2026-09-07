import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { saveFile, loadFile } from '../store.js';

describe('audio files persist in IndexedDB', () => {
  it('a saved file comes back with the same bytes and name', async () => {
    const f = new File([new Uint8Array([1, 2, 3])], 'clip.mp3', { type: 'audio/mpeg' });
    await saveFile('break', f);
    const got = await loadFile('break');
    expect(got.name).toBe('clip.mp3');
    expect(new Uint8Array(await got.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('missing key returns null', async () => {
    expect(await loadFile('work')).toBeNull();
  });

  it('saving again replaces the old file', async () => {
    await saveFile('work', new File(['a'], 'a.mp3'));
    await saveFile('work', new File(['bb'], 'b.mp3'));
    const got = await loadFile('work');
    expect(got.name).toBe('b.mp3');
  });
});
