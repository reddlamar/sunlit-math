export const PURCHASE_FAILED_MESSAGE = "The purchase couldn't be completed. Please try again.";
export const RESTORE_FAILED_MESSAGE = "Your purchases couldn't be restored. Please try again.";

// Mirrors expo-iap's ErrorCode.UserCancelled; the jest mock of expo-iap doesn't export the enum.
const USER_CANCELLED_CODE = 'user-cancelled';

type StoreError = { code?: unknown; message?: unknown };

// Dismissing the payment sheet reports `user-cancelled`, but dismissing the Apple
// sign-in prompt only surfaces a native "UnexpectedException: Request Canceled".
function isCancellation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const { code, message } = error as StoreError;
  return code === USER_CANCELLED_CODE || (typeof message === 'string' && /cancel/i.test(message));
}

/**
 * Maps a store error to text safe to show the user: null for a deliberate cancel,
 * otherwise `fallback` so raw native exception text never reaches the UI.
 */
export function toPurchaseErrorMessage(error: unknown, fallback: string): string | null {
  return isCancellation(error) ? null : fallback;
}
