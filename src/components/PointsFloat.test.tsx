import React from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { PointsFloat, formatPointsChange } from './PointsFloat';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
import type { AnswerOutcome } from '../types/game';

const HIDDEN = { includeHiddenElements: true };
const problem = { id: 'p', question: '8 × 7', answer: 56, choices: [54, 56, 58, 63] };
const outcome = (result: 'correct' | 'wrong', points: number): AnswerOutcome => ({
  id: 1,
  problem,
  chosen: result === 'correct' ? 56 : 54,
  result,
  points,
});

const renderFloat = (value: AnswerOutcome | null) =>
  render(
    <SettingsProvider>
      <PointsFloat outcome={value} />
    </SettingsProvider>
  );

describe('formatPointsChange', () => {
  it.each([
    [1, '+1'],
    [3, '+3'],
    [0, '+0'],
    [-1, '−1'],
  ])('writes %i as %s', (points, text) => {
    expect(formatPointsChange(points)).toBe(text);
  });
});

describe('PointsFloat', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows nothing before the first answer', async () => {
    const { queryByTestId } = await renderFloat(null);

    expect(queryByTestId('points-float', HIDDEN)).toBeNull();
  });

  it('shows points won, in the success color', async () => {
    const { getByTestId } = await renderFloat(outcome('correct', 3));

    const text = getByTestId('points-float', HIDDEN);
    expect(text).toHaveTextContent('+3');
    expect(hasStyleValue(text.props.style, 'color', light.success)).toBe(true);
  });

  it('shows the point a miss costs, in the error color', async () => {
    const { getByTestId } = await renderFloat(outcome('wrong', -1));

    const text = getByTestId('points-float', HIDDEN);
    expect(text).toHaveTextContent('−1');
    expect(hasStyleValue(text.props.style, 'color', light.error)).toBe(true);
    expect(hasStyleValue(text.props.style, 'color', dark.error)).toBe(false);
  });

  it('is decoration, hidden from screen readers and out of the way of taps', async () => {
    const { getByTestId } = await renderFloat(outcome('correct', 1));

    const text = getByTestId('points-float', HIDDEN);
    expect(text.props.accessibilityElementsHidden).toBe(true);
    expect(text.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(text.props.pointerEvents).toBe('none');
  });

  // Skips the 800 ms animation, jumping straight to its end so the rise can be read.
  const finishAnimationsAtOnce = () =>
    jest.spyOn(Animated, 'timing').mockImplementation(((
      value: Animated.Value,
      config: { toValue: number }
    ) => ({
      start: (done?: (result: { finished: boolean }) => void) => {
        value.setValue(config.toValue);
        done?.({ finished: true });
      },
    })) as never);

  const translateOf = (element: { props: Record<string, unknown> }) =>
    (StyleSheet.flatten(element.props.style as never) as any).transform[0].translateY;

  it('rises as it fades', async () => {
    finishAnimationsAtOnce();
    const { getByTestId } = await renderFloat(outcome('correct', 1));

    expect(translateOf(getByTestId('points-float', HIDDEN))).toBe(-48);
  });

  it('fades in place, without rising, when the player has asked for reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    finishAnimationsAtOnce();
    const { getByTestId } = await renderFloat(outcome('correct', 1));

    await waitFor(() => expect(translateOf(getByTestId('points-float', HIDDEN))).toBe(0));
  });
});
