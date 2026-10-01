import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIAP } from 'expo-iap';
import { PurchaseProvider, usePurchase } from './PurchaseContext';
import { UNLOCK_ALL_OPERATIONS_SKU } from './entitlements';
import { PURCHASE_FAILED_MESSAGE, RESTORE_FAILED_MESSAGE } from './purchaseErrors';
import { hasPaidDownload } from './paidDownload';

jest.mock('./paidDownload', () => ({ hasPaidDownload: jest.fn().mockResolvedValue(false) }));

const mockHasPaidDownload = hasPaidDownload as jest.Mock;

const mockUseIAP = useIAP as jest.Mock;

function Probe() {
  const { isUnlocked, price, lastError, purchase, restore, clearError } = usePurchase();
  return (
    <>
      <Text>{isUnlocked ? 'unlocked' : 'locked'}</Text>
      <Text onPress={purchase}>{price ? `price:${price}` : 'no-price'}</Text>
      <Text testID="restore" onPress={restore}>
        restore
      </Text>
      <Text testID="error" onPress={clearError}>
        {lastError ?? 'no-error'}
      </Text>
    </>
  );
}

function mockStore(overrides: Record<string, unknown> = {}) {
  let capturedOptions: any;
  mockUseIAP.mockImplementation((options: any) => {
    capturedOptions = options;
    return {
      connected: true,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn(),
      ...overrides,
    };
  });
  return { options: () => capturedOptions };
}

function renderProbe() {
  return render(
    <PurchaseProvider>
      <Probe />
    </PurchaseProvider>
  );
}

describe('PurchaseProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockUseIAP.mockReset();
    mockHasPaidDownload.mockReset().mockResolvedValue(false);
  });

  it('starts locked when there is no stored entitlement and the store is disconnected', async () => {
    mockUseIAP.mockReturnValue({
      connected: false,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn(),
    });

    const { findByText } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    expect(await findByText('locked')).toBeTruthy();
  });

  it('unlocks when a previous purchase is found among available purchases', async () => {
    mockUseIAP.mockReturnValue({
      connected: true,
      products: [],
      availablePurchases: [{ productId: UNLOCK_ALL_OPERATIONS_SKU }],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn(),
    });

    const { findByText } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    expect(await findByText('unlocked')).toBeTruthy();
  });

  it('unlocks users who paid to download the app before it became free', async () => {
    mockHasPaidDownload.mockResolvedValue(true);
    mockUseIAP.mockReturnValue({
      connected: true,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn(),
    });

    const { findByText } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    expect(await findByText('unlocked')).toBeTruthy();
  });

  it('stays locked for free downloads with no purchase', async () => {
    mockUseIAP.mockReturnValue({
      connected: true,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases: jest.fn(),
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases: jest.fn(),
    });

    const { findByText } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    await waitFor(() => expect(mockHasPaidDownload).toHaveBeenCalled());
    expect(await findByText('locked')).toBeTruthy();
  });

  it('unlocks once onPurchaseSuccess fires for the unlock SKU, and finishes the transaction', async () => {
    const finishTransaction = jest.fn().mockResolvedValue(undefined);
    let capturedOptions: any;
    mockUseIAP.mockImplementation((options: any) => {
      capturedOptions = options;
      return {
        connected: true,
        products: [{ id: UNLOCK_ALL_OPERATIONS_SKU, displayPrice: '$2.50' }],
        availablePurchases: [],
        finishTransaction,
        getAvailablePurchases: jest.fn(),
        fetchProducts: jest.fn(),
        requestPurchase: jest.fn(),
        restorePurchases: jest.fn(),
      };
    });

    const { findByText } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    expect(await findByText('price:$2.50')).toBeTruthy();

    const purchase = { productId: UNLOCK_ALL_OPERATIONS_SKU, id: 'txn-1' };
    await capturedOptions.onPurchaseSuccess(purchase);

    expect(await findByText('unlocked')).toBeTruthy();
    expect(finishTransaction).toHaveBeenCalledWith({ purchase, isConsumable: false });
  });

  it('refreshes available purchases when Restore Purchase is pressed', async () => {
    const restorePurchases = jest.fn().mockResolvedValue(undefined);
    const getAvailablePurchases = jest.fn().mockResolvedValue(undefined);
    mockUseIAP.mockReturnValue({
      connected: true,
      products: [],
      availablePurchases: [],
      finishTransaction: jest.fn(),
      getAvailablePurchases,
      fetchProducts: jest.fn(),
      requestPurchase: jest.fn(),
      restorePurchases,
    });

    const { getByTestId } = await render(
      <PurchaseProvider>
        <Probe />
      </PurchaseProvider>
    );

    fireEvent.press(getByTestId('restore'));

    await waitFor(() => {
      expect(restorePurchases).toHaveBeenCalled();
      expect(getAvailablePurchases).toHaveBeenCalled();
    });
  });

  it('shows no error when the user cancels the payment sheet', async () => {
    const store = mockStore();
    const { getByTestId } = await renderProbe();

    await act(async () => {
      store.options().onPurchaseError({ code: 'user-cancelled', message: 'User cancelled the purchase flow' });
    });

    expect(getByTestId('error').props.children).toBe('no-error');
  });

  it('shows a friendly message, not the raw native one, when a purchase fails', async () => {
    const store = mockStore();
    const { getByTestId } = await renderProbe();

    await act(async () => {
      store.options().onPurchaseError({ code: 'unknown', message: 'UnexpectedException: boom (at Foo.swift:1)' });
    });

    expect(getByTestId('error').props.children).toBe(PURCHASE_FAILED_MESSAGE);
  });

  it('shows no error when the Apple sign-in prompt is cancelled during restore', async () => {
    mockStore({
      restorePurchases: jest
        .fn()
        .mockRejectedValue(new Error('UnexpectedException: Request Canceled (at ExpoModulesCore/ConcurrentFunctionDefinition.swift:90)')),
    });
    const { getByTestId } = await renderProbe();

    await fireEvent.press(getByTestId('restore'));

    expect(getByTestId('error').props.children).toBe('no-error');
  });

  it('shows a friendly message, not the raw native one, when restore fails', async () => {
    mockStore({ restorePurchases: jest.fn().mockRejectedValue(new Error('UnexpectedException: boom')) });
    const { getByTestId } = await renderProbe();

    await fireEvent.press(getByTestId('restore'));

    expect(getByTestId('error').props.children).toBe(RESTORE_FAILED_MESSAGE);
  });

  it('clearError removes the last error', async () => {
    mockStore({ restorePurchases: jest.fn().mockRejectedValue(new Error('boom')) });
    const { getByTestId } = await renderProbe();
    await fireEvent.press(getByTestId('restore'));
    expect(getByTestId('error').props.children).toBe(RESTORE_FAILED_MESSAGE);

    await fireEvent.press(getByTestId('error'));

    expect(getByTestId('error').props.children).toBe('no-error');
  });
});
