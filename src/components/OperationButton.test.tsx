import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OperationButton } from './OperationButton';

describe('OperationButton', () => {
  it('shows the operation symbol and label, and calls onPress with the operation', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <OperationButton operation="addition" symbol="+" label="Addition" onPress={onPress} />
    );
    expect(getByText('+')).toBeTruthy();
    expect(getByText('Addition')).toBeTruthy();

    await fireEvent.press(getByText('+'));
    expect(onPress).toHaveBeenCalledWith('addition');
  });

  it('shows no lock when the operation is free', async () => {
    const { queryByTestId, queryByText, getByLabelText } = await render(
      <OperationButton operation="addition" symbol="+" label="Addition" onPress={jest.fn()} />
    );

    expect(queryByTestId('icon-lock', { includeHiddenElements: true })).toBeNull();
    expect(queryByText('Locked')).toBeNull();
    expect(getByLabelText('Addition')).toBeTruthy();
  });

  it('shows a lock and the word Locked when the operation is locked, and still opens it', async () => {
    const onPress = jest.fn();
    const { getByTestId, getByText, getByLabelText } = await render(
      <OperationButton operation="division" symbol="÷" label="Division" locked onPress={onPress} />
    );

    expect(getByTestId('icon-lock', { includeHiddenElements: true })).toBeTruthy();
    expect(getByText('Locked')).toBeTruthy();

    await fireEvent.press(getByLabelText('Division (locked, unlock to play)'));
    expect(onPress).toHaveBeenCalledWith('division');
  });
});
