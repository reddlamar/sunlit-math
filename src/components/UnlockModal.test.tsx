import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useIAP } from 'expo-iap';
import { UnlockModal } from './UnlockModal';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { RESTORE_FAILED_MESSAGE } from '../purchases/purchaseErrors';
import { SettingsProvider } from '../settings/SettingsContext';
import { passParentalGate } from '../testUtils/parentalGate';

jest.mock('../purchases/paidDownload', () => ({ hasPaidDownload: jest.fn().mockResolvedValue(false) }));

function renderModal(visible: boolean) {
  return (
    <SettingsProvider>
      <PurchaseProvider>
        <UnlockModal visible={visible} onClose={jest.fn()} />
      </PurchaseProvider>
    </SettingsProvider>
  );
}

describe('UnlockModal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    jest.mocked(useIAP).mockReturnValue({
      connected: false,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as ReturnType<typeof useIAP>);
  });

  it('shows the parental gate first, and the price and purchase buttons only after it', async () => {
    const utils = await render(renderModal(true));

    expect(utils.getByText('Ask a grown-up')).toBeTruthy();
    expect(utils.queryByText('Unlock All Operations')).toBeNull();
    expect(utils.queryByTestId('unlock-purchase-button')).toBeNull();
    expect(utils.queryByTestId('unlock-restore-button')).toBeNull();

    await passParentalGate(utils);

    expect(utils.getByText('Unlock All Operations')).toBeTruthy();
    expect(utils.getByTestId('unlock-purchase-button')).toBeTruthy();
    expect(utils.getByTestId('unlock-restore-button')).toBeTruthy();
  });

  it('asks for the parental gate again every time it opens', async () => {
    const utils = await render(renderModal(true));
    await passParentalGate(utils);

    await utils.rerender(renderModal(false));
    await utils.rerender(renderModal(true));

    expect(utils.getByText('Ask a grown-up')).toBeTruthy();
    expect(utils.queryByTestId('unlock-purchase-button')).toBeNull();
  });

  it('closes when the parental gate is cancelled', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <SettingsProvider>
        <PurchaseProvider>
          <UnlockModal visible onClose={onClose} />
        </PurchaseProvider>
      </SettingsProvider>
    );

    await fireEvent.press(getByTestId('parental-gate-cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show an error from an earlier attempt when reopened', async () => {
    const utils = await render(renderModal(true));
    await passParentalGate(utils);

    await fireEvent.press(utils.getByTestId('unlock-restore-button'));
    expect(await utils.findByText(RESTORE_FAILED_MESSAGE)).toBeTruthy();

    await utils.rerender(renderModal(false));
    await utils.rerender(renderModal(true));
    await passParentalGate(utils);

    expect(utils.queryByText(RESTORE_FAILED_MESSAGE)).toBeNull();
  });
});
