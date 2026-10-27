import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';

type FeedbackHintProps = {
  /** True while a missed sum is up with its right answer lit. */
  isMiss: boolean;
};

/** One line under the answers that says what to do, or what just happened. */
export function FeedbackHint({ isMiss }: FeedbackHintProps) {
  const { colors } = useSettings();

  return (
    <Text
      testID="feedback-hint"
      accessibilityLiveRegion="polite"
      style={[styles.hint, { color: colors.textSecondary }]}
    >
      {isMiss ? 'Miss: the right answer lights up' : 'Ready: tap the answer'}
    </Text>
  );
}

const styles = StyleSheet.create({
  hint: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
