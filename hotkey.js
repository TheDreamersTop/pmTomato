const TYPING = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);

// True when a keydown should toggle Start/Stop: plain Space, not aimed at a control.
export function isSpaceToggle(e) {
  if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return false;
  const t = e.target;
  return !TYPING.has(t.tagName) && !t.isContentEditable;
}
