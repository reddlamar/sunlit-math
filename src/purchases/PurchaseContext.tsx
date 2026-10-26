import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIAP, type Purchase } from 'expo-iap';
import { UNLOCK_ALL_OPERATIONS_SKU } from './entitlements';
import { hasPaidDownload } from './paidDownload';
import { PURCHASE_FAILED_MESSAGE, RESTORE_FAILED_MESSAGE, toPurchaseErrorMessage } from './purchaseErrors';

const STORAGE_KEY = 'math60_unlocked_v1';

type PurchaseContextValue = {
  isUnlocked: boolean;
  isPurchasing: boolean;
  price: string | null;
  lastError: string | null;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  clearError: () => void;
};

const PurchaseContext = createContext<PurchaseContextValue | undefined>(undefined);

// The store is the source of truth for what was bought (it is re-queried on every
// launch), so this local copy is only a head start. Failing to write it must never
// block the unlock or leave a paid transaction unfinished.
function rememberUnlock(): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {});
}

function ignoreFailure(request: Promise<unknown> | void): Promise<void> {
  return Promise.resolve(request).then(
    () => undefined,
    () => undefined
  );
}

function ownsUnlock(purchases: Purchase[]): boolean {
  return purchases.some((entry) => entry.productId === UNLOCK_ALL_OPERATIONS_SKU);
}

export function PurchaseProvider({ children }: PropsWithChildren) {
  const [hasStoredUnlock, setHasStoredUnlock] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const markUnlocked = async () => {
    setHasStoredUnlock(true);
    await rememberUnlock();
  };

  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
    finishTransaction,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      if (purchase.productId === UNLOCK_ALL_OPERATIONS_SKU) {
        await markUnlocked();
        await finishTransaction({ purchase, isConsumable: false });
      }
      setIsPurchasing(false);
    },
    onPurchaseError: (error) => {
      setLastError(toPurchaseErrorMessage(error, PURCHASE_FAILED_MESSAGE));
      setIsPurchasing(false);
    },
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'true') {
          setHasStoredUnlock(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!connected) {
      return;
    }
    // These only fill in the price and what is already owned. The store can be
    // unreachable (no Play Store, offline), and that must leave the app usable and
    // locked rather than surface as an uncaught promise rejection.
    ignoreFailure(fetchProducts({ skus: [UNLOCK_ALL_OPERATIONS_SKU], type: 'in-app' }));
    ignoreFailure(getAvailablePurchases());
    hasPaidDownload().then((paid) => {
      if (paid) {
        markUnlocked();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const ownsPurchase = ownsUnlock(availablePurchases);
  const isUnlocked = hasStoredUnlock || ownsPurchase;

  useEffect(() => {
    if (ownsPurchase) {
      rememberUnlock();
    }
  }, [ownsPurchase]);

  const product = products.find((item) => item.id === UNLOCK_ALL_OPERATIONS_SKU);

  const purchase = async () => {
    setLastError(null);
    setIsPurchasing(true);
    try {
      await requestPurchase({
        request: {
          apple: { sku: UNLOCK_ALL_OPERATIONS_SKU },
          google: { skus: [UNLOCK_ALL_OPERATIONS_SKU] },
        },
        type: 'in-app',
      });
    } catch (error) {
      setLastError(toPurchaseErrorMessage(error, PURCHASE_FAILED_MESSAGE));
      setIsPurchasing(false);
    }
  };

  const restore = async () => {
    setLastError(null);
    setIsPurchasing(true);
    try {
      await restorePurchases();
      await getAvailablePurchases();
    } catch (error) {
      setLastError(toPurchaseErrorMessage(error, RESTORE_FAILED_MESSAGE));
    } finally {
      setIsPurchasing(false);
    }
  };

  const clearError = useCallback(() => setLastError(null), []);

  const value: PurchaseContextValue = {
    isUnlocked,
    isPurchasing,
    price: product?.displayPrice ?? null,
    lastError,
    purchase,
    restore,
    clearError,
  };

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}

export function usePurchase(): PurchaseContextValue {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
}
