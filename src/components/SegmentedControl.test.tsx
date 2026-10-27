import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SegmentedControl } from './SegmentedControl';
import { SettingsProvider } from '../settings/SettingsContext';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

type Level = 'easy' | 'medium' | 'hard';

const OPTIONS: { value: Level; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

describe('SegmentedControl', () => {
  it('renders every option label', async () => {
    const { getByText } = await render(
      <SettingsProvider>
        <SegmentedControl
          options={OPTIONS}
          value="easy"
          onChange={jest.fn()}
          accessibilityLabel="Difficulty"
          testID="difficulty"
        />
      </SettingsProvider>
    );

    expect(getByText('Easy')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('Hard')).toBeTruthy();
  });

  it('marks only the current value as selected', async () => {
    const { getByTestId } = await render(
      <SettingsProvider>
        <SegmentedControl
          options={OPTIONS}
          value="medium"
          onChange={jest.fn()}
          accessibilityLabel="Difficulty"
          testID="difficulty"
        />
      </SettingsProvider>
    );

    expect(getByTestId('difficulty-easy').props.accessibilityState).toEqual({ selected: false });
    expect(getByTestId('difficulty-medium').props.accessibilityState).toEqual({ selected: true });
    expect(getByTestId('difficulty-hard').props.accessibilityState).toEqual({ selected: false });
  });

  it('calls onChange with the pressed option value', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <SettingsProvider>
        <SegmentedControl
          options={OPTIONS}
          value="easy"
          onChange={onChange}
          accessibilityLabel="Difficulty"
          testID="difficulty"
        />
      </SettingsProvider>
    );

    await fireEvent.press(getByTestId('difficulty-hard'));

    expect(onChange).toHaveBeenCalledWith('hard');
  });

  it('fills the chosen option with the accent and outlines the others in the border color', async () => {
    const { getByTestId } = await render(
      <SettingsProvider>
        <SegmentedControl
          options={OPTIONS}
          value="medium"
          onChange={jest.fn()}
          accessibilityLabel="Difficulty"
          testID="difficulty"
        />
      </SettingsProvider>
    );

    const chosen = getByTestId('difficulty-medium').props.style;
    expect(hasStyleValue(chosen, 'backgroundColor', light.accent)).toBe(true);
    const other = getByTestId('difficulty-easy').props.style;
    expect(hasStyleValue(other, 'borderColor', light.border)).toBe(true);
    expect(hasStyleValue(other, 'backgroundColor', light.accent)).toBe(false);
  });

  it('makes every option 56 dp tall with a 20 dp label, the same on every screen size', async () => {
    const { getByTestId, getByText } = await render(
      <SettingsProvider>
        <SegmentedControl
          options={OPTIONS}
          value="easy"
          onChange={jest.fn()}
          accessibilityLabel="Difficulty"
          testID="difficulty"
        />
      </SettingsProvider>
    );

    expect(getByTestId('difficulty-hard')).toHaveStyle({ minHeight: 56 });
    expect(getByText('Hard')).toHaveStyle({ fontSize: 20 });
  });
});
