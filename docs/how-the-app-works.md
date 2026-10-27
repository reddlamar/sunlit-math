# How Sunlit Math works

This page describes the app from the player's point of view and then explains the
rules behind each part. File paths point at where each rule lives in the code.

## The player's journey

1. **Splash.** The app holds a navy splash with the sun logo for at least one second
   and until the fonts have loaded ([App.tsx](../App.tsx)).
2. **Home.** Sunny the sun says hello above four large operation buttons (+ − × ÷),
   and a "Personal best" card shows the best score on the device and opens the
   leaderboard. A tab bar switches between Home and Settings (a side rail on wide
   windows).
3. **Get Ready.** Choosing an operation opens the game screen with a Get Ready card:
   "You have 60 seconds". Tapping **Start** runs a 3-2-1 countdown, then the round
   begins. **Back** leaves without playing.
4. **The round.** A question appears with four answer buttons. The timer bar and
   seconds counter run down from 60. Tapping an answer immediately shows the next
   question. The player can pause, resume, or restart (with a confirmation).
5. **Time's up.** The round ends and the score is saved at once, under the animal the
   player used last (Fox the first time). A wrong answer along the way showed the right
   one for about a second, with the clock stopped.
6. **Result.** Sunny cheers, one to three stars say how the round compared with the
   player's best on that operation and level (three for a new best, two for within
   three quarters of it or a first round, one otherwise), and the score and best are
   shown. **Pick your player** changes the animal on the saved score. **Play again** and
   **Home** follow.

## Game rules

### Questions

Each operation has its own generator ([src/game/problemGenerators.ts](../src/game/problemGenerators.ts)).
The largest number used depends on the difficulty chosen in Settings:

| Difficulty | Addition and subtraction | Multiplication and division |
| --- | --- | --- |
| Easy | up to 10 | up to 5 |
| Medium | up to 20 | up to 10 |
| Hard | up to 50 | up to 12 |

- **Subtraction** never produces a negative answer.
- **Division** is always exact and never divides by zero: the question is built from
  the answer (`divisor × answer ÷ divisor`).
- Every question has **four distinct, non-negative choices**, shown in a fixed 2 × 2 grid: the
  right answer plus three wrong ones that fall near it. How near depends on the operation, so wrong
  answers look plausible.

### Scoring

([src/game/scoring.ts](../src/game/scoring.ts))

| Event | Effect |
| --- | --- |
| Correct answer | +1 point, streak +1 |
| Correct answer once the streak is above 3 | +3 points instead of +1 |
| Wrong answer | −1 point, streak resets to 0 |

The streak flame lights up from a streak of 3, and every multiple of 3 plays a
milestone sound with a pop animation. The score can go below zero.

### The timer

A round lasts 60 seconds ([src/game/useGameEngine.ts](../src/game/useGameEngine.ts)).
The timer measures real (wall-clock) time and refreshes ten times a second
([src/game/useGameTimer.ts](../src/game/useGameTimer.ts)). Because it is wall-clock
time:

- **Pausing** stores the time left and resumes from exactly that point.
- **Backgrounding the app** (a call, switching apps) pauses the round automatically
  so the player isn't punished for it.
- **Leaving mid-round** with the back button or swipe asks for confirmation, since
  the score would be lost. Restarting asks too.

### Feedback

Every press gives a small spring animation, a light haptic tap and a tap sound.
Correct and wrong answers have their own sounds; a wrong answer also shakes the
answer grid. Sound can be turned off in Settings (haptics stay on).

## Free and unlocked content

([src/purchases](../src/purchases))

- **Addition is free.** Subtraction, multiplication and division are unlocked by a
  one-time in-app purchase (`com.reddlamar.sunlitmath.unlock_operations`).
- **Parental gate.** The unlock screen is behind an "Ask a grown-up" gate, as the
  App Store Kids Category requires. The grown-up must type a random three-digit
  number that is shown in words ("four hundred thirty-eight"). A wrong answer
  replaces the number so it can't be guessed one digit at a time.
- **Restore Purchase** re-checks the store for an existing purchase.
- **Grandfathering.** People who paid for the app before it became free keep
  everything unlocked. On iOS the app reads the original download's build number
  from StoreKit; builds below `FIRST_FREE_BUILD` (6) count as paid downloads.
- The unlock is also remembered on the device so it works immediately on the next
  launch, before the store has answered. The store remains the source of truth.

## Settings

([src/settings](../src/settings))

The Settings tab is headed "Grown-up area": one card per setting, plus an "Unlock all
games" card (until the purchase is owned) that opens the parental gate first.

| Setting | Options | Notes |
| --- | --- | --- |
| Sound | On / Off | Mutes tap, correct, wrong and streak sounds |
| Theme | Auto / Light / Dark | Auto (the default) follows the phone's appearance live; picking Light or Dark fixes it |
| Difficulty | Easy / Medium / Hard | Applies to the next round |

## Leaderboard

([src/storage/scoresRepository.ts](../src/storage/scoresRepository.ts))

Scores are stored only on the device. The leaderboard shows the top 10, highest
first, each row showing its place, the player's animal (or an initial, for older scores
saved with a typed name), the score, and the operation and level it was earned on. It can
be filtered by game and by difficulty level (All levels, Easy, Medium, Hard); on a wide
landscape window the title and filters sit in a column beside the list. Scores saved before 1.2.2 have no level; they
appear under "All levels" only. Nothing is sent anywhere; see the [privacy policy](privacy-policy.html).

## Data stored on the device

All keys live in AsyncStorage:

| Key | Contents |
| --- | --- |
| `math60_scores_v1` | List of `{ id, name, score, operation, difficulty?, avatar?, createdAt }`; `avatar` is one of fox, owl, bear, cat, frog, bunny, and `name` is then the animal's name |
| `math60_last_name_v1` | The last animal's name, used to pre-select it. A name typed before 1.4.0 matches no animal |
| `math60_settings_v1` | `{ muted, theme, difficulty }` (`theme` is `null` until chosen) |
| `math60_unlocked_v1` | `"true"` once the unlock is owned |

The key names keep the app's original working title, "Math In 60 Seconds", so
existing players' data carries over. Stored data is validated on read: corrupt or
unreadable data is ignored instead of crashing the app.

## Screens and navigation

```
RootStack
├── MainTabs (no header)
│   ├── Home
│   └── Settings
├── Game          (param: operation)
└── Leaderboard   (param: optional operation filter)
```

Routes and their parameters are typed in [src/navigation/types.ts](../src/navigation/types.ts).
