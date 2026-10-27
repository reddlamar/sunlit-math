# End-to-end test report

Cases are defined in [e2e-test-plan.md](e2e-test-plan.md). Run on 2026-10-26 against the
`source-code-improvements` branch, served from Metro to a development client on each device.

| | iOS | Android |
| --- | --- | --- |
| Device | iPhone 16 Pro simulator, iOS 18.1 | Pixel 3a emulator, API 34 (no Google Play sign-in) |
| App | Debug dev client built from this branch | Existing debug dev client, JS from this branch |
| Starting data | Existing simulator data (two old scores) | Clean install |

✅ pass · ❌ failed, then fixed and re-checked · ➖ not executed

## Results

| ID | iOS | Android | Notes |
| --- | --- | --- | --- |
| A1 Launch shows Home, three locks | ✅ | ✅ | |
| A2 Top Score card | ✅ | ✅ | Empty state seen on Android; iOS already held scores |
| A3 Home ↔ Settings tabs | ✅ | ✅ | |
| A4 No unhandled errors at launch | ✅ | ❌ → ✅ | **BUG-1** |
| B1 Get Ready card | ✅ | ✅ | |
| B2 Back from Get Ready | ✅ | ✅ | |
| B3 Start: 3-2-1, then a round | ✅ | ✅ | |
| B4 Correct answer: +1, streak 1 | ✅ | ✅ | |
| B5 Wrong answer: −1, streak resets | ✅ | ✅ | |
| B6 Streak bonus: +1, +1, +1, then +3 | ✅ (3 → 6) | ✅ (1,2,3 → 6; 12 in a row = 30) | |
| B7 Pause freezes the timer | ✅ (18 held) | ✅ (43 held) | |
| B8 Resume continues | ✅ (18 → 16) | ✅ (43 → 40) | |
| B9 Restart, Keep playing | ✅ | ✅ | |
| B10 Restart, Restart | ✅ | ✅ | |
| B11 Back, Keep playing | ✅ | ✅ | |
| B12 Back, Leave | ✅ | ✅ | |
| B13 Backgrounding pauses | ✅ | ✅ | |
| B14 Time up shows name card | ✅ | ✅ | |
| B15 Empty name rejected | ✅ | ✅ | |
| B16 20-character limit | ✅ | ✅ | |
| B17 Save shows summary | ✅ | ✅ | |
| B17b Summary with a wrapping long name | ❌ → ✅ | ✅ (fits on one line) | **BUG-2** |
| B18 Play Again, no stale name card | ✅ | ✅ | |
| B19 View Leaderboard | ✅ | ✅ | |
| C1 All filter, sorted, medals | ✅ | ✅ | |
| C2 Operation filter and empty state | ✅ | ✅ | |
| C3 Home icon | ✅ | ✅ | |
| C4 Top Score card updates | ✅ | ✅ | |
| D1 Settings defaults | ✅ | ✅ | |
| D2 Dark theme | ✅ | ✅ | |
| D3 Hard difficulty (operands up to 50) | ✅ (7 + 37) | ✅ (42 + 4) | |
| D4 Sound Off (state and persistence only) | ✅ | ✅ | Audio itself can't be heard in a test run |
| D5 Settings persist after force-quit | ✅ | ✅ | |
| E1 Locked op opens parental gate | ✅ | ✅ | No price or purchase buttons |
| E2 Wrong gate answer | ✅ | ✅ | New number, field cleared |
| E3 Correct gate answer | ✅ ($2.99) | ✅ (no price) | Store reachable on iOS only |
| E4 Unlock with store unavailable | ➖ | ✅ | iOS would open Apple's payment sheet |
| E5 Restore with store unavailable | ➖ | ✅ | iOS would open Apple's sign-in; credentials not entered |
| E6 Maybe Later, gate returns | ✅ | ✅ | |
| E7 Cancel on gate | ✅ | ✅ | |
| F1 Scores persist after force-quit | ✅ | ✅ | |
| G1 Store unreachable | ➖ | ❌ → ✅ | **BUG-1** |
| G2 Corrupt storage | ➖ | ➖ | Covered by unit tests only |

## Re-test after merging 1.2.2

After PR #13 (1.2.2) merged into `main` and into this branch, a short pass was run on the merged
code on both devices (iPhone 16 Pro simulator, Pixel 3a emulator), covering what the merge changed.

| Check | iOS | Android |
| --- | --- | --- |
| Locked operations keep full color with a white lock badge | ✅ | ✅ (dark theme) |
| Answers show in a fixed 2 × 2 grid (Hard, two-digit numbers) | ✅ | ✅ |
| Home banner has rounded corners (dark theme) | ➖ light theme only | ✅ |
| A score of 1 reads "1 point" on the summary | ✅ | ✅ |
| New score records the current difficulty: row reads "+ · Hard" | ✅ | ✅ |
| Leaderboard shows the level row (All levels, Easy, Medium, Hard) | ✅ | ✅ |
| Hard filter shows only the new score; Easy shows none (Android) | ✅ (Hard) | ✅ (Hard, Easy) |
| Older scores without a level still show under All levels | ✅ | ✅ |
| Next round's name card is prefilled with the last name | ✅ ("Kai") | ✅ ("Ivy") |
| Save button label is the larger 19 px size | ✅ | ✅ |

