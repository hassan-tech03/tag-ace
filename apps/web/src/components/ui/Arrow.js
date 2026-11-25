// Inline SVG arrow for "Shop now →"-style labels. The "→" text glyph sits at
// the font's x-height, so next to uppercase/letter-spaced text it looks low;
// an SVG box centred by the parent's flex alignment lines up exactly.
// Parent should be inline-flex + align-items: center (see .with-arrow).
export default function Arrow({ dir = 'right', className = '' }) {
  return (
    <svg
      className={`ui-arrow${dir === 'left' ? ' ui-arrow--left' : ''}${className ? ` ${className}` : ''}`}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </svg>
  );
}
