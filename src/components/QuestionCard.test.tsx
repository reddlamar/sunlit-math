import React from 'react';
import { render } from '@testing-library/react-native';
import { QuestionCard } from './QuestionCard';
import { SettingsProvider } from '../settings/SettingsContext';

const renderCard = (props: Partial<React.ComponentProps<typeof QuestionCard>> = {}) =>
  render(
    <SettingsProvider>
      <QuestionCard question="8 × 7" {...props} />
    </SettingsProvider>
  );

describe('QuestionCard', () => {
  it('shows the question at 72 dp by default', async () => {
    const { getByText } = await renderCard();

    expect(getByText('8 × 7')).toHaveStyle({ fontSize: 72 });
  });

  it('can be drawn smaller, as on a phone turned sideways', async () => {
    const { getByText } = await renderCard({ fontSize: 48 });

    expect(getByText('8 × 7')).toHaveStyle({ fontSize: 48 });
  });

  it('keeps a long sum on one line, shrinking it if the card is narrow', async () => {
    const { getByText } = await renderCard({ question: '144 ÷ 12' });

    expect(getByText('144 ÷ 12').props).toMatchObject({
      numberOfLines: 1,
      adjustsFontSizeToFit: true,
      minimumFontScale: 0.5,
    });
  });
});
