# Phase 3 review and the 1.4.0 release plan

Written 2026-10-27, after PRs #19 to #24 (the Figma redesign) merged. It records what
was reviewed, what was fixed, what still needs a decision, which device checks are
outstanding, and the steps to ship 1.4.0.

## 1. What was reviewed

Everything that changed in `src/`, `App.tsx` and the docs since the 1.3.0 version bump:
about 100 files. Checks run on the merged code:

| Check | Result |
| --- | --- |
| `jest` (583 tests, coverage thresholds for `game`, `storage`, `settings`, `utils`) | Pass |
| `tsc --noEmit`, `eslint .` | Pass, no warnings |
| `expo-doctor` | 21 of 21 checks pass |
| JS bundles for iOS (CI) and Android (run locally) | Both build |
| CI on every Phase 3 PR | Green |
| Scans for leftover emoji icons, hard-coded colors outside the tokens, skipped tests | None found |
| Dead exports (nothing in the app uses them) | One family found, removed (below) |
| Contrast of every new text/background pair, light and dark | Two gaps found, one fixed (below) |

## 2. Fixed in the review PR

| Finding | Why it mattered | Fix |
| --- | --- | --- |
| The `scale` family in `layout.ts` (`scale`, `scaled()`, `contentWidth`, `safeWidth`, `safeHeight`, the safe-area context) had no users after Home, Game and the rest moved to `frameSize` | Dead code, and a docs section describing behavior that no longer exists | Removed, with its tests; `docs/architecture.md` rewritten to match |
| Six avatars need 348 dp but 375 dp-wide iPhones (SE, 12 and 13 mini) have 335, so the picker wrapped 5 + 1 | Looks broken on the smallest current iPhones | The row spreads to the width available, down to 8 dp gaps, and stays one line |
| Small accent text (the "Restore purchases" link, "Try again", the active tab label, "Restore Purchase") was 4.36:1 in dark mode against a 4.5:1 target | Fails the project's own definition of done | New `accentText` token (lighter in dark: 5.2:1); a token test enforces it |
| If saving failed before the previous best was looked up, the result screen stayed blank with no way out | A dead end for a child | The result still shows, with the failure and Try again |
| The Easy / Medium / Hard labels were defined in three places | Drift risk | One `DIFFICULTY_LABELS` |
| The privacy policy said players "type in a name" | Wrong since the avatar picker (#23), and the policy is published | Rewritten: players pick an animal, and the stored fields are listed; "Last updated" changed. **Please read it before merging.** |

## 3. Found, not fixed: needs a decision

| # | Severity | Finding | Options |
| --- | --- | --- | --- |
| 1 | **High** | `app.json` has `"userInterfaceStyle": "light"` (since v1). The built app declares `UIUserInterfaceStyle = Light`, so iOS always reports a light appearance. The new **Auto** theme, and the docs' claim that the app "follows the phone's appearance live", can therefore never go dark on iOS. Android is the same unless `expo-system-ui` is installed. | **Recommended:** set it to `"automatic"` (and add `expo-system-ui` for Android). Side effects: native alerts and the keyboard follow the phone, and a native rebuild is needed. Alternative: hide the Auto option and keep Light / Dark only. |
| 2 | Medium | Unselected segmented-control options (Settings) are told apart by a 2 px border that is 1.3:1 against the card in light and 1.5:1 in dark; WCAG asks for 3:1 for the edge of a control. The labels themselves are high-contrast and the chosen option is clearly filled, so it is usable, but faint. The border color comes straight from the Figma tokens. | Add a darker `controlBorder` token (about 3:1) and ask for it in Figma too. |
| 3 | Low | The "+N" float is 2.97:1 in light mode (success green on cream), just under 3:1 for large text. It is decorative, hidden from screen readers and visible for under a second. | Leave, or darken the light success color (which would also darken the ✓ answer fill). |
| 4 | Low | Home's "Personal best" is the best score overall; the result screen's "Personal best" is for that game and level. Same words, different meaning. | Rename Home's to "Best score", or leave. |
| 5 | Low | Level chips are 48 dp tall; the design draws 37. Kept at 48 for the tap-target minimum. | Update Figma. |
| 6 | Info | The result screen no longer links to the leaderboard (as designed); it is one tap from Home's best-score card. The leaderboard has no Home button; the header's back arrow does that job. | None. |
| 7 | Info | `package.json` says version `1.0.0` while `app.json` says `1.3.0`. Only `app.json` matters to the store. Local Node is 20.14; `expo-doctor` asks for 22.13 or newer (CI uses `.nvmrc`, which is 22). | Optional tidy-up. |

## 4. Device checks still outstanding

Everything below was verified by unit tests, but **not** on a device or simulator.
What was checked by eye: iPhone 16 Pro and iPad Pro 13" simulators, light theme only,
for Home, Game (a miss's reveal), the result screen, the Leaderboard and Settings.

| Area | What to look for |
| --- | --- |
| **Dark theme** (all screens, iPhone and iPad) | Avatars and Sunny on dark; ✓ and ✗ answer fills and their dark text; filled game pills and their ring; level chip selected state; segmented controls; "Restore purchases" link; stars' empty outline; the floating tab bar and rail |
| **Auto theme** | Only meaningful after decision #1. Set the phone to dark, choose Auto, confirm the app follows it live |
| **iPhone SE / 375 dp (12 and 13 mini)** | Six avatars on one line; game pills and level chips (they may wrap onto a second row; check it looks acceptable); the question card with a long sum; the Game screen's height; tab bar |
| **iPad mini and 11"** | Landscape two-pane Home (the left pane scrolls on short iPads); Game side panel; result with Top players; rail label "SETTINGS" fits |
| **Phone turned sideways** (never viewed) | Home row of four tiles, Game question beside answers, result, leaderboard, settings; the rail beside them |
| **Android phone** (Pixel) | Floating tab bar (corners, margin, system bar overlap); SVG icons; native stack header; back gesture; round-end result; avatar picker; Settings; font weights; the `elevation` shadows on tiles |
| **Android tablet / foldable** (Pixel Tablet emulator) | Rail on medium and expanded widths (the code puts it at 600 dp and up on Android); two-pane Home; resizing and rotation mid-round |
| **VoiceOver (iOS) and TalkBack (Android)** | Home tiles say "(locked, unlock to play)"; pause and restart are labeled; after a miss the right answer is spoken ("Not quite. 8 × 7 is 56"); stars read "2 of 3 stars"; the avatar picker is a radio group of animals; leaderboard rows read as one sentence; the unlock card announces a parent check; decorative Sunny and avatars are skipped |
| **Reduce Motion** (Settings, Accessibility) | No shake on a miss, no flame pop, the "+N" fades in place |
| **Real flows** | A miss then a right answer (clock stopped during the reveal, resumes); pause, restart and leave alerts; finishing a round, choosing another animal, relaunching (the choice sticks and the leaderboard shows it); a failed save and Try again (hard to trigger; airplane mode will not do it, so it relies on the unit tests); the unlock card, the parental gate, buying and restoring (sandbox) |
| **Upgrade** | Install 1.3.0 or 1.2.2 first, play, then install 1.4.0 over it: old scores with typed names still show (initials), and the last name pre-selects nothing |

## 5. Release plan for 1.4.0

### Decisions first

1. **Is 1.3.0 going out on its own?** Build 10 (1.3.0, Phase 2 only) exists and was
   meant for TestFlight only, behind 1.2.2's review. Phase 3 is built on top of it. The
   simplest path is to **skip a public 1.3.0 and ship 1.4.0 directly**, since 1.4.0
   contains everything in it. Only one version can be in review at a time, so if 1.2.2 is
   still in review, 1.4.0 waits for it. (I cannot see App Store Connect from here.)
2. **Finding #1** (dark appearance), because it changes native config and needs a rebuild.
3. **Finding #2**, if the control border should be darker before release.

### Steps

1. **Merge the review PR** and any fixes from the decisions above.
2. **Run the device checks in section 4** on a Release-configuration simulator build
   (the iPhone 16 Pro check that caught problems before 1.2.2 and 1.3.0), plus an
   iPhone SE (375 dp) simulator and the Pixel emulators. Fix what they find in small PRs.
3. **Bump the version**: `app.json` to `1.4.0` on a `release/1.4.0` branch, PR, merge
   (the same pattern as 1.2.2 and 1.3.0).
4. **Refresh the store screenshots.** The App Store and Play pages still show the old
   screens. The folders are `store-assets/screenshots` (iPhone 6.3", iPad 13") and
   `store-assets/app-store-creative`. Capture Home, Game, the result and the leaderboard
   from the new build in light (and optionally dark) on iPhone and iPad.
5. **Build iOS** from a clean clone of `main` (the project is not linked to GitHub, and
   the working folder holds large marketing videos):
   `git clone`, `npm ci`, then `eas build -p ios --profile production --non-interactive --no-wait`.
   The build number auto-increments (the next is 11). Confirm tests are green in the clone.
   If Android ships too: `eas build -p android --profile production`.
6. **You run** `eas submit -p ios --latest`. It lands in TestFlight; smoke-test that build
   on a real iPhone and iPad.
7. **App Store Connect (by hand):** create the 1.4.0 version, attach the new build, paste
   the release notes (I will put them on your clipboard), upload the new screenshots,
   and confirm the privacy answers. Nothing collected changed: no new SDK that gathers
   data (`react-native-svg` is drawing only), no accounts, no typed personal information
   any more. Re-check the Kids Category answers anyway. The parental gate is untouched.
8. **Submit for review** once no other version is in review.

### Draft release notes (What's New)

> A fresh new look!
> - Meet Sunny, your new math buddy, who cheers when you finish a round
> - Pick your favorite animal instead of typing a name
> - Earn stars: beat your best score for three
> - When you miss, the right answer lights up so you can learn from it
> - Bigger buttons, nicer colors, and a design made for iPad and tablets
> - A new grown-up area for settings, with an Auto theme

(Drop the Auto-theme line if finding #1 is not fixed first.)

### Rollback and risk

- The stored score format only gained an optional `avatar` field, so going back to an
  older build leaves old scores readable (it ignores the extra field). No migration.
- The riskiest areas are the ones without device coverage yet: Android layout, dark
  theme and the phone turned sideways. The device pass above is what retires that risk.
