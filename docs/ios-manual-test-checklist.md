# Sunlit Math – iOS manual test checklist

Focus: all four operations, the in-app unlock, and grandfathering of users who paid
to download (original build < 6, see `FIRST_FREE_BUILD` in `src/purchases/paidDownload.ts`).

> Simulator and TestFlight report `originalAppVersion` as `"1.0"`, which the app treats
> as *not paid*. Grandfathering (Part C) can only be verified on a real device with a
> real App Store install/update.

Record results as ✅ / ❌ with notes. Device/iOS: iPhone 16 Pro simulator, iOS 18.1 (E4 also on iPhone SE 3rd gen + iPad 10th gen)  Build: 1.1.0 debug dev client @ 3c67d3b  Tester: Claude Code (AXe-driven), 2026-09-30

## Part A – Free user, simulator or dev build (`npx expo run:ios`, Mac only)

Setup: erase the simulator app (long-press icon → Remove App) or Device > Erase All Content,
then reinstall so AsyncStorage is empty.

| # | Step | Expected | Result |
|---|------|----------|--------|
| A1 | Launch app | Splash, then Home with 4 buttons: Addition, Subtraction, Multiplication, Division | ✅ Home with 4 buttons; Sub/Mul/Div show lock. ⚠️ On every fresh launch iOS shows **"Sign in to Apple Account" twice** before Home is usable (from `getAppTransactionIOS` / transaction enumeration with no signed-in account) |
| A2 | Tap Addition | Get Ready countdown, then game starts (no unlock prompt) | ✅ Start → 3-2-1 countdown → game; no unlock prompt |
| A3 | Return home, tap Subtraction | "Unlock All Operations" modal | ✅ "Unlock All Operations" modal |
| A4 | Tap Multiplication, then Division | Same modal each time | ✅ Same modal for Multiplication and Division |
| A5 | Tap Maybe Later | Modal closes, Home remains, operations still locked | ✅ Modal closes, Home remains, ops still locked |
| A6 | Modal price label | "Unlock for $X.XX" (or plain "Unlock" if store products unavailable) | ✅ "Unlock for $2.99" (price fetched from sandbox) |

## Part B – Purchase flow (simulator with StoreKit config, or TestFlight sandbox account)

| # | Step | Expected | Result |
|---|------|----------|--------|
| B1 | Tap a locked operation → Unlock | Apple payment sheet | ⚠️ Partial – Unlock hands off to StoreKit, but the simulator has no Apple account/StoreKit config, so iOS shows the sign-in prompt, not the payment sheet |
| B2 | Cancel the sheet | Modal stays, locked, no crash, no stuck spinner | ✅ Cancel → modal stays, locked, no crash, no spinner. ⚠️ Shows red "User cancelled the purchase flow" error on a deliberate cancel |
| B3 | Unlock again, confirm | Modal closes/unlocks; all four operations open | ⛔ Not run – needs a sandbox Apple ID (no StoreKit config in project) |
| B4 | Force-quit and relaunch (airplane mode on) | Still unlocked (persisted) | ⚠️ Partial – with the stored unlock flag (`math60_unlocked_v1`) set, all ops stayed unlocked across relaunch. Real purchase + airplane mode not tested |
| B5 | Delete app, reinstall, tap Restore Purchase on locked op | Unlocks all four | ⛔ Not run – needs a sandbox purchase |
| B6 | Restore with an Apple ID that never bought | Stays locked, no crash | ❌ No account available; Restore → sign-in → Cancel: stays locked, no crash. ❌ Modal shows raw native error: "UnexpectedException: Request Canceled (at ExpoModulesCore/ConcurrentFunctionDefinition.swift:90)" |

## Part C – Grandfathered paid downloader (real device, production/TestFlight-independent)

Requires an Apple ID that downloaded build 3, 4 or 5 (paid or during the price change).

| # | Step | Expected | Result |
|---|------|----------|--------|
| C1 | On that device, update to build ≥ 6 from the App Store (or TestFlight-installed over it is NOT valid) | App updates | ⛔ Not run – real device only |
| C2 | Launch, wait a few seconds online | Subtraction, Multiplication, Division open with **no purchase** | ⛔ Not run – real device only |
| C3 | Try each operation | Unlock modal never appears | ⛔ Not run – real device only |
| C4 | Airplane mode, relaunch | Still unlocked (persisted) | ⛔ Not run – real device only |
| C5 | Fresh Apple ID that first downloaded build 6+ | Operations locked until purchase (control case) | ⛔ Not run – real device only |

