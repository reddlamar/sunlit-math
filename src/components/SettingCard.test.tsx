import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SettingCard } from './SettingCard';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

describe('SettingCard', () => {
  const renderCard = () =>
    render(
      <SettingsProvider>
        <SettingCard title="Sound">
          <Text>controls</Text>
        </SettingCard>
      </SettingsProvider>
    );

  it('shows its title as a heading over its controls', async () => {
    const { getByRole, getByText } = await renderCard();

    expect(getByRole('header')).toHaveTextContent('Sound');
    expect(getByText('controls')).toBeTruthy();
  });

  it('draws the title in the theme text color', async () => {
    const { getByText } = await renderCard();

    expect(hasStyleValue(getByText('Sound').props.style, 'color', light.textPrimary)).toBe(true);
  });
});
