import { cleanMistakes, mergeMistakes, weakKeys, createAdaptiveTarget } from './drills.js';
import { weeklyActivity } from './trends.js';

const STORAGE_KEY = 'typing-he:sessions:v1';
const MISTAKES_KEY = 'typing-he:mistakes:v1';
const LESSONS = [
  {
    id: 'home',
    title: { he: 'שורת הבית', en: 'Home-row keys' },
    description: { he: 'הכירו את האותיות שבשורה המרכזית.', en: 'Build confidence with the middle row of the keyboard.' },
    target: 'שש דד גג ככ עע יי חח לל שדגכ עיחל'
  },
  {
    id: 'first-words',
    title: { he: 'מילים שימושיות', en: 'Useful words' },
    description: { he: 'מילים יומיומיות עם רווחים.', en: 'Practice common Hebrew words and spaces.' },
    target: 'שלום תודה יום טוב אני אתה בית ספר חברים לימוד'
  },
  {
    id: 'final-letters',
    title: { he: 'אותיות סופיות', en: 'Final Hebrew letters' },
    description: { he: 'תרגלו ך ם ן ף ץ בתוך מילים.', en: 'Learn the five Hebrew final-form letters in context.' },
    target: 'מלך עולם מוכן ענן חוף קיץ סוף דרך שם זמן'
  },
  {
    id: 'sentences',
    title: { he: 'משפטים קצרים', en: 'Short sentences' },
    description: { he: 'עברו מהקלדת מילים למשפטים שלמים.', en: 'Move from isolated words to complete sentences.' },
    target: 'אני לומד להקליד בעברית. בכל יום אני משתפר קצת יותר. המטרה שלי היא להקליד בלי להסתכל על המקלדת.'
  },
  {
    id: 'punctuation',
    title: { he: 'סימני פיסוק', en: 'Punctuation' },
    description: { he: 'פסיקים, נקודות, סימני שאלה וקריאה.', en: 'Practice commas, periods, questions, and exclamations.' },
    target: 'שלום! מה שלומך? היום נתרגל הקלדה, נלמד דברים חדשים, ונסיים בהצלחה.'
  },
  {
    id: 'flow',
    title: { he: 'אימון שטף', en: 'Fluency challenge' },
    description: { he: 'קטע ארוך לפיתוח קצב יציב ודיוק.', en: 'Build speed while maintaining accuracy over a paragraph.' },
    target: 'הקלדה עיוורת היא מיומנות שאפשר לפתח בעזרת אימון קבוע. בהתחלה כדאי להקליד לאט ולשים לב לדיוק. עם הזמן האצבעות לומדות את מיקומי האותיות, והמחשבה יכולה להתמקד במילים עצמן במקום במקלדת.'
  },
  {
    id: 'adaptive',
    title: { he: 'אימון אישי', en: 'Personalized drill' },
    description: { he: 'תרגול לפי האותיות שטעית בהן באימונים קודמים.', en: 'Practice letters you mistyped in previous sessions.' },
    target: ''
  }
];

const KEYBOARD_ROWS = [
  [['/','Q'],["'","W"],['ק','E'],['ר','R'],['א','T'],['ט','Y'],['ו','U'],['ן','I'],['ם','O'],['פ','P']],
  [['ש','A'],['ד','S'],['ג','D'],['כ','F'],['ע','G'],['י','H'],['ח','J'],['ל','K'],['ך','L'],['ף',';']],
  [['ז','Z'],['ס','X'],['ב','C'],['ה','V'],['נ','B'],['מ','N'],['צ','M'],['ת',','],['ץ','.'],['.','/']]
];

