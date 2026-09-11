import React, { useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { fontFamily, light } from '../theme/tokens';
import { addScore } from '../storage/scoresRepository';
import type { Operation, ScoreEntry } from '../types/game';

const MAX_NAME_LENGTH = 20;
const REQUIRED_ERROR = 'Name is required';

type NameEntryModalProps = {
  visible: boolean;
  score: number;
  operation: Operation;
  onSaved: (entry: ScoreEntry) => void;
};

export function NameEntryModal({ visible, score, operation, onSaved }: NameEntryModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const handleChangeText = (text: string) => {
    setName(text);
    if (error) {
      setError(null);
    }
  };

  const handleSave = async () => {
    if (isSavingRef.current) {
      return;
    }
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    if (trimmed.length === 0) {
      setError(REQUIRED_ERROR);
      return;
    }
    isSavingRef.current = true;
    setIsSaving(true);
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
      name: trimmed,
      score,
      operation,
      createdAt: Date.now(),
    };
    try {
      await addScore(entry);
      setName('');
      onSaved(entry);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🏁</Text>
          <Text style={styles.title}>{`Time's up! You scored ${score} — what's your name?`}</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Your name"
            value={name}
            onChangeText={handleChangeText}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <AnimatedPressable
            testID="save-button"
            accessibilityRole="button"
            disabled={isSaving}
            style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveLabel}>Save</Text>
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
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: light.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: light.border,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    marginBottom: 16,
    color: light.textPrimary,
  },
  inputError: {
    borderColor: '#D92D20',
    marginBottom: 6,
  },
  errorText: {
    color: '#D92D20',
    fontSize: 13,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#3DBE6C',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
