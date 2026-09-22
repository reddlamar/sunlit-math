import React, { type PropsWithChildren } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
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
      <View style={styles.backdrop}>
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
    borderRadius: 28,
    padding: 24,
  },
  centered: {
    alignItems: 'center',
  },
});
