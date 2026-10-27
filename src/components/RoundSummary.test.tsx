import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundSummary } from './RoundSummary';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
import {
  IPAD_LANDSCAPE,
  IPAD_PORTRAIT,
  PHONE,
  PHONE_LANDSCAPE,
  setWindow,
} from '../testUtils/window';
import type { ScoreEntry } from '../types/game';

const HIDDEN = { includeHiddenElements: true };

const topScores: ScoreEntry[] = [
  { id: 'a', name: 'Fox', avatar: 'fox', score: 34, operation: 'addition', createdAt: 1 },
  { id: 'b', name: 'Owl', avatar: 'owl', score: 29, operation: 'division', createdAt: 2 },
];

async function renderSummary(overrides: Partial<React.ComponentProps<typeof RoundSummary>> = {}) {
  const props = {
    score: 30,
    previousBest: 34 as number | null,
    avatar: 'owl' as const,
    topScores,
    saveFailed: false,
    onSelectAvatar: jest.fn(),
    onRetrySave: jest.fn(),
    onPlayAgain: jest.fn(),
    onHome: jest.fn(),
    ...overrides,
  };
  const screen = await render(
    <SettingsProvider>
      <RoundSummary {...props} />
    </SettingsProvider>
  );
  return { props, ...screen };
}

describe('RoundSummary', () => {
  afterEach(() => setWindow(PHONE));

  describe('how it went', () => {
    it.each([
      [35, 34, 3, 'Amazing!'],
      [26, 34, 2, 'Great job!'],
      [10, 34, 1, 'Good try!'],
    ])(
      'with %i against a best of %i, earns %i stars and says "%s"',
      async (score, best, stars, title) => {
        const { getByText, getByLabelText } = await renderSummary({ score, previousBest: best });

        expect(getByText(title)).toBeTruthy();
        expect(getByLabelText(`${stars} of 3 stars`)).toBeTruthy();
      }
    );

    it('marks the title as a heading', async () => {
      const { getByRole } = await renderSummary();
      expect(getByRole('header')).toHaveTextContent('Great job!');
    });

    it('shows Sunny cheering, hidden from screen readers', async () => {
      const { getByTestId } = await renderSummary();
      expect(getByTestId('sunny', HIDDEN)).toBeTruthy();
    });

    it('shows the score with its unit and the old personal best', async () => {
      const { getByTestId, getByText } = await renderSummary();

      expect(getByTestId('summary-score')).toHaveTextContent('30');
      expect(getByText('points')).toBeTruthy();
      expect(getByText('Personal best: 34')).toBeTruthy();
    });

    it.each([
      [1, 'point'],
      [-1, 'point'],
      [0, 'points'],
      [12, 'points'],
    ])('says "%s" with the right singular or plural', async (score, label) => {
      const { getByText } = await renderSummary({ score });
      expect(getByText(label)).toBeTruthy();
    });

    it('celebrates a new personal best instead of quoting the old one', async () => {
      const { getByText, queryByText } = await renderSummary({ score: 40, previousBest: 34 });

      expect(getByText('New personal best!')).toBeTruthy();
      expect(queryByText(/Personal best: /)).toBeNull();
    });

    it('calls a first positive score a new personal best, with nothing to compare', async () => {
      const { getByText } = await renderSummary({ score: 5, previousBest: null });

      expect(getByText('New personal best!')).toBeTruthy();
    });

    it('says nothing about a best when there is none and the round scored nothing', async () => {
      const { queryByText } = await renderSummary({ score: 0, previousBest: null });

      expect(queryByText(/personal best/i)).toBeNull();
    });

    it('colors the best line from the theme', async () => {
      const { getByText } = await renderSummary();
      expect(hasStyleValue(getByText('Personal best: 34').props.style, 'color', light.streak)).toBe(
        true
      );
    });
  });

  describe('who is playing', () => {
    it('offers the animals, with the current one selected', async () => {
      const { getByLabelText } = await renderSummary({ avatar: 'owl' });

      expect(getByLabelText('Owl').props.accessibilityState).toEqual({ selected: true });
      expect(getByLabelText('Fox').props.accessibilityState).toEqual({ selected: false });
    });

    it('reports the animal picked', async () => {
      const { props, getByLabelText } = await renderSummary();

      await fireEvent.press(getByLabelText('Frog'));

      expect(props.onSelectAvatar).toHaveBeenCalledWith('frog');
    });
  });

  describe('what to do next', () => {
    it('offers Play again and Home', async () => {
      const { props, getByTestId } = await renderSummary();

      await fireEvent.press(getByTestId('play-again-button'));
      await fireEvent.press(getByTestId('home-button'));

      expect(props.onPlayAgain).toHaveBeenCalledTimes(1);
      expect(props.onHome).toHaveBeenCalledTimes(1);
    });

    it('does not mention a failed save when it worked', async () => {
      const { queryByText, queryByTestId } = await renderSummary();

      expect(queryByText("Your score couldn't be saved.")).toBeNull();
      expect(queryByTestId('retry-save-button')).toBeNull();
    });

    it('says when the score could not be saved, and lets the player try again', async () => {
      const { props, getByText, getByTestId } = await renderSummary({ saveFailed: true });

      expect(getByText("Your score couldn't be saved.")).toBeTruthy();
      await fireEvent.press(getByTestId('retry-save-button'));

      expect(props.onRetrySave).toHaveBeenCalledTimes(1);
    });
  });

  describe('on different windows', () => {
    it.each([
      ['a phone', PHONE, 120, 32],
      ['an iPad in portrait', IPAD_PORTRAIT, 200, 44],
      ['an iPad in landscape', IPAD_LANDSCAPE, 150, 44],
      ['a phone turned sideways', PHONE_LANDSCAPE, 96, 26],
    ])('sizes Sunny and the title on %s', async (_name, window, sunny, title) => {
      setWindow(window);
      const { getByTestId, getByText } = await renderSummary();

      expect(getByTestId('sunny', HIDDEN).props.width).toBe(sunny);
      expect(getByText('Great job!')).toHaveStyle({ fontSize: title });
    });

    it('lists the top players beside the result only on a wide landscape window', async () => {
      setWindow(IPAD_LANDSCAPE);
      const wide = await renderSummary();
      expect(wide.getByTestId('summary-top-players')).toBeTruthy();
      expect(wide.getByText('Top players')).toBeTruthy();
    });

    it.each([
      ['a phone', PHONE],
      ['an iPad in portrait', IPAD_PORTRAIT],
      ['a phone turned sideways', PHONE_LANDSCAPE],
    ])('keeps the result on its own on %s', async (_name, window) => {
      setWindow(window);
      const { queryByTestId } = await renderSummary();

      expect(queryByTestId('summary-top-players')).toBeNull();
    });
  });
});