const TEXT = {
  he: {
    skip: 'מעבר לאימון', language: 'שפה', eyebrow: 'אימון חינמי · בלי הרשמה',
    headline: 'הקלדה עיוורת בעברית, צעד אחרי צעד.',
    intro: 'בחרו שיעור, הקלידו את הטקסט, ושפרו את המהירות והדיוק. ההתקדמות נשמרת בדפדפן בלבד.',
    completed: 'אימונים שהושלמו', bestSpeed: 'מהירות שיא (WPM)', averageAccuracy: 'דיוק ממוצע',
    lessons: 'שיעורים', lessonNote: 'אפשר להתחיל מכל שיעור. האימון לא דורש חשבון או חיבור לרשת.',
    restart: 'התחל מחדש', speed: 'מילים בדקה', accuracy: 'דיוק מצטבר', time: 'זמן', progress: 'התקדמות',
    typingLabel: 'הקלידו כאן לפי הטקסט שמופיע למעלה', keyboard: 'מפת מקשים עברית',
    keyboardHint: 'המקשים מציגים את סידור האותיות בעברית במקלדת רגילה. המקור של התווים הוא מהמקלדת שלך.',
    history: 'אימונים אחרונים', clearHistory: 'איפוס התקדמות',
    storage: 'התוצאות נשמרות ב־localStorage בדפדפן הזה בלבד. ניקוי נתוני הגלישה ימחוק אותן.',
    step: 'שיעור', ready: 'התחילו להקליד. הזמן יתחיל עם התו הראשון.',
    keepGoing: 'המשיכו להקליד. אפשר לתקן שגיאות באמצעות Backspace.',
    complete: 'השיעור הושלם! התוצאה נשמרה בדפדפן.',
    none: 'אין עדיין אימונים שהושלמו.', confirmClear: 'למחוק את כל ההתקדמות שנשמרה בדפדפן הזה?',
    cleared: 'ההתקדמות אופסה.', best: 'שיא',
    weakHeading: 'אותיות לתרגול', noWeakKeys: 'לא זוהו טעויות עדיין. האימון האישי מתחיל בתרגול שורת הבית.',
    weakNote: 'ספירת שגיאות לפי האות המצופה בלבד; לא נשמרים קטעי טקסט מוקלדים.',
    weekHeading: 'פעילות בשבעת הימים האחרונים', weekEmpty: 'עדיין אין אימונים שהושלמו השבוע.',
    weekSessions: 'אימונים', weekActive: 'ימים פעילים', weekAverage: 'מהירות ממוצעת',
    weekDay: 'אימונים ביום'
  },
  en: {
    skip: 'Skip to practice', language: 'Language', eyebrow: 'Free practice · no signup',
    headline: 'Learn Hebrew touch typing, one lesson at a time.',
    intro: 'Choose a lesson, type the passage, and improve speed and accuracy. Progress stays in your browser.',
    completed: 'Completed sessions', bestSpeed: 'Best speed (WPM)', averageAccuracy: 'Average accuracy',
    lessons: 'Lessons', lessonNote: 'Start at any lesson. No account or internet connection is required.',
    restart: 'Restart', speed: 'Words per minute', accuracy: 'Cumulative accuracy', time: 'Time', progress: 'Progress',
    typingLabel: 'Type the passage shown above', keyboard: 'Hebrew keyboard reference',
    keyboardHint: 'Keys show the usual Hebrew physical layout. Your own keyboard layout controls actual input.',
    history: 'Recent sessions', clearHistory: 'Reset progress',
    storage: 'Results are stored in localStorage on this browser only. Clearing browser data removes them.',
    step: 'Lesson', ready: 'Start typing. The timer begins with your first character.',
    keepGoing: 'Keep typing. Use Backspace to correct mistakes.',
    complete: 'Lesson completed! Your result was saved in this browser.',
    none: 'No completed sessions yet.', confirmClear: 'Delete all locally saved typing progress?',
    cleared: 'Progress reset.', best: 'Best',
    weakHeading: 'Keys to practice', noWeakKeys: 'No mistakes yet. The personal drill starts with home-row letters.',
    weakNote: 'Only expected-letter error counts are saved, never typed passages.',
    weekHeading: 'Activity over the past seven days', weekEmpty: 'No completed practice sessions this week yet.',
    weekSessions: 'sessions', weekActive: 'active days', weekAverage: 'average speed',
    weekDay: 'sessions on this day'
  }
};

