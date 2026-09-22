import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SegmentedControl } from './SegmentedControl';

type Level = 'easy' | 'medium' | 'hard';

const OPTIONS: { value: Level; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

describe('SegmentedControl', () => {
  it('renders every option label', async () => {
    const { getByText } = await render(
      <SegmentedControl
        options={OPTIONS}
        value="easy"
        onChange={jest.fn()}
        accessibilityLabel="Difficulty"
        testID="difficulty"
      />
    );

    expect(getByText('Easy')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('Hard')).toBeTruthy();
  });

  it('marks only the current value as selected', async () => {
    const { getByTestId } = await render(
      <SegmentedControl
        options={OPTIONS}
        value="medium"
        onChange={jest.fn()}
        accessibilityLabel="Difficulty"
        testID="difficulty"
      />
    );

    expect(getByTestId('difficulty-easy').props.accessibilityState).toEqual({ selected: false });
    expect(getByTestId('difficulty-medium').props.accessibilityState).toEqual({ selected: true });
    expect(getByTestId('difficulty-hard').props.accessibilityState).toEqual({ selected: false });
  });

  it('calls onChange with the pressed option value', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <SegmentedControl
        options={OPTIONS}
        value="easy"
        onChange={onChange}
        accessibilityLabel="Difficulty"
        testID="difficulty"
      />
    );

    await fireEvent.press(getByTestId('difficulty-hard'));

    expect(onChange).toHaveBeenCalledWith('hard');
  });
});
