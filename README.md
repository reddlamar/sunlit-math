# Sunlit Math

A fast-paced arithmetic game for kids: you get 60 seconds and as many problems
as you can solve. Pick addition, subtraction, multiplication, or division,
answer multiple-choice problems before the timer runs out, and chain correct
answers together to build a streak for bonus points.

Available for iOS and Android.

## Features

- Four operations, each with its own color-coded mode
- Live timer bar and running score
- Pause, resume, or restart anytime
- On-device leaderboard, filterable by operation
- Easy / Medium / Hard difficulty, light and dark themes, sound on/off
- Haptic feedback and toggleable sound effects
- Works entirely offline — no accounts, no ads, no data collection

## Getting started

Requires Node 22+ and, for native builds, Xcode (iOS) or Android Studio (Android).

```bash
npm install
npm start          # Expo dev server
npm run ios        # build and run the iOS dev client
npm run android    # build and run the Android dev client
```

| Script | What it does |
| --- | --- |
| `npm test` | Jest unit and component tests |
| `npm run test:coverage` | Tests plus the coverage thresholds CI enforces |
| `npm run lint` | ESLint (Expo config) |
| `npm run typecheck` | `tsc --noEmit` in strict mode |

## Documentation

| Document | Read it to learn |
| --- | --- |
| [How the app works](docs/how-the-app-works.md) | What a player sees, the game rules, scoring, difficulty, purchases and data storage |
| [Architecture](docs/architecture.md) | Layers, dependency rules, design patterns and the main modules |
| [How the app was developed](docs/development-process.md) | Tech stack, development workflow, testing strategy, CI and release process |
| [Refactoring log](docs/refactoring-log.md) | The `source-code-improvements` plan, every change, and why it was made |
| [iOS manual test checklist](docs/ios-manual-test-checklist.md) | Manual release checks that automated tests can't cover |

## Support

Having trouble with the app or found a bug? Reach out:

- Email: [reddlamar1@gmail.com](mailto:reddlamar1@gmail.com)
- [Open an issue](https://github.com/reddlamar/sunlit-math/issues)
