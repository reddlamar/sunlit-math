import { AVATARS, avatarForName, avatarInfo, isAvatarId } from './avatars';

describe('avatars', () => {
  it('offers six animals with distinct ids and names', () => {
    expect(AVATARS).toHaveLength(6);
    expect(new Set(AVATARS.map((avatar) => avatar.id)).size).toBe(6);
    expect(new Set(AVATARS.map((avatar) => avatar.name)).size).toBe(6);
  });

  it('recognises exactly the known ids', () => {
    for (const { id } of AVATARS) {
      expect(isAvatarId(id)).toBe(true);
    }
    expect(isAvatarId('dragon')).toBe(false);
    expect(isAvatarId('Fox')).toBe(false);
    expect(isAvatarId(undefined)).toBe(false);
    expect(isAvatarId(3)).toBe(false);
  });

  it('looks an avatar up by id', () => {
    expect(avatarInfo('owl')).toEqual({ id: 'owl', name: 'Owl' });
  });

  it('finds the avatar that a saved name belongs to', () => {
    expect(avatarForName('Frog')).toEqual({ id: 'frog', name: 'Frog' });
  });

  it('finds none for a name typed before avatars existed', () => {
    expect(avatarForName('Maya')).toBeUndefined();
    expect(avatarForName('')).toBeUndefined();
    expect(avatarForName('frog')).toBeUndefined();
  });
});
