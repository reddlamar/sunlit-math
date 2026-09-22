import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ModalCard } from './ModalCard';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

function renderModalCard(props: Partial<React.ComponentProps<typeof ModalCard>> = {}) {
  return render(
    <SettingsProvider>
      <ModalCard visible {...props}>
        <Text>Card content</Text>
      </ModalCard>
    </SettingsProvider>
  );
}

describe('ModalCard', () => {
  it('renders its children when visible', async () => {
    const { getByText } = await renderModalCard({ visible: true });
    expect(getByText('Card content')).toBeTruthy();
  });

  it('does not render its children when not visible', async () => {
    const { queryByText } = await renderModalCard({ visible: false });
    expect(queryByText('Card content')).toBeNull();
  });

  it('gives the card a solid theme background by default', async () => {
    const { getByTestId } = await renderModalCard();
    expect(hasStyleValue(getByTestId('modal-card').props.style, 'backgroundColor', light.surface)).toBe(
      true
    );
  });

  it('omits the card background when transparentCard is set, so the backdrop shows through', async () => {
    const { getByTestId } = await renderModalCard({ transparentCard: true });
    expect(hasStyleValue(getByTestId('modal-card').props.style, 'backgroundColor', light.surface)).toBe(
      false
    );
  });
});
