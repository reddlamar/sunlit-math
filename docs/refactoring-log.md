# Refactoring log: `source-code-improvements`

Branch `source-code-improvements` was cut from the latest `origin/main`
(`c342c51`, release 1.2.1). It improves readability, maintainability, robustness
and efficiency **without changing what the app does**, apart from the bug fixes
listed below.

Baseline before any change: `tsc` clean, 200 tests passing, 3 lint warnings, no
import cycles. After: `tsc` clean, **233 tests passing**, 0 lint warnings, no cycles
(now enforced by a test), and the iOS bundle exports successfully.

## The plan

Each step followed the same loop: write or extend a test and watch it fail, make the
smallest change that passes, then run the whole suite.

| # | Goal | Principles |
| --- | --- | --- |
| 1 | Share one random/id helper module instead of two private copies | DRY, REP |
| 2 | Make problem generators data-driven and guarantee they terminate | DRY, OCP, KISS |
| 3 | Make score storage safe against corrupt data, failed reads and overlapping saves | Robustness |
| 4 | Fix the lost-update bug in settings and stop re-rendering every consumer | Bug fix, efficiency |
| 5 | Make unlock persistence best-effort so a paid purchase always completes | Bug fix |
| 6 | Move sound out of the game engine | DIP, SDP, ADP |
| 7 | One source of truth for lists (operations, difficulties, themes) | DRY, CCP |
| 8 | Name the repeated colors and share the modal styles | DRY, CRP |
| 9 | Split the summary screen out of `GameScreen` | SRP |
| 10 | Small smells: unused parameters and props, lint warnings | Clean code |
| 11 | Enforce the architecture with a test | ADP, SDP |
| 12 | Document the app, architecture, process and these changes | — |

## Changes and why

### 1. Shared helpers — `src/utils/random.ts`

`randomInt`, `shuffle` and the id generator existed as private functions in
`problemGenerators.ts`, with the id expression copy-pasted into `NameEntryModal`.
They now live in one small module with no dependencies.

`createId` also fixes a latent flaw: two ids made in the same millisecond differed
only by a random number below one million, so a collision was possible. A running
counter now makes them differ by construction.

### 2. Problem generators — `src/game/problemGenerators.ts`

*Before:* four near-identical functions, each repeating "pick a max, pick numbers,
build choices, make an id".
*After:* each operation is a small `OperationSpec` (limits per difficulty, how far
wrong answers may stray, how to make a question) given to one `createGenerator`
(Strategy pattern). Public exports are unchanged. Adding an operation is now adding
an entry to a table.

`buildChoices` previously drew random offsets in a `while` loop until it had three
distinct candidates. It worked only because the spreads happened to be wide enough;
a change to the numbers could have made it spin forever. It now lists the valid
candidates, shuffles them and takes three, so it always terminates and is a single
pass. Tests cover answers of 0 and 1, the tightest cases.

### 3. Score storage — `src/storage/scoresRepository.ts`

Three real problems:

1. **A corrupt value crashed the app.** `JSON.parse` was unguarded, so bad stored
   data rejected the promise the Home and Leaderboard screens were waiting on.
   Reads now treat unreadable or unparseable data as empty and skip entries that
   don't have the shape of a score.
2. **Overlapping saves lost scores.** `addScore` reads the list, appends, and writes
   it back. Two saves in flight would read the same list and the second would erase
   the first. Writes are now chained on a promise so they run one at a time.
3. **A failed read could wipe all scores.** If a read failed and was treated as
   "empty", the next save would overwrite the real list with one entry. The save
   path now stops on a read failure instead (display still shows "no scores").

### 4. Settings — `src/settings/SettingsContext.tsx`

*Bug:* each setter saved `{ ...the values it saw when it rendered, one change }`.
Changing two settings in the same tick (or before a re-render) saved a stale copy
and the first change was lost on disk, so it reverted after a restart.
*Fix:* one `update(patch)` builds the next settings from a ref that always holds the
newest values. Setters are `useCallback`s and the context value is `useMemo`-ed, so
a consumer only re-renders when a setting really changes. Storage failures on read
or write no longer produce unhandled rejections; the change still applies for the
session.

### 5. Purchases — `src/purchases/PurchaseContext.tsx`

When a purchase succeeded, the app saved the unlock to storage and *then* finished
the transaction. If that save threw, the transaction was never finished (the store
keeps retrying it) and the spinner never stopped. Local storage is only a head start;
the store is the source of truth, so `rememberUnlock()` now ignores write failures.
Reading the stored flag at launch is also guarded.

### 6. Decoupling sound from the engine — `useGameEngine` and `GameScreen`

The game engine called `playCorrectSound()` / `playWrongSound()` directly, so pure
game rules depended on audio, a platform concern. The engine now returns the result
(`'correct' | 'wrong' | 'ignored'`, which it already did) and `GameScreen`, which
already handled the shake, plays the sound. `game/` no longer imports `audio/`, which
makes the engine side-effect free and is covered by a test that fails if it ever
plays a sound again.

