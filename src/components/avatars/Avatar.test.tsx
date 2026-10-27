import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from './Avatar';
import { PlayerAvatar } from './PlayerAvatar';
import { AVATAR_ART } from './avatarArt';
import { SettingsProvider } from '../../settings/SettingsContext';
import { AVATAR_IDS } from '../../types/game';

const HIDDEN = { includeHiddenElements: true };

describe('Avatar', () => {
  it.each(AVATAR_IDS)('draws the %s at the requested size', async (id) => {
    const { getByTestId } = await render(<Avatar id={id} size={44} />);

    const svg = getByTestId(`avatar-${id}`, HIDDEN);
    expect(svg.props.width).toBe(44);
    expect(svg.props.height).toBe(44);
  });

  it('is decoration, hidden from screen readers', async () => {
    const { getByTestId } = await render(<Avatar id="fox" size={48} />);

    const svg = getByTestId('avatar-fox', HIDDEN);
    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('gives every animal its own color, so they tell apart by more than their shape', () => {
    const colors = AVATAR_IDS.map((id) => AVATAR_ART[id].background);

    expect(new Set(colors).size).toBe(AVATAR_IDS.length);
  });

  it('draws something for every animal', () => {
    for (const id of AVATAR_IDS) {
      expect(AVATAR_ART[id].shapes.length).toBeGreaterThan(3);
    }
  });
});

describe('PlayerAvatar', () => {
  const renderPlayer = (entry: React.ComponentProps<typeof PlayerAvatar>['entry']) =>
    render(
      <SettingsProvider>
        <PlayerAvatar entry={entry} size={44} />
      </SettingsProvider>
    );

  it('shows the animal of a score that has one', async () => {
    const { getByTestId, queryByTestId } = await renderPlayer({ name: 'Owl', avatar: 'owl' });

    expect(getByTestId('avatar-owl', HIDDEN)).toBeTruthy();
    expect(queryByTestId('avatar-initial', HIDDEN)).toBeNull();
  });

  it('shows the first letter of a typed name for a score saved before avatars', async () => {
    const { getByTestId, getByText } = await renderPlayer({ name: ' maya' });

    expect(getByTestId('avatar-initial', HIDDEN)).toBeTruthy();
    expect(getByText('M', HIDDEN)).toBeTruthy();
  });
});
