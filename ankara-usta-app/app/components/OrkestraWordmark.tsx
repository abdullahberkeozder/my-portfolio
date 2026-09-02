/** Original monoline lettering inspired by the supplied fluid geometric reference.
 * Each path is one editable letter; no external font is required.
 */
export const wordmarkLetters = [
  { letter: 'O', d: 'M70 54C70 26 59 10 38 10S6 26 6 54s11 44 32 44 32-16 32-44Z' },
  { letter: 'R', d: 'M92 96V12h24c24 0 35 8 35 24 0 17-12 25-35 25H92m28 0c10 7 18 21 33 35' },
  { letter: 'K', d: 'M176 12v84m55-84c-13 15-29 31-55 45m24-17c6 20 17 38 34 56' },
  { letter: 'E', d: 'M306 12h-27c-18 0-25 9-25 26v33c0 17 7 25 25 25h27m-52-43h45' },
  { letter: 'S', d: 'M383 20c-9-8-20-11-31-9-17 2-25 11-24 24 1 13 13 18 29 23 17 5 26 10 26 22 0 13-12 20-28 18-12-1-22-6-29-13' },
  { letter: 'T', d: 'M401 12h63m-31 0v84' },
  { letter: 'R', d: 'M485 96V12h24c24 0 35 8 35 24 0 17-12 25-35 25h-24m28 0c10 7 18 21 33 35' },
  { letter: 'A', d: 'M567 96c0-58 7-86 29-86s29 28 29 86m-55-31h52' },
];

export default function OrkestraWordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <svg width="154" height="28" viewBox="0 0 636 108" role="img" aria-label="Orkestra" focusable="false"
      fill="none" stroke={inverse ? 'var(--brand-yellow, #FFDD00)' : 'var(--brand-cobalt, #1246B5)'}
      strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {wordmarkLetters.map(({ letter, d }, index) => <path key={`${letter}-${index}`} data-letter={letter} d={d} />)}
    </svg>
  );
}
