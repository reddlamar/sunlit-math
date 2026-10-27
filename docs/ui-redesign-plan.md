# UI redesign plan: Sunlit Math for iPhone, iPad and Android

Status: **proposal for review** (nothing here is built yet). Written 2026-10-26 against version 1.2.2.

## 1. Goals

1. **Easy for a 5–10 year old to use alone**, with little or no reading.
2. **Grabs attention and keeps it**: the game should feel alive, rewarding and friendly.
3. **Looks and behaves right on every screen**: iPhone, iPad (portrait, landscape, resizable windows), Android phones, tablets and foldables.
4. **Respects each platform's conventions** without building three apps. One React Native codebase, one design system, adaptive layouts.
5. **Stays safe for kids**: no ads, no analytics, no external links, parental gate kept, nothing that collects personal data.

Non-goals for this effort: new game modes, accounts, online features, new monetization.

## 2. Audit of the current UI

Evidence: the 1.2.2 screens on iPhone 16 Pro and iPad Pro 13", the Android emulator run, and the source in `src/`. Severity: **High** blocks a good experience on some devices, **Medium** hurts quality, **Low** is polish.

### 2.1 Layout and devices

| # | Finding | Severity |
| --- | --- | --- |
| L1 | **iPad shows the phone layout stretched.** The game screen has a thin full-width timer bar, a tiny score, and a small 440-pt answer grid in the middle of a 1032-pt-wide screen; roughly two thirds of the screen is empty. Home leaves the bottom half blank. | High |
| L2 | **The app is locked to portrait** (`orientation: portrait` in `app.json`). iPad users often hold the device in landscape. And for apps targeting Android 16, Google says the system **ignores orientation and resizability locks on screens 600 dp wide or more**, so on Android tablets the app will be rotated and resized whether we plan for it or not. | High |
| L3 | No layout logic for different widths. Sizes are fixed (`fontSize: 44`, `minHeight: 96`), so nothing grows on big screens or adapts to small phones such as the iPhone SE. | High |
| L4 | Leaderboard rows stretch edge to edge on iPad, which is hard to scan. | Medium |

### 2.2 Touch targets and ergonomics

| # | Finding | Severity |
| --- | --- | --- |
| T1 | The pause and restart buttons are **40×40**, below the usual 44 pt (Apple) and 48 dp (Android) minimums, and far below what small fingers need. They sit side by side, which is why a restart confirmation had to be added. | High |
| T2 | The back chevron and the trophy icon are small and sit in the system header, away from the thumb. | Medium |
| T3 | Answer buttons are large and good (about 96 pt tall) and should be kept. | Strength |

### 2.3 Visual language and consistency

| # | Finding | Severity |
| --- | --- | --- |
| V1 | **Emoji are used as icons** (🏆 🏠 ⚙️ 🔒 🔥 ⏱️ 🏁 🎉). They render differently on iOS and Android, can't be recolored, scale unpredictably, and are announced oddly by screen readers. | High |
| V2 | The **Home banner is a raster image containing text** ("Beat the clock in 60 seconds"). Its text can't scale, translate or be read by VoiceOver/TalkBack, and it takes prime space on small phones. | Medium |
| V3 | **The sun mascot, the app's best asset, appears only on the icon and splash screen.** Inside the app there is no character. | Medium |
| V4 | Two trophies on Home (header icon and the Top Score card) do the same job. | Low |
| V5 | Tab bar uses emoji plus default system styling; it feels like a utility app, not a game. | Medium |

### 2.4 Feedback, reward and learning

| # | Finding | Severity |
| --- | --- | --- |
| F1 | **A correct answer has no visual reward.** It produces a sound and a haptic, then the next question appears instantly. The only visual signals are the small score number and the streak badge. | High |
| F2 | **A wrong answer shows a shake, but not the right answer**, so there is no learning moment. | High |
| F3 | The score (26 pt) and timer number are small for the most important numbers on the screen. The timer bar is the right idea for pre-readers, but is thin (about 16 pt). | Medium |
| F4 | Nothing recognizes progress over time: no personal best, stars, badges or goals. A child has no reason to come back tomorrow beyond the leaderboard. | Medium |
| F5 | The streak bonus rule (4th answer onward scores 3) is never explained in the UI. | Low |

### 2.5 Flow and privacy