No new bugs were found. The locked-operation parental gate was not re-opened on the merged build;
that flow is unchanged and its unit tests pass. One cosmetic issue was noticed: rank numbers 4 and
up on the iOS leaderboard used the system font rather than the app font. It predated both the
refactor and the merge, and has since been fixed.

## Bugs

### BUG-1: Uncaught promise rejections when the store is unreachable (Android)

- **Seen:** every launch on the Android emulator. A red "Uncaught (in promise) … Play Store
  service is not connected" toast appeared and covered the tab bar; Metro logged two
  `Uncaught (in promise)` errors.
- **Root cause:** [`PurchaseContext`](../src/purchases/PurchaseContext.tsx) called
  `fetchProducts(...)` and `getAvailablePurchases()` as bare statements when the store
  connected. Neither result was awaited or caught, so any store failure (no Play Store,
  offline, store outage) became an unhandled rejection. They only fill in the price and what is
  already owned, so a failure should leave the app usable and locked.
- **Fix:** both calls go through `ignoreFailure()`, which swallows the rejection.
- **Test:** `PurchaseContext.test.tsx`, "keeps running without unhandled rejections when the
  store calls fail". It listens for Node's `unhandledRejection` event and failed before the fix.
- **Re-verified:** relaunched on the emulator; no new `Uncaught` errors and no overlay.
  The remaining `[Expo-IAP] Error fetching…` lines are the library's own `console.error`,
  shown only in development builds.

### BUG-2: Long names on the round summary are left-aligned (iOS)

- **Seen:** with a 20-letter name the title wrapped to "Nice work," / "ABCDEFGHIJKLMNOPQRST!"
  and both lines hugged the left edge while everything else was centered.
- **Root cause:** [`RoundSummary`](../src/components/RoundSummary.tsx) centers its children with
  `alignItems: 'center'`, which centers each `Text` *box*. Once the text wraps, the box fills
  the full width and its lines default to left alignment. Short names fit on one line, so they
  looked fine. It was latent in `GameScreen` before the refactor.
- **Fix:** `textAlign: 'center'` on the title and the score.
- **Test:** `RoundSummary.test.tsx`, "centers the title and score so a long, wrapping name
  stays centered". It failed first.
- **Re-verified:** saved the same long name on the iPhone; both lines are centered.

### BUG-3: Error text is hard to read in dark mode (both platforms)

- **Found by:** reading the Android unlock screenshot, then measuring.
- **Root cause:** every error message used one fixed red, `#D92D20`, on the modal surface. That is
  4.83:1 on the light surface but only **2.95:1** on the dark one, below the 4.5:1 WCAG AA
  minimum for 13 px text.
- **Fix:** `danger` is now a theme token (`#D92D20` light, `#FF8A7A` dark, 6.22:1). The three
  components that show errors apply it from the active theme instead of `modalStyles`.
- **Tests:** `tokens.test.ts` computes the contrast ratio for both themes and failed first;
  `ParentalGate.test.tsx` checks the message uses the theme color.
- **Re-verified:** Android dark theme shows a readable coral message and field border.

## Observations (not changed)

- **Dark-mode banner (fixed, BUG-4, then properly fixed).** The Home banner image had an opaque
  cream background (the light theme's page color), so on the dark theme it showed as a plain
  light rectangle. It was first given rounded corners as a workaround; the banner asset now has
  a transparent background (only the background connected to the image edge was removed, with
  edge pixels un-blended so there is no cream halo), and the workaround was removed. A test reads
  the PNG's top corners to keep it transparent.
- **Answer grid and locked buttons (since fixed by the 1.2.2 merge).** At the time of testing,
  `main` wrapped the four answers 3 + 1 and dimmed locked buttons to 55% opacity. PR #13 (2 × 2
  grid, full-color locked buttons with a white lock badge) has since merged into `main` and into
  this branch, so these results were recorded against the pre-1.2.2 layout.
- **Dropped taps during automation.** A few back-to-back taps from the simulator tool within
  about 100 ms were ignored, and a gate answer submitted within 100 ms of typing was judged wrong.
  Repeating each action with normal spacing worked every time, and a person cannot act that
  fast, so this is treated as a test-harness artifact, not an app bug. It was not reproduced
  with spaced taps.

## Test environment notes

- The iPhone 17 Pro simulator that was already booted ran a standalone build with an embedded
  1.2.2 bundle, not a development client, so it never loaded this branch. Its results were
  discarded. The iPhone 16 Pro dev client above was built from this branch and used instead.
