/**
 * Adaptive Hebrew typing practice derived from locally aggregated mistakes.
 * Stores only character counts, never passages or typed text.
 */
const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ';
const FALLBACK = ['ש', 'ד', 'ג', 'כ', 'ע', 'י'];
const MAX_COUNT = 1_000_000;

/** Sanitize persisted mistake counters, including malformed browser storage. */
export function cleanMistakes(value) {
  const clean = Object.create(null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
  // Look up only the fixed 27 Hebrew letters, regardless of how many
  // unrelated keys are present or in what order a storage object was built.
  // Slicing the first 40 object entries could previously discard every
  // legitimate letter if corrupt or hostile storage had 40 junk keys first.
  // Own-property checks also exclude inherited dictionary/prototype values.
  for (const letter of LETTERS) {
    if (!Object.hasOwn(value, letter)) continue;
    const count = value[letter];
    if (!Number.isSafeInteger(count) || count <= 0) continue;
    clean[letter] = Math.min(count, MAX_COUNT);
  }
  return clean;
}

/** Merge per-session expected-character errors into the local aggregate. */
export function mergeMistakes(stored, session) {
  const result = cleanMistakes(stored);
  for (const [letter, count] of Object.entries(cleanMistakes(session))) {
    result[letter] = Math.min(MAX_COUNT, (result[letter] || 0) + count);
  }
  return result;
}
export function weakKeys(mistakes, limit = 5) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 12) throw new RangeError('Invalid key limit.');
  return Object.entries(cleanMistakes(mistakes))
    .sort((a, b) => b[1] - a[1] || LETTERS.indexOf(a[0]) - LETTERS.indexOf(b[0]))
    .slice(0, limit).map(([letter, count]) => ({ letter, count }));
}

/**
 * Build a repeatable right-to-left drill. It contains no personal text:
 * only Hebrew letters appearing in the public keyboard alphabet.
 */
export function createAdaptiveTarget(mistakes) {
  const ranked = weakKeys(mistakes, 5).map(entry => entry.letter);
  const focus = ranked.length ? ranked : FALLBACK;
  const chunks = [];
  // Isolated repetition to reinforce keyboard location, then alternating pairs.
  for (const letter of focus) chunks.push(letter.repeat(3));
  for (let round = 0; round < 3; round++) {
    for (let index = 0; index < focus.length; index++) {
      const first = focus[(index + round) % focus.length];
      const second = focus[(index + round + 1) % focus.length];
      chunks.push(first + second + first + second);
    }
  }
  return chunks.join(' ');
}
