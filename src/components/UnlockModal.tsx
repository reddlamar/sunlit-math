import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { ModalCard } from './ModalCard';
import { ParentalGate } from './ParentalGate';
import { usePurchase } from '../purchases/PurchaseContext';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';

type UnlockModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function UnlockModal({ visible, onClose }: UnlockModalProps) {
  const { isUnlocked, isPurchasing, price, lastError, purchase, restore, clearError } =
    usePurchase();
  const { colors } = useSettings();
  const [isGatePassed, setIsGatePassed] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  // The price and purchase buttons sit behind a parental gate (required for the
  // Kids Category), and a grown-up has to pass it again every time this opens.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setIsGatePassed(false);
    }
  }

  // lastError is shared provider state, so an error from an earlier attempt would
  // otherwise reappear when the modal is reopened.
  React.useEffect(() => {
    if (visible) {
      clearError();
    }
  }, [visible, clearError]);

  React.useEffect(() => {
    if (visible && isUnlocked) {
      onClose();
    }
  }, [visible, isUnlocked, onClose]);

  return (
    <ModalCard visible={visible} onRequestClose={onClose} centered>
      {isGatePassed ? (
        <>
          <Text style={styles.emoji}>🔓</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Unlock All Operations</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Get subtraction, multiplication, and division for a one-time payment
            {price ? ` of ${price}` : ''}.
          </Text>
          {lastError && <Text style={styles.errorText}>{lastError}</Text>}
          <AnimatedPressable
            testID="unlock-purchase-button"
            accessibilityRole="button"
            disabled={isPurchasing}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accent, opacity: isPurchasing ? 0.7 : 1 },
            ]}
            onPress={purchase}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryLabel}>{price ? `Unlock for ${price}` : 'Unlock'}</Text>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            testID="unlock-restore-button"
            accessibilityRole="button"
            disabled={isPurchasing}
            onPress={restore}
          >
            <Text style={[styles.secondaryLabel, { color: colors.accent }]}>Restore Purchase</Text>
          </AnimatedPressable>
          <AnimatedPressable
            testID="unlock-close-button"
            accessibilityRole="button"
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[styles.closeLabel, { color: colors.textSecondary }]}>Maybe Later</Text>
          </AnimatedPressable>
        </>
      ) : (
        <ParentalGate onPass={() => setIsGatePassed(true)} onCancel={onClose} />
      )}
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#D92D20',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 4,
  },
  closeLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
