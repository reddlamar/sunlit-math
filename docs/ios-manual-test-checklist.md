# Sunlit Math – iOS manual test checklist

Focus: all four operations, the in-app unlock, and grandfathering of users who paid
to download (original build < 6, see `FIRST_FREE_BUILD` in `src/purchases/paidDownload.ts`).

> Simulator and TestFlight report `originalAppVersion` as `"1.0"`, which the app treats
> as *not paid*. Grandfathering (Part C) can only be verified on a real device with a
> real App Store install/update.

Record results as ✅ / ❌ with notes. Device/iOS: ________  Build: ________  Tester: ________

## Part A – Free user, simulator or dev build (`npx expo run:ios`, Mac only)

Setup: erase the simulator app (long-press icon → Remove App) or Device > Erase All Content,
then reinstall so AsyncStorage is empty.

| # | Step | Expected | Result |
|---|------|----------|--------|
| A1 | Launch app | Splash, then Home with 4 buttons: Addition, Subtraction, Multiplication, Division | |
| A2 | Tap Addition | Get Ready countdown, then game starts (no unlock prompt) | |
| A3 | Return home, tap Subtraction | "Unlock All Operations" modal | |
| A4 | Tap Multiplication, then Division | Same modal each time | |
| A5 | Tap Maybe Later | Modal closes, Home remains, operations still locked | |
| A6 | Modal price label | "Unlock for $X.XX" (or plain "Unlock" if store products unavailable) | |

## Part B – Purchase flow (simulator with StoreKit config, or TestFlight sandbox account)

| # | Step | Expected | Result |
|---|------|----------|--------|
| B1 | Tap a locked operation → Unlock | Apple payment sheet | |
| B2 | Cancel the sheet | Modal stays, locked, no crash, no stuck spinner | |
| B3 | Unlock again, confirm | Modal closes/unlocks; all four operations open | |
| B4 | Force-quit and relaunch (airplane mode on) | Still unlocked (persisted) | |
| B5 | Delete app, reinstall, tap Restore Purchase on locked op | Unlocks all four | |
| B6 | Restore with an Apple ID that never bought | Stays locked, no crash | |

## Part C – Grandfathered paid downloader (real device, production/TestFlight-independent)

Requires an Apple ID that downloaded build 3, 4 or 5 (paid or during the price change).

| # | Step | Expected | Result |
|---|------|----------|--------|
| C1 | On that device, update to build ≥ 6 from the App Store (or TestFlight-installed over it is NOT valid) | App updates | |
| C2 | Launch, wait a few seconds online | Subtraction, Multiplication, Division open with **no purchase** | |
| C3 | Try each operation | Unlock modal never appears | |
| C4 | Airplane mode, relaunch | Still unlocked (persisted) | |
| C5 | Fresh Apple ID that first downloaded build 6+ | Operations locked until purchase (control case) | |

## Part D – Each operation end to end (run once locked-free for Addition, unlocked for the rest)

For **each** of Addition (+), Subtraction (−), Multiplication (×), Division (÷):

| # | Step | Expected |
|---|------|----------|
| D1 | Select the operation | Get Ready countdown, then game |
| D2 | Read 5 problems | Question matches the operator; 4 answer choices; exactly one correct |
| D3 | Answer correctly | Score +1, streak +1, positive feedback/sound |
| D4 | Answer incorrectly | Streak resets, button shake, no crash |
| D5 | Reach a streak milestone | Milestone animation |
| D6 | Division only | No remainders, no divide-by-zero; answers whole numbers |
| D7 | Subtraction only | No negative answers (or as designed) |
| D8 | Let the 60 s timer expire | Game over, final score shown |
| D9 | Restart / back to home | Restart shows Get Ready again with score reset; Home returns cleanly |
| D10 | Score saved | Score appears in the Scores/high-score list under the right operation |

## Part E – Settings & regression

| # | Step | Expected | Result |
|---|------|----------|--------|
| E1 | Settings: change difficulty (easy/medium/hard), play each op | Number ranges change accordingly | |
| E2 | Toggle Mute | No sound when muted | |
| E3 | Toggle theme (light/dark) | UI legible in both, including unlock modal | |
| E4 | Rotate / small device (iPhone SE) and iPad | No clipped buttons | |
| E5 | Background app mid-game and return | No crash; timer behaviour sensible | |
| E6 | Kill app mid-purchase, relaunch | No stuck "purchasing" state | |

## Sign-off

- [ ] Parts A–B pass
- [ ] Part C passes on a real device that installed build ≤ 5
- [ ] All four operations pass Part D
- [ ] No crashes or console errors
