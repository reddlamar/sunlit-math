type SoundsModule = typeof import('./sounds');

function loadSoundsModule() {
  jest.resetModules();
  // Re-requiring after resetModules() also re-runs the mocked 'expo-audio'
  // factory from jest.setup.js, so createAudioPlayer/preload must be
  // re-obtained here too — references captured before reset would point at
  // stale mocks.
  const audioMock = require('expo-audio');
  const sounds: SoundsModule = require('./sounds');
  return {
    sounds,
    mockCreateAudioPlayer: audioMock.createAudioPlayer as jest.Mock,
    mockPreload: audioMock.preload as jest.Mock,
  };
}

function totalPlayCalls(mockCreateAudioPlayer: jest.Mock): number {
  return mockCreateAudioPlayer.mock.results.reduce(
    (sum, result) => sum + (result.value as { play: jest.Mock }).play.mock.calls.length,
    0
  );
}

function distinctPlayedInstances(mockCreateAudioPlayer: jest.Mock): number {
  return new Set(
    mockCreateAudioPlayer.mock.results
      .map((result) => result.value as { play: jest.Mock })
      .filter((instance) => instance.play.mock.calls.length > 0)
  ).size;
}

describe('sounds: loading, not just retriggering', () => {
  it('preloads every sound source at module load, before any sound is ever triggered', () => {
    const { mockPreload } = loadSoundsModule();
    expect(mockPreload.mock.calls.length).toBe(4);
  });

  it('builds a pool of players for every sound at module load, not lazily on first use', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();

    // A fresh AudioPlayer loads its asset asynchronously — calling play() on
    // one created right at the moment of the first correct/wrong/streak
    // answer races that load and can silently play nothing. Building every
    // pool eagerly, at module scope, gives each instance the app's startup
    // time (plus the Get Ready screen's own countdown) to finish loading
    // well before it's ever actually needed.
    const instancesBuiltAtLoad = mockCreateAudioPlayer.mock.calls.length;
    expect(instancesBuiltAtLoad).toBeGreaterThan(1);

    // Actually triggering every sound afterward creates nothing new — proof
    // those instances already existed from module load, not lazily.
    sounds.playTapSound();
    sounds.playCorrectSound();
    sounds.playWrongSound();
    sounds.playStreakSound();
    expect(mockCreateAudioPlayer.mock.calls.length).toBe(instancesBuiltAtLoad);
  });
});

describe('sounds mute gate', () => {
  it('defaults to unmuted', () => {
    const { sounds } = loadSoundsModule();
    expect(sounds.isMuted()).toBe(false);
  });

  it('never calls play() while muted, even though every pool already exists from module load', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();
    sounds.setMuted(true);
    sounds.playWrongSound();
    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(0);
  });

  it('plays when unmuted, then plays nothing further once muted', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();
    sounds.playCorrectSound();
    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(1);

    sounds.setMuted(true);
    sounds.playCorrectSound();
    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(1);
  });
});

describe('sounds retriggering on rapid, consecutive answers', () => {
  it('plays a sound for every single correct-answer trigger, rotating across more than one pooled instance', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();

    sounds.playCorrectSound();
    sounds.playCorrectSound();
    sounds.playCorrectSound();

    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(3);
    // A single shared instance (the earlier bug) would mean every trigger
    // resolves to the same object no matter how many times it's called.
    expect(distinctPlayedInstances(mockCreateAudioPlayer)).toBeGreaterThan(1);
  });

  it('plays a sound for every single wrong-answer trigger, rotating across more than one pooled instance', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();

    sounds.playWrongSound();
    sounds.playWrongSound();

    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(2);
    expect(distinctPlayedInstances(mockCreateAudioPlayer)).toBeGreaterThan(1);
  });

  it('plays a sound for every single streak-milestone trigger', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();

    sounds.playStreakSound();
    sounds.playStreakSound();

    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(2);
  });

  it('reuses a bounded pool instead of growing one instance forever', () => {
    const { sounds, mockCreateAudioPlayer } = loadSoundsModule();

    for (let i = 0; i < 10; i++) {
      sounds.playStreakSound();
    }
    const instancesAfterTen = mockCreateAudioPlayer.mock.calls.length;

    for (let i = 0; i < 10; i++) {
      sounds.playStreakSound();
    }
    const instancesAfterTwenty = mockCreateAudioPlayer.mock.calls.length;

    expect(instancesAfterTwenty).toBe(instancesAfterTen);
    expect(totalPlayCalls(mockCreateAudioPlayer)).toBe(20);
  });
});