## Part D – Each operation end to end (run once locked-free for Addition, unlocked for the rest)

For **each** of Addition (+), Subtraction (−), Multiplication (×), Division (÷):

| # | Step | Expected | Result |
|---|------|----------|--------|
| D1 | Select the operation | Get Ready countdown, then game | ❌ All 4 ops: Get Ready → 3-2-1 → game. ❌ Get Ready modal has no way out: Back and edge-swipe are blocked; you must Start the round, then Back |
| D2 | Read 5 problems | Question matches the operator; 4 answer choices; exactly one correct | ✅ All 4 ops: ~15 problems each, correct operator, 4 unique non-negative choices, exactly one correct |
| D3 | Answer correctly | Score +1, streak +1, positive feedback/sound | ✅ All 4 ops: 6 correct → score 12, streak 6 (+1 ×3, then +3 bonus). Sound not verifiable in simulator |
| D4 | Answer incorrectly | Streak resets, button shake, no crash | ❌ Streak → 0, score −1, no crash. ❌ No button shake – `AnswerButton` has no shake animation (only `OperationButton` shakes) |
| D5 | Reach a streak milestone | Milestone animation | ✅ Flame pop animation at streak 3 (and 6) |
| D6 | Division only | No remainders, no divide-by-zero; answers whole numbers | ✅ All division problems whole-number, divisor ≥ 1 |
| D7 | Subtraction only | No negative answers (or as designed) | ✅ No negative answers (saw 10 − 10 = 0, 1 − 1 = 0) |
| D8 | Let the 60 s timer expire | Game over, final score shown | ✅ "Time's up! You scored N" + name entry, all 4 ops |
| D9 | Restart / back to home | Restart shows Get Ready again with score reset; Home returns cleanly | ✅ Play Again → Get Ready, score/streak reset to 0; Restart mid-game → Get Ready, reset; Back returns Home |
| D10 | Score saved | Score appears in the Scores/high-score list under the right operation | ❌ Leaderboard filters +/−/×/÷ each show the right entries. ❌ Home "Top Score" card stays "No scores yet" after Back from a game (loads only on mount) |

## Part E – Settings & regression

| # | Step | Expected | Result |
|---|------|----------|--------|
| E1 | Settings: change difficulty (easy/medium/hard), play each op | Number ranges change accordingly | ✅ Addition (20 samples each): max operand 10 / 20 / 50 for Easy / Medium / Hard. Mul/Div ranges only covered by unit tests |
| E2 | Toggle Mute | No sound when muted | ⚠️ Not verifiable by ear in simulator; code check: `play()` returns early when muted |
| E3 | Toggle theme (light/dark) | UI legible in both, including unlock modal | ❌ Dark theme legible (Settings, Home, unlock modal, Get Ready, game). ⚠️ Home header banner keeps an opaque light background in dark mode. ❌ Unlock modal re-shows a stale error from an earlier attempt when reopened (`lastError` never cleared) |
| E4 | Rotate / small device (iPhone SE) and iPad | No clipped buttons | ✅ iPhone SE 3 and iPad 10th gen: no clipped buttons (portrait-only app). Cosmetic: on iPad the grid wraps 3+1 (Division alone on row 2) |
| E5 | Background app mid-game and return | No crash; timer behaviour sensible | ✅ No crash. ⚠️ Timer keeps running in background (56 s → 43 s after ~12 s away); game does not auto-pause |
| E6 | Kill app mid-purchase, relaunch | No stuck "purchasing" state | ✅ Killed during purchase sign-in; relaunch shows "Unlock for $2.99", no stuck spinner |

## Sign-off

- [ ] Parts A–B pass — A passes; B only partly run (no sandbox account); B6 shows raw exception
- [ ] Part C passes on a real device that installed build ≤ 5 — not run (needs real device)
- [ ] All four operations pass Part D — gameplay passes; D1 (no exit from Get Ready), D4 (no shake) and D10 (stale Home card) fail
- [x] No crashes or console errors — no crashes and no JS errors; only StoreKit "No active account" and system log noise