| # | Finding | Severity |
| --- | --- | --- |
| P1 | **Difficulty lives in Settings**, one tab away from where it matters. Children (and many parents) won't find it. | Medium |
| P2 | **Typing a name after every round** is slow for young children, and a free-text name is personal information stored on the device. An avatar or nickname picker would be faster and safer. | Medium |
| P3 | No first-run guidance: a child opens the app and sees four large tiles and a banner with no hint what happens next. (The Get Ready card does explain it, once chosen.) | Low |

### 2.6 Accessibility

| # | Finding | Severity |
| --- | --- | --- |
| A1 | Fonts are fixed-size, so the OS text-size setting (Dynamic Type / font scale) is partly ignored. | Medium |
| A2 | Answers are told apart mainly by color. Labels (the numbers) carry the meaning, so this is acceptable, but the four colors must stay distinguishable for color-blind players. | Low |
| A3 | There is no reduced-motion handling for the shake and pop animations. | Low |
| A4 | Most buttons have accessibility labels, which is good. Emoji icons undermine this (V1). | Medium |

## 3. Guidelines applied

Sources checked directly are marked ✓. The rest is general platform knowledge and should be verified against the current docs before design sign-off.

**Android**
- ✓ *Adaptive layouts* (developer.android.com): decide layout from **window size**, not "is this a tablet"; derive the decision from window size classes in one place and pass it down; hoist state so rotation, folding and resizing don't lose it.
- ✓ *Window size classes*: width **compact < 600 dp, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥ 1600**; height compact < 480, medium 480–899, expanded ≥ 900.
- ✓ *Android 16 / API 36*: orientation, aspect-ratio and resizability restrictions are ignored on screens with smallest width ≥ 600 dp.
- Material 3 touch targets are 48 dp minimum, and edge-to-edge drawing, predictive back and a navigation rail on larger screens are standard. (Not re-verified: the touch-target page returned an error.)

