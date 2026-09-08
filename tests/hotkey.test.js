import { describe, it, expect } from 'vitest';
import { isSpaceToggle } from '../hotkey.js';

const ev = (key, tagName, extra = {}) => ({ key, target: { tagName, isContentEditable: false, ...extra } });

describe('isSpaceToggle: Space toggles the timer unless the user is typing', () => {
  it('Space on the page body toggles', () => {
    expect(isSpaceToggle(ev(' ', 'BODY'))).toBe(true);
  });
  it('other keys do nothing', () => {
    expect(isSpaceToggle(ev('Enter', 'BODY'))).toBe(false);
  });
  it('Space inside a text box types a space instead', () => {
    expect(isSpaceToggle(ev(' ', 'INPUT'))).toBe(false);
    expect(isSpaceToggle(ev(' ', 'TEXTAREA'))).toBe(false);
  });
  it('Space on a focused button is left to the button itself', () => {
    expect(isSpaceToggle(ev(' ', 'BUTTON'))).toBe(false);
  });
  it('Space with a modifier is not the hotkey', () => {
    expect(isSpaceToggle({ ...ev(' ', 'BODY'), metaKey: true })).toBe(false);
  });
});
