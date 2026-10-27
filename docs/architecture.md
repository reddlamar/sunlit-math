# Architecture

Sunlit Math is a React Native (Expo) app written in TypeScript. It has no backend:
everything runs on the device.

## Layers and the dependency rule

Source lives in `src/`, grouped by layer. A layer may only import from the layers
listed beside it, so dependencies always point toward the more stable, more
reusable code. [src/architecture.test.ts](../src/architecture.test.ts) enforces this
table and fails the build on any import cycle.

| Layer | Responsibility | May import |
| --- | --- | --- |
| `types` | Shared types and the lists they come from (`DIFFICULTIES`, `THEMES`) | — |
| `utils` | `randomInt`, `shuffle`, `createId` | — |
| `audio` | Sound pool and mute switch | — |
| `layout` | Window size classes, scale factor, tile sizing (`useLayout`, `useLayoutClass`) | — |
| `theme` | Color tokens, fonts, shadows | `types` |
| `game` | Pure game logic: generators, scoring, timer, engine, operation list | `types`, `utils` |
| `storage` | Persistent score list | `types`, `game` |
| `purchases` | Entitlements, parental gate, store integration | `types` |
| `settings` | Persisted settings and theme resolution | `types`, `theme`, `audio` |
| `components` | Reusable UI pieces | all layers below the screens, including `layout` |
| `screens` | Home, Game, Leaderboard, Settings | everything below |
| `navigation` | Route types and the navigator | `types`, `screens`, `settings` |

```
        screens ──► components ──► settings ──► theme ──► types
           │            │              └──► audio
           │            ├──► purchases
           ▼            ├──► storage ──► game ──► utils
       navigation       └──► game
```

Why it is shaped this way:

- **One place decides the layout class.** `layout/layout.ts` reads the window size with
  `useWindowDimensions` (so rotation, iPad Split View and Android multi-window just
  work) and returns a class: compact under 600 dp, medium 600 to 839, expanded 840 and
  up, the same breakpoints Android uses. It also returns `scale` (1 on phones, 1.4 on
  tablet-sized windows), `isLandscape`, `isShort` (a phone turned sideways: wide but
  not scaled up) and `contentWidth` (capped at 640 for readable columns), and `safeWidth` / `safeHeight` (the window minus the notch and home indicator, read from the safe-area context). Components
  multiply their phone-scale sizes by `scale` and never look at the device model.

- **`game` is pure.** It has no knowledge of audio, storage, React Native views or
  settings, so it is fast to test and could be reused by another front end.
- **`types`, `utils`, `audio` and `layout` are leaves.** Nothing they depend on changes when
  the UI changes (Stable Dependencies Principle).
- **No cycles.** The graph is a directed acyclic graph (Acyclic Dependencies
  Principle).

## Modules

### Game logic (`src/game`)

| File | Role |
| --- | --- |
| `operations.ts` | The single list of operations with their symbol and label, in menu order |
| `problemGenerators.ts` | One data-driven generator per operation (see Strategy below) |
| `scoring.ts` | Pure functions `onCorrectAnswer` and `onWrongAnswer` |
| `useGameTimer.ts` | Wall-clock countdown hook; used for both the 60 s round and the 3 s countdown |
| `useGameEngine.ts` | Combines the above into a round: status, problem, score, streak, pause/resume |

`useGameEngine` keeps the current problem and status in refs as well as state so
that callbacks always see the latest value and keep a stable identity while the
timer re-renders ten times a second. It reports each answer as `'correct'`,
`'wrong'` or `'ignored'` and leaves feedback to the screen.

### State providers

- **`SettingsProvider`** holds sound, theme and difficulty. It keeps the newest
  settings in a ref so several changes made at once are all saved, exposes stable
  setter functions, and memoizes the context value so unrelated renders don't
  ripple through every consumer.
- **`PurchaseProvider`** wraps `expo-iap`. It exposes `isUnlocked`, `price`,
  `purchase()`, `restore()` and a user-safe `lastError`.

Both are consumed through hooks (`useSettings`, `usePurchase`) that throw a clear
error if used outside their provider.

### UI

`components/` holds small, single-purpose pieces. The ones worth knowing:

- `AnimatedPressable` — every button: spring scale, haptic, tap sound.
- `ModalCard` + `modalStyles` — the shared card and typography for all four modals.
- `AnswerGrid` / `AnswerButton` — memoized so timer ticks don't rebuild buttons.
- `RoundSummary` — the post-round screen, rendered by `GameScreen`.
- `SegmentedControl` — generic over its option values, used by Settings.

## Design patterns in use

| Pattern | Where | Benefit |
| --- | --- | --- |
| **Strategy** | `problemGenerators.ts`: each operation is an `OperationSpec` (`maxOperand`, `spread`, `makeQuestion`) handed to one `createGenerator` | Adding an operation means adding data, not copying a generator |
| **Registry** | `operations.ts`, `GENERATORS` | One source of truth for names, symbols, labels |
| **Repository** | `scoresRepository.ts` hides AsyncStorage, JSON and validation behind `getAllScores`, `addScore`, `getTopScores` | Screens never see storage details |
| **Provider / Context** | `SettingsProvider`, `PurchaseProvider` | Dependency injection for UI |
| **Custom hooks** | `useGameEngine`, `useGameTimer`, `useShake` | Logic reused and tested apart from views |
| **Observer** | `AppState` and `Appearance` listeners | React to the OS without polling |
| **Facade** | `audio/sounds.ts` exposes `playCorrectSound()` and friends over a pool of players | Callers don't manage players |
| **Object pool** | The three-player round-robin pool per sound | Rapid taps never drop a sound |
| **Command queue** | `addScore` chains writes on a promise | Concurrent saves can't overwrite each other |

## Principles applied

- **Single Responsibility.** The engine runs rounds, the screen gives feedback,
  `RoundSummary` shows results, the repository stores scores.
- **Open/Closed.** New operations and difficulties are added through data tables.
- **Dependency Inversion.** `game` no longer imports `audio`; the screen, which
  knows about both, connects them.
- **DRY.** One operations list, one set of modal styles, one list of difficulties and
  themes, one id generator, named color tokens instead of repeated hex codes.
- **KISS.** Plain functions and a few small hooks; no state library.
- **Common Closure / Common Reuse.** Things that change together live together
  (all modal styling in `modalStyles.ts`; all operation metadata in `operations.ts`),
  and each folder contains things that are used together.

See the [refactoring log](refactoring-log.md) for what changed and why.

## Error handling

Reads from storage never crash the app: unreadable or corrupt data counts as "empty".
Writes that matter to the player (saving a score) report failure so the UI can say
so, while best-effort writes (remembering settings or the unlock locally) never
block the player. Store errors are translated into fixed, friendly messages so raw
native error text never reaches a child.
