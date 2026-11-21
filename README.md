# typing-he

**Practice Hebrew touch typing with guided lessons, live feedback and private progress tracking.**

A free, offline-friendly browser application. No server, account, third-party libraries or tracking scripts are needed.

## What's included

- Six progressive Hebrew typing lessons: home row, everyday words, final letters, sentences, punctuation and fluency, plus **one personalized lesson** that targets commonly mistyped Hebrew letters.
- Character-by-character visual feedback showing correctly entered letters, mismatches, and the next character.
- Live words-per-minute (WPM), cumulative keystroke accuracy, elapsed time and correct-prefix progress.
- A visual reference for the usual physical Hebrew keyboard layout, highlighting the next required character.
- A recent-session history, per-lesson best speed and overall progress overview.
- A local weak-key panel that ranks expected Hebrew letters entered incorrectly; the personalized drill adapts after completed lessons.
- Hebrew and English interface language options, responsive layout and keyboard-accessible controls.
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

The timer starts on the first input. WPM estimates speed using **five correctly entered characters per word**. Cumulative accuracy counts correct and incorrect character entries, including mistakes corrected later. Passage progress follows the longest correct prefix, not simply the length of what was typed. The trainer prevents pasting into the typing box.

The on-screen keyboard is a reference for a common Hebrew layout. Your operating system and hardware settings determine which characters physical keys actually type.

## Data and privacy

The site does not send typed content or performance metrics to a server. Completed session records are stored in \`localStorage\` in the current browser, with at most the 100 most recent records retained. Clearing browser data removes progress. A reset button clears history from the app.

## Project files

\`\`\`text
index.html       App layout and accessible training controls
styles.css       Responsive styling and dark theme
src/app.js       Lessons, timing, accuracy, keyboard and persistence
src/drills.js    Privacy-preserving letter-error summaries and adaptive drill generator
\`\`\`

## Author

Built by Meir Dvir · [https://github.com/MeiRR17](https://github.com/MeiRR17)
