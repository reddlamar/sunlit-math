import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const sources = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  streak: require('../../assets/sounds/streak.wav'),
} as const;

type SoundName = keyof typeof sources;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

function getPlayer(name: SoundName): AudioPlayer | null {
  if (!players[name]) {
    try {
      players[name] = createAudioPlayer(sources[name]);
    } catch {
      return null;
    }
  }
  return players[name] ?? null;
}

function play(name: SoundName) {
  const player = getPlayer(name);
  if (!player) {
    return;
  }
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