### 7. Single sources of truth

- `src/game/operations.ts` holds the operations with their symbol and label.
  Previously `HomeScreen` had the list with labels and `LeaderboardScreen` had a
  second list of symbols with hard-coded colors; both now read the registry.
  `scoresRepository` also uses it to validate stored entries.
- `DIFFICULTIES` and `THEMES` are now `as const` arrays in `types/game.ts`, and the
  `Difficulty` and `Theme` types are derived from them. They had been written twice:
  as a type and as a runtime list that could drift apart.

### 8. Colors and modal styles

- `staticColors` in `theme/tokens.ts` names the colors that don't change with the
  theme (`onColor` white, `danger` red, `neutralControl`, `splash`, `backdrop`).
  `#FFFFFF` was spelled out ten times, `#D92D20` four times, and the Save button
  re-declared the addition green. A test now fails if the splash color drifts from
  the native splash in `app.json`.
- `components/modalStyles.ts` holds the emoji, title, body, input, error, primary
  button and subtle label styles that `ParentalGate`, `UnlockModal`,
  `NameEntryModal` and `GetReadyModal` each had their own copy of. The first two had
  byte-identical blocks. Each component keeps only what genuinely differs.

### 9. `RoundSummary` — `src/components/RoundSummary.tsx`

`GameScreen` rendered two unrelated screens (the round and the post-round summary)
and carried styles for both. The summary moved into its own component with its own
tests, and `GameScreen` shrank by about 80 lines. It also reuses the existing
`isRoundInProgress` value instead of repeating the same comparison.

### 10. Small smells

- `TabIcon` took a `color` prop it ignored, and the navigator passed it anyway.
- `SettingsScreen` accepted navigation props it never used; the screen, its test and
  the unused `SettingsScreenProps` type no longer carry them.
- `AnswerButton`'s default color duplicated `choiceColors[0]`.
- Three `no-require-imports` lint warnings in tests: one redundant mock removed, one
  deliberate `require` (it must re-evaluate a module after `resetModules`) annotated.
- `NameEntryModal`: if saving failed, the promise rejected unhandled, nothing was
  shown, and the player was stuck. It now shows "Your score couldn't be saved. Please
  try again." and the new test found a second bug in the same flow: the message
  stayed on screen after a successful retry, so it is cleared when a save starts.

### 11. Architecture guard — `src/architecture.test.ts`

The dependency rules are written as a table in the test and in
[architecture.md](architecture.md). The test builds the import graph of every source
file and fails on (a) any cycle (ADP) and (b) any import that points to a layer not
in that layer's allowed list (SDP). It was checked by injecting a forbidden import and
confirming it fails.

### 12. Tooling

- `npm run typecheck` script added (CI keeps calling `tsc` directly).
- Coverage thresholds of 90% now also apply to `src/settings` and `src/utils`
  (both at 100%), next to the existing `src/game` and `src/storage`.

## Dependency analysis

| Principle | Before | After |
| --- | --- | --- |
| **ADP** (acyclic) | No cycles | No cycles, enforced by a test |
| **SDP** (depend toward stable) | `game` depended on `audio` | `game` depends only on `types` and `utils` |
| **CCP** (change together, live together) | Operation list in two screens; modal style in four files | `operations.ts`, `modalStyles.ts`, `staticColors` |
| **CRP** (don't force unused dependencies) | `SettingsScreen` took unused props | Props removed; `RoundSummary` pulls only what it uses |
| **REP** (reusable units are releasable units) | Helpers private to one file | `utils/random.ts` shared by `game`, `storage` and `components` |

## Considered and left alone

- **The score list grows without limit.** Only the top 10 are ever shown, but removing
  scores would delete players' data, which is a product decision, not a refactor.
- **Score ties** keep insertion order (older first). Changing it would alter the
  leaderboard.
- **`PurchaseContext` value is not memoized.** The `purchase` and `restore` closures
  depend on functions from `useIAP` that change identity, so memoizing would not stop
  the re-renders and would add noise.
- **`Settings` lives in `types/game.ts`.** Moving it would touch many imports for no
  behavior gain.
- **Pre-existing `act(...)` warnings** appear in a few purchase tests. They come from
  the store mock resolving after the test finishes and don't affect results.
- **`@types/node` (since declared).** The architecture test reads source files with `fs`, so it needs
  Node's types. They were only a transitive dependency; they are now a direct dev dependency
  (`^22`, matching the Node 22 used by CI and `.nvmrc`).
- **`useGameTimer.isRunning` and `sounds.isMuted`** are only used by tests. They are
  small, part of each module's public surface, and harmless.

## Verification

- `npm test`: 35 suites, 233 tests, all passing; coverage thresholds met.
- `npm run lint`: 0 problems. `npm run typecheck`: clean.
- `npx expo export --platform ios`: the production JS bundle builds.
- **Not done:** the app was not run on a simulator or device for this refactor, so
  the screens were not compared visually. The style changes only move existing
  values into shared definitions, but the iOS manual checklist should be run before
  a release that includes this branch.
