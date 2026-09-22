import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NameEntryModal } from './NameEntryModal';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';

jest.mock('../storage/scoresRepository');

function renderNameEntryModal(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe('NameEntryModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(scoresRepository.addScore).mockResolvedValue(undefined);
  });

  it("greets the player with their score", async () => {
    const { getByText } = await renderNameEntryModal(
      <NameEntryModal visible score={7} operation="addition" onSaved={jest.fn()} />
    );
    expect(getByText(/You scored 7/)).toBeTruthy();
  });

  it('saves the entered name and calls onSaved with the new entry', async () => {
    const onSaved = jest.fn();
    const { getByPlaceholderText, getByText } = await renderNameEntryModal(
      <NameEntryModal visible score={7} operation="addition" onSaved={onSaved} />
    );

    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Ada');
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(scoresRepository.addScore).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Ada', score: 7, operation: 'addition' })
      );
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows a required error and does not save when the name is left blank', async () => {
    const onSaved = jest.fn();
    const { getByText, queryByText } = await renderNameEntryModal(
      <NameEntryModal visible score={3} operation="division" onSaved={onSaved} />
    );

    expect(queryByText('Name is required')).toBeNull();

    await fireEvent.press(getByText('Save'));

    expect(getByText('Name is required')).toBeTruthy();
    expect(scoresRepository.addScore).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('shows a required error when the name is only whitespace', async () => {
    const { getByPlaceholderText, getByText } = await renderNameEntryModal(
      <NameEntryModal visible score={3} operation="division" onSaved={jest.fn()} />
    );

    await fireEvent.changeText(getByPlaceholderText('Your name'), '   ');
    await fireEvent.press(getByText('Save'));

    expect(getByText('Name is required')).toBeTruthy();
    expect(scoresRepository.addScore).not.toHaveBeenCalled();
  });

  it('clears the required error once the player starts typing a name', async () => {
    const { getByPlaceholderText, getByText, queryByText } = await renderNameEntryModal(
      <NameEntryModal visible score={3} operation="division" onSaved={jest.fn()} />
    );

    await fireEvent.press(getByText('Save'));
    expect(getByText('Name is required')).toBeTruthy();

    await fireEvent.changeText(getByPlaceholderText('Your name'), 'A');
    expect(queryByText('Name is required')).toBeNull();
  });

  it('disables Save while a save is in flight, so a second press cannot start a duplicate save', async () => {
    let resolveSave: () => void = () => {};
    jest.mocked(scoresRepository.addScore).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      })
    );
    const onSaved = jest.fn();
    const { getByPlaceholderText, getByTestId } = await renderNameEntryModal(
      <NameEntryModal visible score={7} operation="addition" onSaved={onSaved} />
    );

    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Ada');

    fireEvent.press(getByTestId('save-button'));
    await waitFor(() => {
      expect(getByTestId('save-button').props.accessibilityState.disabled).toBe(true);
    });

    // A press while disabled must not start a second save.
    fireEvent.press(getByTestId('save-button'));
    expect(scoresRepository.addScore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave();
    });
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('truncates names longer than 20 characters', async () => {
    const onSaved = jest.fn();
    const { getByPlaceholderText, getByText } = await renderNameEntryModal(
      <NameEntryModal visible score={3} operation="division" onSaved={onSaved} />
    );

    await fireEvent.changeText(
      getByPlaceholderText('Your name'),
      'ThisNameIsWayTooLongForALeaderboard'
    );
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      const savedEntry = jest.mocked(scoresRepository.addScore).mock.calls[0][0];
      expect(savedEntry.name.length).toBeLessThanOrEqual(20);
    });
  });
});
