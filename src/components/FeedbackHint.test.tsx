import React from 'react';
import { render } from '@testing-library/react-native';
import { FeedbackHint } from './FeedbackHint';
import { SettingsProvider } from '../settings/SettingsContext';

const renderHint = (isMiss: boolean) =>
  render(
    <SettingsProvider>
      <FeedbackHint isMiss={isMiss} />
    </SettingsProvider>
  );

describe('FeedbackHint', () => {
  it('tells the player what to do while a round is going', async () => {
    const { getByTestId } = await renderHint(false);

    expect(getByTestId('feedback-hint')).toHaveTextContent('Ready: tap the answer');
  });

  it('says what just happened after a miss', async () => {
    const { getByTestId } = await renderHint(true);

    expect(getByTestId('feedback-hint')).toHaveTextContent('Miss: the right answer lights up');
  });

  it('is a polite live region, so a change is read out on Android', async () => {
    const { getByTestId } = await renderHint(false);

    expect(getByTestId('feedback-hint').props.accessibilityLiveRegion).toBe('polite');
  });
});
