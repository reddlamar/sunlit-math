import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { ModalCard } from './ModalCard';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors } from '../theme/tokens';
import { modalStyles } from './modalStyles';
import { createId } from '../utils/random';
import { addScore, getLastPlayerName, setLastPlayerName } from '../storage/scoresRepository';
import type { Operation, ScoreEntry } from '../types/game';

const MAX_NAME_LENGTH = 20;
const REQUIRED_ERROR = 'Name is required';
const SAVE_FAILED_ERROR = "Your score couldn't be saved. Please try again.";

type NameEntryModalProps = {
  visible: boolean;
  score: number;
  operation: Operation;
  onSaved: (entry: ScoreEntry) => void;
};

export function NameEntryModal({ visible, score, operation, onSaved }: NameEntryModalProps) {
  const { colors, difficulty } = useSettings();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // Kids replay constantly, so offer the last name used instead of retyping it. Only fills
  // an empty field, so it never clobbers something already being typed.
  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    (async () => {
      const lastName = await getLastPlayerName();
      if (!cancelled && lastName) {
        setName((current) => current || lastName);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

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
    setError(null);
    const entry: ScoreEntry = {
      id: createId(),
      name: trimmed,
      score,
      operation,
      difficulty,
      createdAt: Date.now(),
    };
    try {
      await addScore(entry);
      await setLastPlayerName(trimmed);
      setName('');
      onSaved(entry);
    } catch {
      setError(SAVE_FAILED_ERROR);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ModalCard visible={visible}>
      <Text style={[modalStyles.emoji, modalStyles.centeredText]}>🏁</Text>
      <Text style={[modalStyles.title, styles.title, { color: colors.textPrimary }]}>
        {`Time's up! You scored ${score} — what's your name?`}
      </Text>
      <TextInput
        style={[
          modalStyles.input,
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary },
          error && [modalStyles.inputError, { borderColor: colors.danger }],
        ]}
        placeholder="Your name"
        value={name}
        onChangeText={handleChangeText}
        maxLength={MAX_NAME_LENGTH}
        autoCapitalize="words"
      />
      {error && <Text style={[modalStyles.errorText, { color: colors.danger }]}>{error}</Text>}
      <AnimatedPressable
        testID="save-button"
        accessibilityRole="button"
        disabled={isSaving}
        style={[modalStyles.primaryButton, styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
        onPress={handleSave}
      >
        <Text style={[modalStyles.primaryLabel, styles.saveLabel]}>Save</Text>
      </AnimatedPressable>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: operationColors.addition,
  },
  // Small white text on a colored fill is 19px bold so it counts as large text for contrast.
  saveLabel: {
    fontSize: 19,
  },
});
