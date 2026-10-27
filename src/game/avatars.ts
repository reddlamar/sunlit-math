import { AVATAR_IDS, type AvatarId } from '../types/game';

export type AvatarInfo = { id: AvatarId; name: string };

// A Record, so adding an avatar id without a name is a type error.
const NAMES: Record<AvatarId, string> = {
  fox: 'Fox',
  owl: 'Owl',
  bear: 'Bear',
  cat: 'Cat',
  frog: 'Frog',
  bunny: 'Bunny',
};

/** The animals a child picks from instead of typing a name, in picker order. */
export const AVATARS: readonly AvatarInfo[] = AVATAR_IDS.map((id) => ({ id, name: NAMES[id] }));

export function isAvatarId(value: unknown): value is AvatarId {
  return AVATAR_IDS.some((id) => id === value);
}

export function avatarInfo(id: AvatarId): AvatarInfo {
  return { id, name: NAMES[id] };
}

/**
 * The avatar a saved name belongs to, so the picker can open on the last player's animal.
 * Scores saved before avatars have typed names, which match none.
 */
export function avatarForName(name: string): AvatarInfo | undefined {
  return AVATARS.find((avatar) => avatar.name === name);
}
