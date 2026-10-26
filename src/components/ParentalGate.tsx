import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useSettings } from '../settings/SettingsContext';
import { createGateChallenge, isGateAnswerCorrect } from '../purchases/parentalGate';
import { fontFamily } from '../theme/tokens';
import { modalStyles } from './modalStyles';

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
      <Text style={modalStyles.emoji}>🔒</Text>
      <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Ask a grown-up</Text>
      <Text style={[modalStyles.body, styles.body, { color: colors.textSecondary }]}>
        Grown-ups: type this number using digits to continue.
      </Text>
      <Text testID="parental-gate-words" style={[styles.words, { color: colors.textPrimary }]}>
        {challenge.words}
      </Text>
      <TextInput
        testID="parental-gate-input"
        accessibilityLabel="Number in digits"
        style={[
          modalStyles.input,
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary },
          error && modalStyles.inputError,
        ]}
        value={answer}
        onChangeText={setAnswer}
        onSubmitEditing={handleSubmit}
        keyboardType="number-pad"
        maxLength={3}
        autoCorrect={false}
      />
      {error && <Text style={[modalStyles.errorText, modalStyles.centeredText]}>{error}</Text>}
      <AnimatedPressable
        testID="parental-gate-submit"
        accessibilityRole="button"
        style={[modalStyles.primaryButton, styles.primaryButton, { backgroundColor: colors.accent }]}
        onPress={handleSubmit}
      >
        <Text style={modalStyles.primaryLabel}>Continue</Text>
      </AnimatedPressable>
      <AnimatedPressable
        testID="parental-gate-cancel"
        accessibilityRole="button"
        style={styles.cancelButton}
        onPress={onCancel}
      >
        <Text style={[modalStyles.subtleLabel, { color: colors.textSecondary }]}>Cancel</Text>
      </AnimatedPressable>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
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
    fontSize: 18,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 4,
  },
});
