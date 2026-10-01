import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ParentalGate } from './ParentalGate';
import { SettingsProvider } from '../settings/SettingsContext';

function renderGate(onPass = jest.fn(), onCancel = jest.fn()) {
  return render(
    <SettingsProvider>
      <ParentalGate onPass={onPass} onCancel={onCancel} />
    </SettingsProvider>
  );
}

describe('ParentalGate', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('asks a grown-up to type a number written in words', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { getByText, getByTestId } = await renderGate();

    expect(getByText('Ask a grown-up')).toBeTruthy();
    expect(getByTestId('parental-gate-words')).toHaveTextContent('one hundred one');
  });

  it('calls onPass when the number is typed in digits', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const onPass = jest.fn();
    const { getByTestId } = await renderGate(onPass);

    await fireEvent.changeText(getByTestId('parental-gate-input'), '101');
    await fireEvent.press(getByTestId('parental-gate-submit'));

    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('shows an error and a new number after a wrong answer', async () => {
    // 101 for the first number, then 550 after the wrong answer.
    jest.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.5);
    const onPass = jest.fn();
    const { getByTestId, getByText } = await renderGate(onPass);

    await fireEvent.changeText(getByTestId('parental-gate-input'), '110');
    await fireEvent.press(getByTestId('parental-gate-submit'));

    expect(onPass).not.toHaveBeenCalled();
    expect(getByText("That's not right. Try this one instead.")).toBeTruthy();
    expect(getByTestId('parental-gate-words')).toHaveTextContent('five hundred fifty');
    expect(getByTestId('parental-gate-input').props.value).toBe('');

    // The old answer no longer works.
    await fireEvent.changeText(getByTestId('parental-gate-input'), '101');
    await fireEvent.press(getByTestId('parental-gate-submit'));
    expect(onPass).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is pressed', async () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = await renderGate(onPass, onCancel);

    await fireEvent.press(getByTestId('parental-gate-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onPass).not.toHaveBeenCalled();
  });
});
