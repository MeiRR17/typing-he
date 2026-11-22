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


/**
 * Sanitize localStorage session records before they reach trend or overview
 * arithmetic. Input can be stale, manually edited or corrupt.
 */
export function cleanSessionRecords(value, { maximum = 100 } = {}) {
  if (!Array.isArray(value) || !Number.isInteger(maximum) || maximum < 1 || maximum > 1000) {
    return [];
  }
  return value.filter(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    if (typeof item.lessonId !== 'string' || !/^[a-z-]{1,32}$/.test(item.lessonId)) return false;
    if (!Number.isFinite(item.wpm) || item.wpm < 0 || item.wpm > 10000 ||
        !Number.isFinite(item.accuracy) || item.accuracy < 0 || item.accuracy > 100) return false;
    if (typeof item.finishedAt !== 'string' || item.finishedAt.length > 40) return false;
    const date = new Date(item.finishedAt);
    if (!Number.isFinite(date.getTime())) return false;
    if (item.seconds !== undefined && (!Number.isFinite(item.seconds) ||
        item.seconds < 0 || item.seconds > 24 * 3600)) return false;
    return true;
  }).slice(-maximum).map(item => ({
    lessonId: item.lessonId,
    wpm: item.wpm,
    accuracy: item.accuracy,
    seconds: item.seconds,
    finishedAt: item.finishedAt,
  }));
}

/** Seven rows of counts and daily averages; no lessons or typed text. */
export function weeklyActivityCsv(records, now = new Date()) {
  const result = weeklyActivity(records, now);
  const lines = ['date,sessions,average_wpm,average_accuracy_percent'];
  for (const day of result.days) {
    lines.push([
      day.date,
      day.sessions,
      day.averageWpm ?? '',
      day.averageAccuracy ?? '',
    ].join(','));
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}


/**
 * A seven-day, aggregate-only JSON snapshot for personal progress.
 * Deliberately omit lesson IDs, timestamps, keystrokes, target passages and
 * error counts. Dates and performance metrics may still be sensitive.
 */
export function weeklyActivityJson(records, now = new Date()) {
  const summary = weeklyActivity(records, now);
  return JSON.stringify({
    format: 'typing-he-weekly-activity-v1',
    window: {
      start: summary.days[0].date,
      end: summary.days[summary.days.length - 1].date,
      calendar: 'browser-local',
    },
    totalSessions: summary.totalSessions,
    activeDays: summary.activeDays,
    averageWpm: summary.averageWpm,
    averageAccuracyPercent: summary.averageAccuracy,
    days: summary.days.map(day => ({
      date: day.date,
      sessions: day.sessions,
      averageWpm: day.averageWpm,
      averageAccuracyPercent: day.averageAccuracy,
    })),
    advisory: 'Aggregated completed-session metrics only. No lesson IDs, typed text, individual timestamps or mistake details. Activity data may still be sensitive.',
  }, null, 2) + '\n';
}


/**
 * Compare two adjacent seven-day windows in browser-local calendar dates.
 * The current window includes today; the previous window ends seven days
 * before today. Counts can be compared even when a week is empty, but speed
 * and accuracy deltas require completed sessions in BOTH weeks.
 */
export function weeklyComparison(records, now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('A valid current date is required.');
  }
  const previousAnchor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 12);
  const current = weeklyActivity(records, now);
  const previous = weeklyActivity(records, previousAnchor);
  return {
    current,
    previous,
    sessionDifference: current.totalSessions - previous.totalSessions,
    wpmDifference: current.totalSessions && previous.totalSessions
      ? current.averageWpm - previous.averageWpm : null,
    accuracyDifference: current.totalSessions && previous.totalSessions
      ? current.averageAccuracy - previous.averageAccuracy : null,
    advisory: 'Descriptive comparison of saved practice sessions in adjacent browser-local seven-day windows, not a performance forecast.',
  };
}


/**
 * Export a two-week comparison as a strictly aggregate-only JSON report.
 * Both seven-day windows remain present even if one has zero sessions.
 * No individual records, lesson IDs, daily records, error keys or passages
 * are serialized. Dates and aggregate performance can still be sensitive.
 */
export function weeklyComparisonJson(records, now = new Date()) {
  const comparison = weeklyComparison(records, now);
  const toWindow = summary => ({
    start: summary.days[0].date,
    end: summary.days[summary.days.length - 1].date,
    totalSessions: summary.totalSessions,
    activeDays: summary.activeDays,
    averageWpm: summary.averageWpm,
    averageAccuracyPercent: summary.averageAccuracy,
  });
  const current = toWindow(comparison.current);
  const previous = toWindow(comparison.previous);
  return JSON.stringify({
    format: 'typing-he-adjacent-week-comparison-v1',
    calendar: 'browser-local',
    current,
    previous,
    differences: {
      sessions: comparison.sessionDifference,
      averageWpm: comparison.wpmDifference,
      averageAccuracyPercentagePoints: comparison.accuracyDifference,
    },
    comparisonAvailable: current.totalSessions > 0 && previous.totalSessions > 0,
    advisory: 'Aggregate completed-session metrics from two adjacent local-calendar weeks. Missing weekly averages and their differences are null, not zero. No individual sessions, lesson IDs, typed text, keystrokes or mistake details. Local retention may omit older sessions; shared aggregates may still be sensitive.',
  }, null, 2) + '\n';
}

/**
 * A bounded daily practice streak from saved completed-session metrics.
 * The 14-day window is derived from the same two adjacent seven-day windows
 * as the comparison UI and respects browser-local civil days across DST.
 *
 * If no session was completed today, yesterday may remain the end of the
 * latest continuous streak. Two inactive days terminate it. At the left
 * boundary we report "at least" rather than claiming a complete streak.
 * Retaining only 100 local sessions may underestimate actual practice.
 */
export function recentPracticeStreak(records, now = new Date()) {
  const { current, previous } = weeklyComparison(records, now);
  const days = [...previous.days, ...current.days];
  const todayIndex = days.length - 1;
  const lastIndex = days[todayIndex].sessions > 0
    ? todayIndex : todayIndex - 1;
  const graceToday = lastIndex < todayIndex;
  if (lastIndex < 0 || days[lastIndex].sessions === 0) {
    return {
      days: 0,
      throughDate: null,
      graceToday: false,
      atLeast: false,
      observationDays: 14,
    };
  }
  let count = 0;
  for (let index = lastIndex; index >= 0 && days[index].sessions > 0; index--) {
    count++;
  }
  return {
    days: count,
    throughDate: days[lastIndex].date,
    graceToday,
    atLeast: count === lastIndex + 1,
    observationDays: 14,
  };
}
