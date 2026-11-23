/** A transient custom Hebrew practice passage; never store this content. */
export function prepareCustomPassage(value) {
  if (typeof value !== 'string') throw new TypeError('Custom passage must be text.');
  const passage = value.replace(/\r\n?/g, '\n').trim();
  if (passage.length < 10 || passage.length > 800 || !/[\u05d0-\u05ea]/u.test(passage) ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069\u200e\u200f]/u.test(passage)) {
    throw new RangeError('Expected a bounded Hebrew passage without control or bidirectional override characters.');
  }
  return passage;
}
