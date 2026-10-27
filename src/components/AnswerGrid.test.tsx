import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnswerGrid, type AnswerReveal } from './AnswerGrid';
import { SettingsProvider } from '../settings/SettingsContext';

const renderGrid = (
  props: { reveal?: AnswerReveal; disabled?: boolean; onAnswer?: () => void } = {}
) =>
  render(
    <SettingsProvider>
      <AnswerGrid
        choices={[54, 56, 58, 63]}
        disabled={props.disabled ?? false}
        onAnswer={props.onAnswer ?? jest.fn()}
        reveal={props.reveal}
        shakeStyle={{}}
      />
    </SettingsProvider>
  );

describe('AnswerGrid', () => {
  it('shows every choice, two to a row, with none marked while the sum is open', async () => {
    const { getAllByTestId, getByTestId } = await renderGrid();

    expect(getAllByTestId('answer-choice').map((choice) => choice.props.children)).toEqual([
      54, 56, 58, 63,
    ]);
    expect(getByTestId('answer-grid').children).toHaveLength(2);
  });

  it('reports the choice that was tapped', async () => {
    const onAnswer = jest.fn();
    const { getByLabelText } = await renderGrid({ onAnswer });

    await fireEvent.press(getByLabelText('Answer 58'));

    expect(onAnswer).toHaveBeenCalledWith(58);
  });

  describe('when a miss is revealed', () => {
    const reveal: AnswerReveal = { correct: 56, wrong: 54 };

    it('marks the right answer and the wrong tap, and steps the others back', async () => {
      const { getByLabelText } = await renderGrid({ reveal, disabled: true });

      expect(getByLabelText('Answer 56, correct')).toBeTruthy();
      expect(getByLabelText('Answer 54, not correct')).toBeTruthy();
      // The two untouched choices carry no mark.
      expect(getByLabelText('Answer 58')).toBeTruthy();
      expect(getByLabelText('Answer 63')).toBeTruthy();
    });

    it('does not accept a tap while it is locked', async () => {
      const onAnswer = jest.fn();
      const { getByLabelText } = await renderGrid({ reveal, disabled: true, onAnswer });

      await fireEvent.press(getByLabelText('Answer 58'));

      expect(onAnswer).not.toHaveBeenCalled();
    });
  });
});