const $ = selector => document.querySelector(selector);
const input = $('#typing-input');
const passage = $('#passage');
const lessonsContainer = $('#lesson-list');
const historyContainer = $('#history-list');
const langSelect = $('#language');
let selected = 0;
let records = loadRecords();
let mistakes = loadMistakes();
let sessionMistakes = Object.create(null);
let activeTarget = '';
let startedAt = null;
let timerHandle = null;
let attempts = 0;
let correctAttempts = 0;
let previousValue = '';
let finished = false;

function language() { return langSelect.value === 'en' ? 'en' : 'he'; }
function words() { return TEXT[language()]; }

function loadRecords() {
  try {
    const decoded = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(decoded) ? decoded.filter(r =>
      r && typeof r.lessonId === 'string' && typeof r.wpm === 'number' &&
      typeof r.accuracy === 'number' && typeof r.finishedAt === 'string'
    ).slice(-100) : [];
  } catch {
    return [];
  }
}

function saveRecords() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
  catch { /* Training remains usable if storage is disabled. */ }
}
function loadMistakes() {
  try { return cleanMistakes(JSON.parse(localStorage.getItem(MISTAKES_KEY) || '{}')); }
  catch { return cleanMistakes({}); }
}
function saveMistakes() {
  try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes)); }
  catch { /* Practice remains available if storage is disabled. */ }
}

function elapsedMs() {
  return startedAt === null ? 0 : performance.now() - startedAt;
}
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
function accuracy() {
  return attempts === 0 ? 100 : Math.round(correctAttempts / attempts * 100);
}
function speed() {
  const durationMinutes = elapsedMs() / 60000;
  return durationMinutes > 0.001 ? Math.round((correctAttempts / 5) / durationMinutes) : 0;
}

function translate() {
  const lang = language();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = words()[node.dataset.i18n] || '';
  }
}

function renderLessons() {
  lessonsContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < LESSONS.length; i++) {
    const lesson = LESSONS[i];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lesson' + (selected === i ? ' active' : '');
    button.setAttribute('aria-pressed', String(selected === i));
    const heading = document.createElement('strong');
    heading.textContent = String(i + 1) + '. ' + lesson.title[language()];
    const subtitle = document.createElement('small');
    const history = records.filter(r => r.lessonId === lesson.id);
    const best = history.length ? Math.max(...history.map(r => r.wpm)) : null;
    subtitle.textContent = best === null ? lesson.description[language()] : words().best + ': ' + best + ' WPM';
    button.append(heading, subtitle);
    button.addEventListener('click', () => {
      selected = i;
      resetLesson();
    });
    fragment.append(button);
  }
  lessonsContainer.append(fragment);
}

function renderKeyboard(nextCharacter) {
  if (!$('#keyboard').children.length) {
    const fragment = document.createDocumentFragment();
    for (const row of KEYBOARD_ROWS) {
      const container = document.createElement('div');
      container.className = 'key-row';
      for (const [character, latin] of row) {
        const key = document.createElement('div');
        key.className = 'key';
        key.dataset.character = character;
        const glyph = document.createElement('strong');
        glyph.textContent = character;
        const label = document.createElement('small');
        label.textContent = latin;
        key.append(glyph, label);
        container.append(key);
      }
      fragment.append(container);
    }
    const bottom = document.createElement('div');
    bottom.className = 'key-row';
    const space = document.createElement('div');
    space.className = 'key space';
    space.dataset.character = ' ';
    space.textContent = 'Space';
    bottom.append(space);
    fragment.append(bottom);
    $('#keyboard').append(fragment);
  }
  for (const key of document.querySelectorAll('#keyboard .key')) {
    key.classList.toggle('next', key.dataset.character === nextCharacter);
  }
}

