import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { GetReadyModal } from './GetReadyModal';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

function renderModal(props: React.ComponentProps<typeof GetReadyModal>) {
  return render(
    <SettingsProvider>
      <GetReadyModal {...props} />
    </SettingsProvider>
  );
}

describe('GetReadyModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is not visible when visible is false', async () => {
    const { queryByTestId } = await renderModal({ visible: false, onReady: jest.fn() });
    expect(queryByTestId('get-ready-start-button')).toBeNull();
  });

  it('shows the intro with a Start button when visible', async () => {
    const { getByTestId, getByText } = await renderModal({ visible: true, onReady: jest.fn() });
    expect(getByText(/60 seconds/)).toBeTruthy();
    expect(getByTestId('get-ready-start-button')).toBeTruthy();
  });

  it('has a solid card background during the intro screen', async () => {
    const { getByTestId } = await renderModal({ visible: true, onReady: jest.fn() });
    expect(hasStyleValue(getByTestId('modal-card').props.style, 'backgroundColor', light.surface)).toBe(
      true
    );
  });

  it('has no solid card background once counting down, so the dimmed backdrop shows through', async () => {
    const { getByTestId } = await renderModal({ visible: true, onReady: jest.fn() });

    await fireEvent.press(getByTestId('get-ready-start-button'));

    expect(hasStyleValue(getByTestId('modal-card').props.style, 'backgroundColor', light.surface)).toBe(
      false
    );
  });

  it('counts down 3-2-1 after Start is pressed, then calls onReady', async () => {
    const onReady = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await renderModal({
      visible: true,
      onReady,
    });

    await fireEvent.press(getByTestId('get-ready-start-button'));

    expect(queryByTestId('get-ready-start-button')).toBeNull();
    expect(getByText('3')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('2')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('1')).toBeTruthy();

    expect(onReady).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('resets to the intro phase the next time it becomes visible', async () => {
    const onReady = jest.fn();
    const { getByTestId, rerender } = await renderModal({ visible: true, onReady });

    await fireEvent.press(getByTestId('get-ready-start-button'));

    await rerender(
      <SettingsProvider>
        <GetReadyModal visible={false} onReady={onReady} />
      </SettingsProvider>
    );
    await rerender(
      <SettingsProvider>
        <GetReadyModal visible onReady={onReady} />
      </SettingsProvider>
    );

    expect(getByTestId('get-ready-start-button')).toBeTruthy();
  });
});
