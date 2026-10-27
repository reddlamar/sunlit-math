import React from 'react';
import { useWindowDimensions } from 'react-native';
import { render } from '@testing-library/react-native';
import { AnswerButton } from './AnswerButton';
import { AnswerGrid } from './AnswerGrid';
import { OperationButton } from './OperationButton';
import { RoundSummary } from './RoundSummary';
import { SegmentedControl } from './SegmentedControl';
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
  describe('OperationButton', () => {
    const renderTile = () =>
      render(
        <OperationButton operation="addition" symbol="+" label="Addition" onPress={jest.fn()} />
      );

    it.each([
      ['a phone', PHONE, 161, 52],
      ['an iPad in portrait', IPAD_PORTRAIT, 286, 72.8],
      ['an iPad in landscape', IPAD_LANDSCAPE, 268, 72.8],
      ['a phone turned sideways', PHONE_LANDSCAPE, 184, 52],
    ])('sizes its tile and symbol on %s', async (_name, window, size, symbolSize) => {
      setWindow(window);
      const { getByRole, getByText } = await renderTile();
      expect(getByRole('button')).toHaveStyle({ width: size, height: size });
      expect(getByText('+')).toHaveStyle({ fontSize: symbolSize });
    });
  });

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
      ['a phone', PHONE, 96, 32],
      ['an iPad', IPAD_PORTRAIT, 134.4, 44.8],
      ['a phone turned sideways', PHONE_LANDSCAPE, 72, 32],
    ])('sizes the answer on %s', async (_name, window, minHeight, fontSize) => {
      setWindow(window);
      const { getByRole, getByTestId } = await render(
        <AnswerButton value={12} onPress={jest.fn()} />
      );
      expect(getByRole('button')).toHaveStyle({ minHeight });
      expect(getByTestId('answer-choice')).toHaveStyle({ fontSize });
    });
  });

  describe('AnswerGrid', () => {
    it.each([
      ['a phone', PHONE, 440],
      ['an iPad', IPAD_PORTRAIT, 616],
    ])('limits the board width on %s', async (_name, window, maxWidth) => {
      setWindow(window);
      const { getByTestId } = await render(
        <AnswerGrid choices={[1, 2, 3, 4]} disabled={false} onAnswer={jest.fn()} shakeStyle={{}} />
      );
      expect(getByTestId('answer-grid')).toHaveStyle({ maxWidth });
    });
  });

  describe('TimerBar', () => {
    it.each([
      ['a phone', PHONE, 16, 22],
      ['an iPad', IPAD_PORTRAIT, 22.4, 30.8],
    ])('sizes the bar and seconds on %s', async (_name, window, trackHeight, secondsSize) => {
      setWindow(window);
      const { getByTestId, getByText } = await render(
        <SettingsProvider>
          <TimerBar timeLeft={30000} duration={60000} />
        </SettingsProvider>
      );
      expect(getByTestId('timer-bar-track')).toHaveStyle({
        height: trackHeight,
      });
      expect(getByText('30')).toHaveStyle({ fontSize: secondsSize });
    });
  });

  describe('RoundSummary', () => {
    it.each([
      ['a phone', PHONE, 24, 40],
      ['an iPad', IPAD_PORTRAIT, 33.6, 56],
    ])('sizes the title and score on %s', async (_name, window, titleSize, scoreSize) => {
      setWindow(window);
      const { getByText } = await render(
        <SettingsProvider>
          <RoundSummary
            name="Maya"
            score={12}
            operation="addition"
            onPlayAgain={jest.fn()}
            onViewLeaderboard={jest.fn()}
          />
        </SettingsProvider>
      );
      expect(getByText('Nice work, Maya!')).toHaveStyle({ fontSize: titleSize });
      expect(getByText('12 points')).toHaveStyle({ fontSize: scoreSize });
    });
  });

  describe('SegmentedControl', () => {
    it.each([
      ['a phone', PHONE, 14, 10],
      ['an iPad', IPAD_PORTRAIT, 19.6, 14],
    ])('sizes the label and touch height on %s', async (_name, window, fontSize, padding) => {
      setWindow(window);
      const { getByText, getByTestId } = await render(
        <SegmentedControl
          options={[{ value: 'a', label: 'Alpha' }]}
          value="a"
          onChange={jest.fn()}
          accessibilityLabel="Test"
          testID="seg"
        />
      );
      expect(getByText('Alpha')).toHaveStyle({ fontSize });
      expect(getByTestId('seg-a')).toHaveStyle({ paddingVertical: padding });
    });
  });
});
