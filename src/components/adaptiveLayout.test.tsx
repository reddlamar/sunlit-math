import React from 'react';
import { useWindowDimensions } from 'react-native';
import { render } from '@testing-library/react-native';
import { AnswerButton } from './AnswerButton';
import { AnswerGrid } from './AnswerGrid';
import { OperationButton } from './OperationButton';
import { TimerBar } from './TimerBar';
import { SettingsProvider } from '../settings/SettingsContext';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const PHONE = { width: 390, height: 844 };
const IPAD_PORTRAIT = { width: 820, height: 1180 };
const IPAD_LANDSCAPE = { width: 1180, height: 820 };
const PHONE_LANDSCAPE = { width: 844, height: 390 };

const setWindow = ({ width, height }: { width: number; height: number }) =>
  (useWindowDimensions as jest.Mock).mockReturnValue({
    width,
    height,
    scale: 2,
    fontScale: 1,
  });

describe('components adapt to the window', () => {
  it('keeps a long label such as Multiplication on one line, shrinking it if the tile is small', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByText } = await render(
      <OperationButton
        operation="multiplication"
        symbol="×"
        label="Multiplication"
        onPress={jest.fn()}
      />
    );
    expect(getByText('Multiplication').props).toMatchObject({
      numberOfLines: 1,
      adjustsFontSizeToFit: true,
    });
  });

  describe('AnswerButton', () => {
    it.each([
      ['a phone', PHONE, 110, 32],
      ['an iPad in portrait', IPAD_PORTRAIT, 190, 44],
      ['an iPad in landscape', IPAD_LANDSCAPE, 150, 44],
      ['a phone turned sideways', PHONE_LANDSCAPE, 72, 32],
    ])('sizes the answer on %s', async (_name, window, height, fontSize) => {
      setWindow(window);
      const { getByRole, getByTestId } = await render(
        <SettingsProvider>
          <AnswerButton value={12} onPress={jest.fn()} />
        </SettingsProvider>
      );
      expect(getByRole('button')).toHaveStyle({ height });
      expect(getByTestId('answer-choice')).toHaveStyle({ fontSize });
    });
  });

  describe('AnswerGrid', () => {
    it.each([
      ['a phone', PHONE, 16],
      ['an iPad', IPAD_PORTRAIT, 20],
    ])('spaces the answers on %s', async (_name, window, gap) => {
      setWindow(window);
      const { getByTestId } = await render(
        <SettingsProvider>
          <AnswerGrid
            choices={[1, 2, 3, 4]}
            disabled={false}
            onAnswer={jest.fn()}
            shakeStyle={{}}
          />
        </SettingsProvider>
      );
      expect(getByTestId('answer-grid')).toHaveStyle({ gap });
    });
  });

  describe('TimerBar', () => {
    it.each([
      ['a phone', PHONE, 24, 16],
      ['an iPad in portrait', IPAD_PORTRAIT, 32, 16],
      ['an iPad in landscape', IPAD_LANDSCAPE, 32, 18],
      ['a phone turned sideways', PHONE_LANDSCAPE, 16, 16],
    ])('sizes the bar and the words on %s', async (_name, window, trackHeight, wordsSize) => {
      setWindow(window);
      const { getByTestId, getByText } = await render(
        <SettingsProvider>
          <TimerBar timeLeft={30000} duration={60000} />
        </SettingsProvider>
      );
      expect(getByTestId('timer-bar-track', { includeHiddenElements: true })).toHaveStyle({
        height: trackHeight,
      });
      expect(getByText('30 seconds left')).toHaveStyle({ fontSize: wordsSize });
    });
  });
});
