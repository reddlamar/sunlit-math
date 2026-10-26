# End-to-end test plan

Run on **iOS** (iPhone 17 Pro simulator, iOS 26.5) and **Android** (Pixel 3a, API 34
emulator, no Google Play sign-in) using the development client served by Metro.
Results are recorded in [e2e-test-report.md](e2e-test-report.md).

Starting state unless a case says otherwise: app freshly launched on Home, free user
(only Addition unlocked), difficulty Easy, sound On, light theme.

## A. Launch and Home

| ID | Steps | Expected |
| --- | --- | --- |
| A1 | Launch the app | Home shows banner, trophy, four operation buttons; Subtraction, Multiplication and Division have a lock badge; Addition does not |
| A2 | Look at the Top Score card | Shows "No scores yet" on a clean install, otherwise the best score with name |
| A3 | Open the Settings tab, then Home again | Both tabs render; selection highlight follows |
| A4 | App starts with no unhandled error or red screen | No error overlay; no uncaught promise rejections in the log |

## B. Playing a round (Addition)

| ID | Steps | Expected |
| --- | --- | --- |
| B1 | Tap Addition | Get Ready card: "You have 60 seconds…", Start and Back |
| B2 | Tap Back on Get Ready | Returns to Home, no round started |
| B3 | Tap Addition, Start | Countdown 3-2-1, then a question with four answer buttons, timer at 60, score 0, streak 0 |
| B4 | Answer correctly | Score +1, streak 1, new question |
| B5 | Answer wrongly | Score −1, streak resets to 0, grid shakes, new question |
| B6 | Answer 4 correct in a row | Scores +1, +1, +1, then +3 on the fourth; flame lit from streak 3 |
| B7 | Tap Pause | Choices hidden, "Paused" with Resume; timer frozen |
| B8 | Tap Resume | Choices return and timer continues from where it stopped |
| B9 | Tap Restart, choose "Keep playing" | Round stays paused, score kept |
| B10 | Tap Restart, choose "Restart" | Get Ready card returns; Start begins a fresh round with score 0 |
| B11 | Press the back control mid-round, choose "Keep playing" | Stay on the game screen, round paused |
| B12 | Press back mid-round, choose "Leave" | Return to Home |
| B13 | Send the app to the background mid-round, return | Round is paused |
| B14 | Let the 60 seconds run out | Name entry card appears with the final score |
| B15 | Tap Save with the name empty | "Name is required", nothing saved |
| B16 | Enter a name longer than 20 characters | Input stops at 20 characters |
| B17 | Enter a name and Save | Summary: "Nice work, name!", score, Play Again, View Leaderboard |
| B18 | Tap Play Again | Get Ready card, then a fresh round (no stale name-entry card) |
| B19 | Tap View Leaderboard from the summary | Leaderboard filtered to Addition showing the new score |

## C. Leaderboard

| ID | Steps | Expected |
| --- | --- | --- |
| C1 | Open Home trophy | Leaderboard with All selected; scores sorted high to low; medals on top 3 |
| C2 | Select the + filter, then × | List filters; empty state "No scores yet" when none |
| C3 | Go back to Home from the leaderboard home icon | Home tab shown |
| C4 | Return to Home after saving a score | Top Score card shows the best score |

## D. Settings

| ID | Steps | Expected |
| --- | --- | --- |
| D1 | Settings shows Sound, Theme, Difficulty | Defaults: Sound On, Theme matches the system, Difficulty Easy |
| D2 | Choose Dark | Whole app switches to the dark palette, status bar adapts |
| D3 | Choose Hard, start Addition | Operands go beyond 10 (up to 50) |
| D4 | Set Sound Off, play a round | No sounds (not verifiable from the screen; settings state and persistence only) |
| D5 | Change settings, force-quit and relaunch | Settings are remembered |

## E. Locked operations and the unlock purchase

| ID | Steps | Expected |
| --- | --- | --- |
| E1 | Tap Subtraction | "Ask a grown-up" gate with a three-digit number in words; no price or purchase buttons |
| E2 | Enter a wrong number, Continue | "That's not right. Try this one instead.", a different number, field cleared |
| E3 | Enter the right number, Continue | "Unlock All Operations" with Unlock, Restore Purchase, Maybe Later |
| E4 | Tap Unlock when the store is unavailable | A friendly error or no-op; no crash |
| E5 | Tap Restore Purchase when the store is unavailable | A friendly error or no-op; no crash |
| E6 | Tap Maybe Later, then tap a locked operation again | Modal closes; the gate shows again next time |
| E7 | Tap Cancel on the gate | Modal closes, operations still locked |

## F. Persistence and lifecycle

| ID | Steps | Expected |
| --- | --- | --- |
| F1 | Save a score, force-quit, relaunch | Score is still on Home and the Leaderboard |
| F2 | Rotate or resize (iPad not covered) | Portrait only; not applicable on phones |

## G. Robustness

| ID | Steps | Expected |
| --- | --- | --- |
| G1 | Start with no network and no store connection (Android emulator without Play) | App works; store errors do not surface as uncaught errors |
| G2 | Corrupt or missing stored data | Covered by unit tests (`scoresRepository`, `SettingsContext`); not driven through the UI |
