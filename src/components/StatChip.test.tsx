import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { StatChip } from './StatChip';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const renderChip = (warm?: boolean) =>
  render(
    <SettingsProvider>
      <StatChip testID="chip" warm={warm}>
        <Text>Score 12</Text>
      </StatChip>
    </SettingsProvider>
  );

describe('StatChip', () => {
  it('holds its content', async () => {
    const { getByText } = await renderChip();

    expect(getByText('Score 12')).toBeTruthy();
  });

  it('is on the card surface by default', async () => {
    const { getByTestId } = await renderChip();

    expect(hasStyleValue(getByTestId('chip').props.style, 'backgroundColor', light.surface)).toBe(
      true
    );
  });

  it('takes the warm streak fill when asked', async () => {
    const { getByTestId } = await renderChip(true);

    expect(
      hasStyleValue(getByTestId('chip').props.style, 'backgroundColor', light.streakSoft)
    ).toBe(true);
  });
});
