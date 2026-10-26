import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { ModalCard } from './ModalCard';
import { ParentalGate } from './ParentalGate';
import { usePurchase } from '../purchases/PurchaseContext';
import { useSettings } from '../settings/SettingsContext';
import { staticColors } from '../theme/tokens';
import { modalStyles } from './modalStyles';

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
          <Text style={modalStyles.emoji}>🔓</Text>
          <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Unlock All Operations</Text>
          <Text style={[modalStyles.body, styles.body, { color: colors.textSecondary }]}>
            Get subtraction, multiplication, and division for a one-time payment
            {price ? ` of ${price}` : ''}.
          </Text>
          {lastError && (
            <Text style={[modalStyles.errorText, modalStyles.centeredText, { color: colors.danger }]}>
              {lastError}
            </Text>
          )}
          <AnimatedPressable
            testID="unlock-purchase-button"
            accessibilityRole="button"
            disabled={isPurchasing}
            style={[
              modalStyles.primaryButton,
              styles.primaryButton,
              { backgroundColor: colors.accent, opacity: isPurchasing ? 0.7 : 1 },
            ]}
            onPress={purchase}
          >
            {isPurchasing ? (
              <ActivityIndicator color={staticColors.onColor} />
            ) : (
              <Text style={modalStyles.primaryLabel}>{price ? `Unlock for ${price}` : 'Unlock'}</Text>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            testID="unlock-restore-button"
            accessibilityRole="button"
            disabled={isPurchasing}
            onPress={restore}
          >
            <Text style={[modalStyles.subtleLabel, styles.secondaryLabel, { color: colors.accent }]}>Restore Purchase</Text>
          </AnimatedPressable>
          <AnimatedPressable
            testID="unlock-close-button"
            accessibilityRole="button"
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[modalStyles.subtleLabel, { color: colors.textSecondary }]}>Maybe Later</Text>
          </AnimatedPressable>
        </>
      ) : (
        <ParentalGate onPass={() => setIsGatePassed(true)} onCancel={onClose} />
      )}
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: {
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  secondaryLabel: {
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 4,
  },
});
