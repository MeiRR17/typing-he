# typing-he

**Practice Hebrew touch typing with guided lessons, live feedback and private progress tracking.**

A free, offline-friendly browser application. No server, account, third-party libraries or tracking scripts are needed.

## What's included

- Six progressive Hebrew typing lessons: home row, everyday words, final letters, sentences, punctuation and fluency, plus **one personalized lesson** that targets commonly mistyped Hebrew letters.
- Character-by-character visual feedback showing correctly entered letters, mismatches, and the next character.
- Live words-per-minute (WPM), cumulative keystroke accuracy, elapsed time and correct-prefix progress. A **Pause / Resume** control suspends typing and excludes paused duration from elapsed time and WPM. Hiding the browser tab automatically pauses an active lesson; returning requires an explicit resume, preserving typed content and counters.
- A visual reference for the usual physical Hebrew keyboard layout, highlighting the next required character.
- A recent-session history, per-lesson best speed and overall progress overview.
- A local weak-key panel that ranks expected Hebrew letters entered incorrectly; the personalized drill adapts after completed lessons.
- A **seven-day local activity view** showing completed sessions per day, total sessions, active days and session-weighted average WPM, including days with no practice.
- Export the last seven local calendar days as **CSV** or **JSON** with daily completion counts and mean WPM/accuracy, including zero-activity days. JSON also includes active days, weekly totals, average WPM/accuracy and explicit browser-local date window. Neither export contains typed text, lesson IDs, individual session timestamps, character mistakes, or lesson passages. Export buttons are disabled when the displayed week contains no sessions.
- Hebrew and English interface language options, responsive layout and keyboard-accessible controls. Switching languages during a lesson preserves typed text, target, accuracy counters, elapsed time and personalized drill selection; only interface labels and feedback are translated.
- Local-only progress using browser \`localStorage\`, with an explicit reset action.

## Run or deploy

The app has no build step. Serve the repository root on any static web server:

\`\`\`sh
python3 -m http.server 8000
\`\`\`

Open \`http://localhost:8000\`. GitHub Pages or another static hosting provider can serve the same files after the hosting configuration is enabled.

## How a session works

1. Choose a lesson from the sidebar.
2. Switch your operating system's keyboard layout to Hebrew.
3. Type the displayed passage into the practice box. Backspace lets you correct mistakes.
4. Once your text matches the target exactly, the session finishes and saves its results locally.
5. Choose **Personalized drill / אימון אישי** to practice your five most frequently mistyped letters. Until mistakes have been recorded, it uses basic home-row practice. Start the personalized lesson again after completing other lessons to refresh its target.

Browser-stored records are sanitized before metrics are calculated: invalid numeric ranges, timestamps or malformed record shapes are discarded rather than producing nonsensical progress. The seven-day chart uses only completed session records already kept locally. Day boundaries follow the browser's local calendar date; it is a recent activity summary, not a streak or a comparison with other users.

The timer starts on the first input. Pause freezes the clock and disables input; resuming adds the paused interval to excluded time rather than resetting the session. Switching away from the browser tab pauses the session automatically, so background time does not reduce WPM. Changing the interface language no longer resets an ongoing or completed lesson; use **Restart** explicitly to begin again. WPM estimates speed using **five correctly entered characters per word**. Cumulative accuracy counts correct and incorrect character entries, including mistakes corrected later. Replacing a selected character (even without changing total text length) is counted as a new attempt by comparing inserted segments between textarea states; backspace-only edits do not add attempts. A single edit may still represent multiple characters and is not a hardware keystroke audit. Passage progress follows the longest correct prefix, not simply the length of what was typed. The trainer blocks paste and drag-and-drop bulk input (including the corresponding `beforeinput` input types). Browser extensions, script-driven edits and all input methods cannot be fully authenticated, so scores remain personal practice metrics, not proctored exam results.

The on-screen keyboard is a reference for a common Hebrew layout. Your operating system and hardware settings determine which characters physical keys actually type.

## Data and privacy

The site does not send typed content or performance metrics to a server. Completed session records are stored in \`localStorage\` in the current browser, with at most the 100 most recent records retained. Clearing browser data removes progress. A reset button clears history from the app.

## Project files

\`\`\`text
index.html       App layout and accessible training controls
styles.css       Responsive styling and dark theme
src/app.js       Lessons, timing, accuracy, keyboard and persistence
src/edits.js     Pure UTF-16 diff of newly inserted characters for accuracy measurement
src/drills.js    Privacy-preserving letter-error summaries and adaptive drill generator
src/trends.js    Pure seven-day practice summaries, record sanitation and aggregate-only CSV/JSON exports
\`\`\`

## Author

Built by Meir Dvir · [https://github.com/MeiRR17](https://github.com/MeiRR17)