function renderPassage() {
  const target = activeTarget;
  const value = input.value;
  let prefixLength = 0;
  while (prefixLength < value.length && prefixLength < target.length &&
         value[prefixLength] === target[prefixLength]) prefixLength++;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < target.length; index++) {
    const char = document.createElement('span');
    char.textContent = target[index];
    if (index < value.length) char.className = value[index] === target[index] ? 'correct' : 'incorrect';
    else if (index === value.length) char.className = 'current';
    fragment.append(char);
  }
  passage.replaceChildren(fragment);
  const percentage = Math.floor(prefixLength / target.length * 100);
  $('#progress').textContent = percentage + '%';
  $('#progress-fill').style.width = percentage + '%';
  $('#progress-track').setAttribute('aria-valuenow', String(percentage));
  renderKeyboard(target[prefixLength] || '');
}

function renderStats() {
  $('#speed').textContent = String(speed());
  $('#accuracy').textContent = accuracy() + '%';
  $('#timer').textContent = formatTime(elapsedMs());
}

function renderOverview() {
  $('#completed-total').textContent = String(records.length);
  $('#best-wpm').textContent = records.length ? String(Math.max(...records.map(r => r.wpm))) : '0';
  $('#average-accuracy').textContent = records.length
    ? Math.round(records.reduce((sum, record) => sum + record.accuracy, 0) / records.length) + '%'
    : '—';
}

function renderWeakKeys() {
  const region = $('#weak-keys');
  region.replaceChildren();
  const keys = weakKeys(mistakes);
  if (!keys.length) {
    const message = document.createElement('p');
    message.textContent = words().noWeakKeys;
    region.append(message);
  } else {
    for (const item of keys) {
      const chip = document.createElement('span');
      chip.className = 'weak-key';
      chip.textContent = item.letter + ' · ' + item.count;
      region.append(chip);
    }
  }
  $('#weak-keys-heading').textContent = words().weakHeading;
  $('#weak-keys-note').textContent = words().weakNote;
}

function renderWeekly() {
  const summary = weeklyActivity(records);
  const labels = words();
  $('#week-heading').textContent = labels.weekHeading;
  const description = $('#week-summary');
  description.textContent = summary.totalSessions
    ? summary.totalSessions + ' ' + labels.weekSessions + ' · ' +
      summary.activeDays + ' ' + labels.weekActive + ' · ' +
      labels.weekAverage + ': ' + summary.averageWpm + ' WPM'
    : labels.weekEmpty;
  const region = $('#week-bars');
  region.replaceChildren();
  const maxCount = Math.max(1, ...summary.days.map(day => day.sessions));
  const locale = language() === 'he' ? 'he-IL' : 'en-US';
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const fragment = document.createDocumentFragment();
  for (const day of summary.days) {
    const row = document.createElement('li');
    const date = new Date(day.date + 'T12:00:00');
    const label = document.createElement('time');
    label.dateTime = day.date;
    label.textContent = formatter.format(date);
    const graph = document.createElement('div');
    graph.className = 'week-bar-track';
    graph.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.className = 'week-bar-fill';
    fill.style.width = (day.sessions / maxCount * 100) + '%';
    graph.append(fill);
    const value = document.createElement('span');
    value.className = 'week-count';
    value.textContent = String(day.sessions);
    row.setAttribute('aria-label', formatter.format(date) + ': ' +
      day.sessions + ' ' + labels.weekDay);
    row.append(label, graph, value);
    fragment.append(row);
  }
  region.append(fragment);
}

