import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useSettings } from '../settings/SettingsContext';
import { createGateChallenge, isGateAnswerCorrect } from '../purchases/parentalGate';
import { fontFamily } from '../theme/tokens';

const WRONG_ANSWER_MESSAGE = "That's not right. Try this one instead.";

type ParentalGateProps = {
  onPass: () => void;
  onCancel: () => void;
};

/**
 * Apple requires a parental gate in front of purchases in Kids Category apps. Each
 * wrong answer swaps in a new number so it can't be guessed one digit at a time.
 */
export function ParentalGate({ onPass, onCancel }: ParentalGateProps) {
  const { colors } = useSettings();
  const [challenge, setChallenge] = useState(() => createGateChallenge());
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (isGateAnswerCorrect(challenge, answer)) {
      onPass();
      return;
    }
    setChallenge(createGateChallenge());
    setAnswer('');
    setError(WRONG_ANSWER_MESSAGE);
  };

  return (
    <>
      <Text style={styles.emoji}>🔒</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Ask a grown-up</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Grown-ups: type this number using digits to continue.
      </Text>
      <Text testID="parental-gate-words" style={[styles.words, { color: colors.textPrimary }]}>
        {challenge.words}
      </Text>
      <TextInput
        testID="parental-gate-input"
        accessibilityLabel="Number in digits"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary },
          error && styles.inputError,
        ]}
        value={answer}
        onChangeText={setAnswer}
        onSubmitEditing={handleSubmit}
        keyboardType="number-pad"
        maxLength={3}
        autoCorrect={false}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <AnimatedPressable
        testID="parental-gate-submit"
        accessibilityRole="button"
        style={[styles.primaryButton, { backgroundColor: colors.accent }]}
        onPress={handleSubmit}
      >
        <Text style={styles.primaryLabel}>Continue</Text>
      </AnimatedPressable>
      <AnimatedPressable
        testID="parental-gate-cancel"
        accessibilityRole="button"
        style={styles.cancelButton}
        onPress={onCancel}
      >
        <Text style={[styles.cancelLabel, { color: colors.textSecondary }]}>Cancel</Text>
      </AnimatedPressable>
    </>
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
    marginBottom: 12,
  },
  words: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    fontSize: 18,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#D92D20',
    marginBottom: 6,
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
  cancelButton: {
    paddingVertical: 4,
  },
  cancelLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
