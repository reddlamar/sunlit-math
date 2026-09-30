import { PURCHASE_FAILED_MESSAGE, RESTORE_FAILED_MESSAGE, toPurchaseErrorMessage } from './purchaseErrors';

describe('toPurchaseErrorMessage', () => {
  it('returns null when the store reports the user cancelled', () => {
    expect(toPurchaseErrorMessage({ code: 'user-cancelled', message: 'User cancelled the purchase flow' }, PURCHASE_FAILED_MESSAGE)).toBeNull();
  });

  it('returns null for the native "Request Canceled" exception raised when Apple sign-in is dismissed', () => {
    const error = new Error(
      'UnexpectedException: Request Canceled (at ExpoModulesCore/ConcurrentFunctionDefinition.swift:90)'
    );
    expect(toPurchaseErrorMessage(error, RESTORE_FAILED_MESSAGE)).toBeNull();
  });

  it('returns the friendly fallback instead of the raw native message for real failures', () => {
    const error = new Error('UnexpectedException: SKErrorDomain 0 (at ExpoModulesCore/Foo.swift:12)');
    expect(toPurchaseErrorMessage(error, RESTORE_FAILED_MESSAGE)).toBe(RESTORE_FAILED_MESSAGE);
  });

  it('returns the fallback for non-Error values', () => {
    expect(toPurchaseErrorMessage(undefined, PURCHASE_FAILED_MESSAGE)).toBe(PURCHASE_FAILED_MESSAGE);
  });
});