function renderHistory() {
  renderWeekly();
  historyContainer.replaceChildren();
  const recent = records.slice(-5).reverse();
  if (!recent.length) {
    const empty = document.createElement('li');
    empty.textContent = words().none;
    historyContainer.append(empty);
    return;
  }
  for (const record of recent) {
    const lesson = LESSONS.find(item => item.id === record.lessonId);
    const row = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = (lesson?.title[language()] || record.lessonId) +
      ' · ' + record.wpm + ' WPM · ' + record.accuracy + '%';
    const stamp = document.createElement('small');
    const date = new Date(record.finishedAt);
    stamp.textContent = Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(language() === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
      : '';
    row.append(title, stamp);
    historyContainer.append(row);
  }
}

function stopTimer() {
  if (timerHandle !== null) clearInterval(timerHandle);
  timerHandle = null;
}

function resetLesson() {
  stopTimer();
  startedAt = null;
  attempts = 0;
  correctAttempts = 0;
  previousValue = '';
  finished = false;
  sessionMistakes = Object.create(null);
  activeTarget = LESSONS[selected].id === 'adaptive' ? createAdaptiveTarget(mistakes) : LESSONS[selected].target;
  input.disabled = false;
  input.value = '';
  const lesson = LESSONS[selected];
  $('#lesson-title').textContent = lesson.title[language()];
  $('#lesson-step').textContent = words().step + ' ' + (selected + 1) + ' / ' + LESSONS.length;
  $('#lesson-description').textContent = lesson.description[language()];
  $('#typing-status').textContent = words().ready;
  $('#typing-status').classList.remove('complete');
  renderLessons();
  renderPassage();
  renderStats();
}

function completeLesson() {
  if (finished) return;
  finished = true;
  stopTimer();
  renderStats();
  input.disabled = true;
  $('#typing-status').textContent = words().complete;
  $('#typing-status').classList.add('complete');
  records.push({
    lessonId: LESSONS[selected].id,
    wpm: speed(),
    accuracy: accuracy(),
    seconds: Math.round(elapsedMs() / 1000),
    finishedAt: new Date().toISOString()
  });
  records = records.slice(-100);
  saveRecords();
  mistakes = mergeMistakes(mistakes, sessionMistakes);
  saveMistakes();
  renderWeakKeys();
  renderOverview();
  renderHistory();
  renderLessons();
}

input.addEventListener('paste', event => event.preventDefault());
input.addEventListener('input', () => {
  if (finished) return;
  if (startedAt === null && input.value.length > 0) {
    startedAt = performance.now();
    timerHandle = setInterval(renderStats, 250);
  }
  const current = input.value;
  if (current.length > previousValue.length) {
    // Count newly entered characters; revisions with selected text are
    // accounted for conservatively rather than pretending every correction
    // was error-free.
    const start = current.startsWith(previousValue) ? previousValue.length : 0;
    for (let i = start; i < current.length; i++) {
      attempts++;
      const expected = activeTarget[i];
      if (current[i] === expected) correctAttempts++;
      else if (expected && /[א-ת]/u.test(expected)) {
        sessionMistakes[expected] = (sessionMistakes[expected] || 0) + 1;
      }
    }
  }
  previousValue = current;
  renderPassage();
  renderStats();
  $('#typing-status').textContent = words().keepGoing;
  if (current === activeTarget) completeLesson();
});

$('#restart').addEventListener('click', () => {
  resetLesson();
  input.focus();
});
langSelect.addEventListener('change', () => {
  translate();
  resetLesson();
  renderOverview();
  renderHistory();
  renderWeakKeys();
});
$('#clear-history').addEventListener('click', () => {
  if (!window.confirm(words().confirmClear)) return;
  records = [];
  mistakes = cleanMistakes({});
  sessionMistakes = Object.create(null);
  saveMistakes();
  saveRecords();
  renderOverview();
  renderHistory();
  renderLessons();
  renderWeakKeys();
  $('#typing-status').textContent = words().cleared;
});

translate();
renderOverview();
renderHistory();
renderWeakKeys();
resetLesson();
