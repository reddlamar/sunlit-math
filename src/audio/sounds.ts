import { createAudioPlayer, preload, type AudioPlayer } from 'expo-audio';

const sources = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  streak: require('../../assets/sounds/streak.wav'),
} as const;

type SoundName = keyof typeof sources;

// A single reused AudioPlayer can't reliably replay itself if it's retriggered
// before the previous playback (and its async seekTo) has settled — exactly
// what happens when a player taps through several answers quickly, which
// silently dropped sounds. A small round-robin pool per sound gives every
// rapid trigger its own player instance instead of racing one shared one.
const POOL_SIZE = 3;

// A freshly created AudioPlayer loads its asset asynchronously (see its
// `isLoaded` status) — calling play() before that finishes can play nothing
// audible at all. That's what made the very first correct/wrong/streak sound
// of a round unreliable: the old code built each pool lazily, right at the
// moment of the first trigger, racing that load. Preloading and building
// every pool here, at module scope, gives each instance the app's startup
// time — plus the Get Ready screen's own countdown before a round can even
// begin — to finish loading well before it's ever actually needed.
for (const source of Object.values(sources)) {
  preload(source).catch(() => {});
}

function buildPool(name: SoundName): AudioPlayer[] | null {
  try {
    return Array.from({ length: POOL_SIZE }, () => createAudioPlayer(sources[name]));
  } catch {
    return null;
  }
}

const pools: Record<SoundName, AudioPlayer[] | null> = {
  tap: buildPool('tap'),
  correct: buildPool('correct'),
  wrong: buildPool('wrong'),
  streak: buildPool('streak'),
};

const nextPoolIndex: Partial<Record<SoundName, number>> = {};

let muted = false;

export function setMuted(next: boolean) {
  muted = next;
}

export function isMuted(): boolean {
  return muted;
}

function play(name: SoundName) {
  if (muted) {
    return;
  }
  const pool = pools[name];
  if (!pool) {
    return;
  }
  const index = (nextPoolIndex[name] ?? 0) % pool.length;
  nextPoolIndex[name] = index + 1;
  const player = pool[index];
  try {
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Ignore playback errors — sound is a nice-to-have, never worth crashing over.
  }
}

export const playTapSound = () => play('tap');
export const playCorrectSound = () => play('correct');
export const playWrongSound = () => play('wrong');
export const playStreakSound = () => play('streak');
