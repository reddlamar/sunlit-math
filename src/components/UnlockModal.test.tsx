import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useIAP } from 'expo-iap';
import { UnlockModal } from './UnlockModal';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { RESTORE_FAILED_MESSAGE } from '../purchases/purchaseErrors';
import { SettingsProvider } from '../settings/SettingsContext';

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
  beforeEach(() => {
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

  it('does not show an error from an earlier attempt when reopened', async () => {
    const { getByTestId, findByText, queryByText, rerender } = await render(renderModal(true));

    await fireEvent.press(getByTestId('unlock-restore-button'));
    expect(await findByText(RESTORE_FAILED_MESSAGE)).toBeTruthy();

    await rerender(renderModal(false));
    await rerender(renderModal(true));

    expect(queryByText(RESTORE_FAILED_MESSAGE)).toBeNull();
  });
});
