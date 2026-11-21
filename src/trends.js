/**
 * Seven-day, local-calendar activity from saved typing session metrics.
 * No typed passage, names, raw keystrokes, or network requests are involved.
 */
function dayKey(date) {
  return [String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
}

/**
 * Aggregate the most recent seven local calendar dates, including today.
 * @param {Array<{finishedAt:string,wpm:number,accuracy:number}>} records
 * @param {Date} now
 */
export function weeklyActivity(records, now = new Date()) {
  if (!Array.isArray(records) || records.length > 1000) {
    throw new RangeError('Weekly view supports up to 1,000 sessions.');
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('A valid current date is required.');
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - 6);
  const days = [];
  const byDay = new Map();
  for (let index = 0; index < 7; index++) {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const day = { date: dayKey(date), sessions: 0, totalWpm: 0, totalAccuracy: 0 };
    days.push(day);
    byDay.set(day.date, day);
  }
  for (const record of records) {
    if (!record || typeof record.finishedAt !== 'string' ||
        !Number.isFinite(record.wpm) || record.wpm < 0 || record.wpm > 10000 ||
        !Number.isFinite(record.accuracy) || record.accuracy < 0 || record.accuracy > 100) {
      continue;
    }
    const finished = new Date(record.finishedAt);
    if (!Number.isFinite(finished.getTime())) continue;
    const day = byDay.get(dayKey(finished));
    if (!day) continue;
    day.sessions++;
    day.totalWpm += record.wpm;
    day.totalAccuracy += record.accuracy;
  }
  const totalSessions = days.reduce((sum, day) => sum + day.sessions, 0);
  const sumWpm = days.reduce((sum, day) => sum + day.totalWpm, 0);
  const sumAccuracy = days.reduce((sum, day) => sum + day.totalAccuracy, 0);
  return {
    days: days.map(day => ({
      date: day.date,
      sessions: day.sessions,
      averageWpm: day.sessions ? Math.round(day.totalWpm / day.sessions) : null,
      averageAccuracy: day.sessions ? Math.round(day.totalAccuracy / day.sessions) : null,
    })),
    totalSessions,
    activeDays: days.filter(day => day.sessions).length,
    averageWpm: totalSessions ? Math.round(sumWpm / totalSessions) : null,
    averageAccuracy: totalSessions ? Math.round(sumAccuracy / totalSessions) : null,
    advisory: 'This summary uses only completed sessions stored in the current browser.',
  };
}
