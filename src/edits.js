/**
 * Isolate text newly inserted between the preceding and current textarea
 * values. Unlike comparing only their lengths, this handles replacing a
 * selected character (same total length), inserting in the middle, and
 * corrections that retain a shared suffix.
 *
 * The returned indices use JavaScript UTF-16 offsets into the target string.
 * This is deliberately a small editor diff, not a keystroke reconstruction
 * or a guarantee that every input event came from a physical keyboard.
 */
export function insertedSegment(previous, current) {
  if (typeof previous !== 'string' || typeof current !== 'string' ||
      previous.length > 10_000 || current.length > 10_000) {
    throw new RangeError('Typing input must be bounded text.');
  }
  let start = 0;
  const shorter = Math.min(previous.length, current.length);
  while (start < shorter && previous[start] === current[start]) start++;
  let oldEnd = previous.length, newEnd = current.length;
  while (oldEnd > start && newEnd > start &&
         previous[oldEnd - 1] === current[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  return { start, inserted: current.slice(start, newEnd) };
}