- Building it first failed in `pod install` (the shell needed a UTF-8 locale, and `ios/Podfile.lock`
  was stale after the `expo` 57.0.31 bump). Both are local environment issues; `ios/` is not
  tracked in git.
- Gameplay was driven by temporary logging of each question (removed before committing), which
  let a script pick answers; UI dumps on Android were too slow while the timer animated.

## Follow-ups completed after the re-test

- **Transparent banner**: see above.
- **Timer and streak contrast**: on the cream page the timer number was 2.07:1 and the streak number
  1.78:1. The light-theme colors are now `#19899A` and `#D66800` (3.6:1 and 3.13:1 on the page, 3.17:1
  for the timer fill against its track, 3.25:1 for the streak on its lit badge); the dark theme already
  passed. `tokens.test.ts` enforces 3:1 in both themes.
- **Leaderboard ranks** 4 and up use the app font.
- **Toolchain**: `@types/node` is a declared dev dependency; `.nvmrc` (Node 22) is the single source of
  truth for CI; `engines` requires Node 20.19.4 or newer, which Expo needs.

These four were checked on the iPhone 16 Pro: the banner is seamless on the dark theme, the timer is a
readable darker teal on the cream page, and leaderboard ranks 4 and up are in the app font. They were
not re-run on Android; none of the changes is platform specific.

## Pre-release check of a Release build (1.2.2 candidate)

Before the production build, a **Release** configuration build of `main` (including #15) was compiled
locally and run on the iPhone 16 Pro simulator with no Metro server: the JavaScript is embedded in the app
(`main.jsbundle`), as in a store build. This is the check that caught a native-stack bug before 1.2.1.

| Check | Result |
| --- | --- |
| Release build compiles; app launches and runs without a dev server | ✅ |
| Home: full-color locked buttons with white badges, transparent banner | ✅ |
| Round: 2 × 2 grid, darker timer color, scoring, pause | ✅ |
| Leave confirmation: Keep playing stays on the game; Leave returns Home | ✅ |
| Parental gate: correct number opens "Unlock All Operations" with the price ($2.99) | ✅ |
| Maybe Later closes the unlock window | ✅ |
| Dark theme persists after force-quit and relaunch | ✅ |
| Time's up: name card with the last name prefilled | ✅ |

Not exercised: tapping Unlock or Restore, which open Apple's payment and sign-in sheets (credentials are not
entered in testing), and grandfathering of earlier paying customers, which needs a real App Store install.
The simulator shows "Sign in to Apple Account" prompts at launch because it has no signed-in account; they
are cancelled and do not occur on a real device or in the App Store build. Both are also listed in
[ios-manual-test-checklist.md](ios-manual-test-checklist.md).


## Phase 2 device pass (adaptive layout, branch `adaptive-layout`)

The new layout code (see [architecture.md](architecture.md)) was run on an iPad Pro 13" and an iPhone 16 Pro
(iOS simulator, portrait and landscape) and on a Pixel 3a phone and a Pixel Tablet (Android emulator,
portrait and landscape). Home, Game, Leaderboard and Settings were each opened on every device. The iOS
simulator ignores taps under Xcode 27 (AXe reports success but does nothing), so screens were opened with a temporary
local-only navigation hook that is not part of the commit; Android used adb taps.

| # | Bug found | Where | Root cause | Fix (tests first) |
| --- | --- | --- | --- | --- |
| 1 | The fourth Home tile wrapped to a second row | iPhone landscape | Tile size was computed from the window width, but the notch takes about 59 dp on each side | `useLayout` now subtracts the safe-area insets (`safeWidth`, `safeHeight`) |
| 2 | The top-score card and the last Settings row were hidden behind the tab bar | Phones turned sideways | The content was a plain `View`, so nothing could scroll | Home and Settings content is now in a `ScrollView` |
| 3 | Answers touched the Pause button; the bottom row was cramped | Android phone landscape | Timer, score and controls stacked and left under 200 dp for the board | On a short window they share one row |
| 4 | Only about one leaderboard row was visible | Phones turned sideways | Title and filters sat above the list and took most of the height | Title and filters are the list header, so they scroll away |
| 5 | Ranks 4 and up were nearly invisible on the dark theme | Every device | The rank `Text` had no color and fell back to black (found on iPhone) | Uses `colors.textPrimary` |
| 6 | Leaderboard, Settings and the top-score card looked tiny next to the larger tiles | Tablets | Only the Home tiles and Game board were scaled | Their type and touch heights use `scaled()` |
| 7 | "Multiplication" wrapped to two lines | Android phone landscape | A 113 dp tile was too small for the label | Tile height budget fixed, minimum 140 dp, label is one line and shrinks to fit, banner capped on short windows |

Everything above was re-checked after the fixes on the same devices. Not covered: the name-entry and
Get Ready modals in landscape on phones, and a real device (the simulators and emulators only).
