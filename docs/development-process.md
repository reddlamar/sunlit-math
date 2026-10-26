# How the app was developed

This is a short history of how Sunlit Math was built and the practices that kept
it healthy. It is written from the repository's history (65 commits, August to
October 2026) and its configuration.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 57 with React Native 0.86 and React 19.2 |
| Language | TypeScript 6 in strict mode |
| Navigation | React Navigation 7 (native stack plus bottom tabs) |
| Storage | `@react-native-async-storage/async-storage` |
| Audio / haptics | `expo-audio`, `expo-haptics` |
| Purchases | `expo-iap` (StoreKit on iOS, Play Billing on Android) |
| Font | Baloo 2 via `@expo-google-fonts/baloo-2` |
| Tests | Jest 29 with `jest-expo` and React Native Testing Library |
| Lint | ESLint 9 with `eslint-config-expo` |
| Build and release | EAS Build and EAS Submit |

Expo lets one TypeScript codebase produce both the iOS and Android apps, with native
modules added as config plugins rather than hand-edited native projects.

## Timeline

1. **v1 (late August).** Built with TDD (the commit is titled "Build Math In 60
   Seconds v1 with TDD"): game logic, scores on the device, and the Home, Game and
   Leaderboard screens.
2. **Store preparation.** Splash screen, icon, privacy policy, store screenshots,
   encryption declaration and EAS configuration.
3. **Kid-friendly redesign.** Color-coded operations, in-game pause and restart.
4. **In-app purchase.** Addition stays free; the other three operations unlock with
   a one-time purchase. The app was later rebranded to *Sunlit Math* (new bundle
   id and SKU).
5. **v1.1 (September).** Sound effects, streak milestone animation, a rounded font,
   Settings (theme, difficulty, mute) and the Get Ready countdown.
6. **v1.2.** Free download with grandfathering for earlier paying users, a CI
   workflow, an iOS manual test checklist, and a parental gate in front of the
   purchase (Kids Category requirement).
7. **v1.2.1.** Render-count reductions and protection from accidentally losing a
   round (confirm on leave and restart, auto-pause when backgrounded).
8. **Source-code improvements.** The refactor documented in the
   [refactoring log](refactoring-log.md).

## Working practices

### Test-driven development

New behavior starts as a failing test. Game rules, storage and settings are covered
at 90% or more by thresholds in `package.json`; screens and components are tested
through their rendered output with Testing Library (finding things by text, role and
test id, as a person would). Bug reports become regression tests first. Pure logic
is kept out of components so it can be tested without rendering.

Test layout: each file has a `*.test.ts(x)` beside it. Shared helpers live in
`src/testUtils`. Native modules are mocked once in `jest.setup.js` and
`__mocks__/expo-iap.js`.

### Branches and pull requests

Work happens on a branch, merges to `main` by pull request, and releases are cut from
a `release/x.y.z` branch that bumps the version. `main` always builds.

### Continuous integration

[.github/workflows/ci.yml](../.github/workflows/ci.yml) runs on every pull request
and push to `main`:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run test:coverage -- --ci` (fails below the coverage thresholds)
4. `expo-doctor` and an iOS bundle export, which catch configuration and native
   dependency problems without paying for an EAS build

### Manual testing

Some things only a device can show: purchases, grandfathering, safe areas and
keyboard behavior. [ios-manual-test-checklist.md](ios-manual-test-checklist.md)
lists those checks with recorded results for each release.

### Releasing

iOS builds are made with the EAS CLI (`production` profile auto-increments the build
number) and submitted to App Store Connect. The first free build number is recorded
in `FIRST_FREE_BUILD` so earlier paying customers stay unlocked. Store listing text,
screenshots and marketing material live in `store-assets/`.

## Conventions

- Colors come from `src/theme/tokens.ts`; screens never hard-code hex values.
- Anything that touches the outside world (storage, audio, the store) sits behind a
  small module that tests can replace.
- Comments explain *why* (a platform quirk, a race, a store rule), not what the code
  already says.
- Components that re-render ten times a second are memoized and given stable
  callbacks; this is covered by tests, not just comments.
