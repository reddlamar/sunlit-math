import React, { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';

type ModalCardProps = PropsWithChildren<{
  visible: boolean;
  onRequestClose?: () => void;
  centered?: boolean;
  transparentCard?: boolean;
}>;

export function ModalCard({
  visible,
  onRequestClose,
  centered,
  transparentCard,
  children,
}: ModalCardProps) {
  const { colors } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onRequestClose}>
      {/* Lifts the card above the keyboard; on a small iPhone a centered card with a
          text field would otherwise have its buttons hidden under it. */}
      <KeyboardAvoidingView
        testID="modal-backdrop"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          testID="modal-card"
          style={[
            styles.card,
            !transparentCard && { backgroundColor: colors.surface },
            centered && styles.centered,
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
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
    borderRadius: 28,
    padding: 24,
  },
  centered: {
    alignItems: 'center',
  },
});