**iOS / iPadOS** (not re-verified; Apple's documentation pages return no text to automated fetching, so these come from general knowledge)
- Minimum tappable area about 44×44 pt; larger and well spaced for children.
- Respect safe areas; use size classes and adaptive layout; support Split View, Slide Over and resizable windows; support all orientations unless the content genuinely requires one.
- Support Dynamic Type; constrain text to a readable width.
- App Store Kids Category rules already apply and are met: parental gate before purchases, no third-party ads or analytics, no external links.

**React Native / Expo**
- Use `useWindowDimensions` (reacts to rotation and resizing) and `react-native-safe-area-context` (already installed). Avoid fixed pixel sizes for anything that should scale.
- `Platform.select` / `Platform.OS` for the few places the platforms should differ (navigation chrome, haptics, font weight rendering).
- `react-native-reanimated` (already installed) for animation; keep animations on the native thread.
- Unlock orientation with `"orientation": "default"` in `app.json` (and keep `supportsTablet: true`).

## 4. Design direction

**Concept: "Sunny's Math Arcade."** A warm, sunny arcade where the sun mascot (call it *Sunny*) is the player's companion. Big, tactile, rounded things that react when touched.

Principles:
1. **Icons and numbers first, words second.** A pre-reader should be able to play without help.
2. **Everything big, round and bouncy.** Targets of at least 56 pt / 56 dp for anything a child taps during play (above the 44 / 48 minimums).
3. **Every action gets an immediate, visible answer.** Right answers celebrate, wrong answers teach.
4. **One design system, adaptive layout, light platform flavor.** Same look everywhere; the navigation chrome, back gesture, haptics and text rendering follow each platform.
5. **Calm for grown-ups.** Settings and purchases stay in a quieter, text-based area behind the parental gate.

### 4.1 Screen-by-screen proposal

| Screen | Phone (compact) | iPad / tablet portrait (medium) | Tablet landscape / large (expanded+) |
| --- | --- | --- | --- |
| **Home** | Mascot greeting + "Pick a game" (no banner image). 2×2 operation tiles with SVG icons, lock shown as a badge. Personal-best chip under the tiles. | Same tiles, larger (max about 220 dp content columns), centered, mascot larger beside the title. | Two-pane: left = mascot + personal best + leaderboard preview; right = 2×2 (or 4×1) tiles. |
| **Game** | Top: big timer ring or bar (24 pt+), score and streak as large chips. Middle: question in a large card. Bottom: 2×2 answers anchored to the lower half (thumb zone). Pause moves to a large floating button. | Question card and answers scale up (answers about 200 dp tall); content centered in a readable column. | Question left/center, answers on the right or below; timer and score as a side panel. Never a tiny grid in a big empty field. |
| **Feedback** | Correct: mascot cheers, button pops, floating "+1/+3", short confetti on milestones. Wrong: gentle shake and **highlight the correct answer** for a beat. | Same, scaled. | Same, scaled. |
| **Round result** | Stars (1–3), score vs personal best, mascot reaction, big "Play again". Avatar picker replaces typed name. | Same, wider card. | Result card centered, leaderboard preview alongside. |
| **Leaderboard** | Filter chips as large pills; rows with avatar, score, operation icon. | Max content width about 640 dp, centered. | Two columns (filters left, list right) or a wider list. |
| **Settings (grown-up area)** | Sound, theme, difficulty as large segmented controls; purchase and restore behind the gate. | Same, in a centered card. | Same. |
| **Difficulty** | Also offered on the Get Ready card as three big friendly buttons (Easy / Medium / Hard with icons). | Same. | Same. |

### 4.2 Child-engagement features (in priority order)

| Priority | Feature | Why | Effort | Risk |
| --- | --- | --- | --- | --- |
| 1 | Visible feedback: pop, "+N" float, streak flame growth, milestone confetti | Fixes F1; the single biggest "feels alive" gain | Medium | Low |
| 2 | Show the right answer after a miss | Fixes F2; turns mistakes into learning | Low | Low |
| 3 | Mascot as a companion (idle, cheer, oops, celebrate) | Fixes V3; emotional hook | Medium (needs art) | Low |
| 4 | Stars and personal best on the result screen | Fixes F4; gives a goal for next time | Low | Low |
| 5 | Avatar picker instead of typed names | Fixes P2; faster, no personal data | Medium | Low |
| 6 | Difficulty on the Get Ready card | Fixes P1 | Low | Low |
| 7 | Daily goal / badges / sticker collection | Return visits | High | Medium (scope creep) |
| 8 | Optional read-aloud of questions | Helps pre-readers | Medium | Medium (audio assets, languages) |

Priorities 1–6 are the core of this plan. Items 7–8 are candidates for a later release.

## 5. Accessibility and quality bar

- Touch targets: **≥ 56** for play controls; **never below 44 pt / 48 dp** anywhere.
- Contrast: keep the 3:1 checks already enforced in `tokens.test.ts`; add 4.5:1 for body text in both themes.
- Text: use scalable text (respect the OS font scale up to a sane cap in play areas).
- Motion: honor "reduce motion" (swap bounces and confetti for fades).
- Screen readers: every control labeled; decorative mascot hidden from VoiceOver/TalkBack; the question and score announced when they change.
- Color-blind safe: answers always carry a number; don't rely on color alone for correct/wrong (add an icon and shape).
- No emoji as UI icons; use one SVG icon set.

## 6. Technical approach (React Native / Expo)

1. **Layout class hook.** `useLayoutClass()` returns `compact | medium | expanded` from `useWindowDimensions()` using Android's breakpoints (600 / 840 dp). It is the single source of truth, tested with unit tests. Components receive a prop or read it from context; no component checks the device model.
2. **Scalable tokens.** Extend `theme/tokens.ts` with a spacing scale, radius scale and a type scale; sizes derive from the layout class. Keep colors and the contrast tests.
3. **Orientation and resizing.** `orientation: "default"`; verify iPad Split View/Slide Over and Android multi-window; verify the game state survives rotation (the engine already keeps state in the hook, so this should hold; to be confirmed by tests).
4. **Icons.** Add `react-native-svg` and a small set of custom SVG icons (home, settings, trophy, lock, flame, pause, restart, back) in a `components/icons` folder. Replace every emoji used as an icon.
5. **Animation.** Use `react-native-reanimated` for pops, floating text and the timer; use a small particle system for confetti (no new dependency if possible); consider `lottie-react-native` for mascot animation if the designer exports Lottie files.
6. **Platform flavor.** `Platform.select` for: back gesture and header style, ripple (Android) vs. scale-press (iOS), haptic style, and tab bar vs. navigation rail on expanded Android widths.
7. **No behavior regressions.** The game engine, scoring, storage and purchases are not touched. The redesign is in `components/` and `screens/`, plus new theme and layout modules, so the existing 274 unit tests keep protecting the rules.
8. **Tests.** Unit tests for the layout class and for each screen at three widths; keep coverage thresholds; extend the architecture test with the new modules; repeat the device test pass (iPhone 16 Pro, iPhone SE, iPad Pro 13" and 11", iPad mini; Pixel phone and a tablet/foldable emulator).

## 7. Figma plan

File: **Sunlit Math – UI redesign** (new file in your team; the App Store asset file stays separate).

Pages:
1. **Audit**: annotated screenshots of today's screens with the findings above.
2. **Foundations**: color variables (light/dark), type scale, spacing, radii, elevation, motion notes. Variables named to match `tokens.ts`.
3. **Components**: icon set, buttons (primary, answer, icon, chip), timer, score and streak chips, question card, mascot states, cards, segmented control, modal, tab bar / navigation rail. Variants and states (default, pressed, disabled, correct, wrong).
4. **Phone (compact)**: Home, Get Ready, Game (right/wrong states), Result, Leaderboard, Settings.
5. **iPad portrait (medium)** and **Tablet landscape (expanded)**: same screens.
6. **Android specifics**: navigation bar vs. rail, edge-to-edge, system bars, back behavior.
7. **Prototype**: Home → Get Ready → Game → Result flow with the feedback moments.
8. **Handoff**: spec sheets, tokens table, asset export list.

Working method: build components and variables first, then one screen per breakpoint, review in Figma comments, then implement in code from the approved frames.

## 8. Phased delivery

| Phase | Deliverable | Ships in app? | Why this order |
| --- | --- | --- | --- |
| 0 | Decisions on this plan (section 10) | No | Avoids rework |
| 1 | Figma foundations, components, audit page | No | Shared vocabulary |
| 2 | **Adaptive layout fix**: layout class hook, orientation unlocked, scaled iPad and tablet layouts using today's visual style | **Yes (1.3.0)** | Fixes the biggest problem (L1–L3) with low risk and no new art |
| 3 | Visual refresh: SVG icons, new Home, new Game, new Result, avatar picker | Yes (1.4.0) | Needs approved Figma frames and mascot art |
| 4 | Delight: feedback animations, mascot, stars and personal best, show-the-answer | Yes (1.4.0 or 1.5.0) | Builds on the new components |
| 5 | QA pass, device matrix, accessibility audit, store screenshots refresh | With each release | Keeps quality |

Phase 2 can start in parallel with Phase 1 because it doesn't depend on new art.

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Landscape and resizable windows expose layout bugs | Test matrix above; start with Phase 2 alone |
| Mascot art quality and effort | Reuse the existing sun artwork; Figma illustration or an illustrator; ship static poses before animation |
| Animations hurt performance on older phones | Keep them on the native thread; test on the Pixel 3a emulator and an iPhone SE; honor reduce-motion |
| Kids Category compliance | No new SDKs that collect data; no external links; avatar picker stores only a local choice |
| Scope creep from "engagement" ideas | Items 7–8 explicitly deferred |
| Apple guideline details unverified | Verify against current HIG before sign-off |

## 10. Decisions (made 2026-10-26)

1. **First release scope:** Phase 2 first (adaptive layout fix with today's look). The visual refresh follows in a later release.
2. **Mascot:** reuse the existing sun as "Sunny", with a few expressions (happy, cheering, oops).
3. **Players:** replace typed names with an avatar picker; existing saved names stay readable.
4. **Figma round one:** all three platforms at once (iPhone, iPad portrait and landscape, Android phone and tablet) from one shared component set.

Not yet decided: art direction (refine the current bright palette vs. explore a new look). Default: refine the current palette.

## 11. Next steps

1. Create the Figma file and build the Audit and Foundations pages (variables matching `tokens.ts`).
2. In parallel, implement Phase 2 (layout class hook, orientation unlocked, scaled iPad and tablet layouts) test-first on its own branch.
3. Build the shared components, then the screens at compact, medium and expanded widths; review in Figma comments.
4. Verify Apple's HIG details against the live documentation before design sign-off.
