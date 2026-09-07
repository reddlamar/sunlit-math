import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { usePurchase } from '../purchases/PurchaseContext';
import { light } from '../theme/tokens';

type UnlockModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function UnlockModal({ visible, onClose }: UnlockModalProps) {
  const { isUnlocked, isPurchasing, price, lastError, purchase, restore } = usePurchase();

  React.useEffect(() => {
    if (visible && isUnlocked) {
      onClose();
    }
  }, [visible, isUnlocked, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔓</Text>
          <Text style={styles.title}>Unlock All Operations</Text>
          <Text style={styles.body}>
            Get subtraction, multiplication, and division for a one-time payment
            {price ? ` of ${price}` : ''}.
          </Text>
          {lastError && <Text style={styles.errorText}>{lastError}</Text>}
          <AnimatedPressable
            testID="unlock-purchase-button"
            accessibilityRole="button"
            disabled={isPurchasing}
            style={[styles.primaryButton, { opacity: isPurchasing ? 0.7 : 1 }]}
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
            <Text style={styles.secondaryLabel}>Restore Purchase</Text>
          </AnimatedPressable>
          <AnimatedPressable
            testID="unlock-close-button"
            accessibilityRole="button"
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeLabel}>Maybe Later</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: light.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: light.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: light.textSecondary,
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
    backgroundColor: light.accent,
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
  },
  secondaryLabel: {
    color: light.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 4,
  },
  closeLabel: {
    color: light.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
