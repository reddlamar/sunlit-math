import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius } from '../theme/tokens';

/** A long sum may shrink to fit, but never to something a child can't read. */
const MIN_FONT_SCALE = 0.5;

type QuestionCardProps = {
  question: string;
  style?: StyleProp<ViewStyle>;
  /** Font size in dp; the design uses 72 and smaller on a phone turned sideways. */
  fontSize?: number;
};

/** The sum the player is answering, large enough to read at arm's length. */
export function QuestionCard({ question, style, fontSize = 72 }: QuestionCardProps) {
  const { colors } = useSettings();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      <Text
        testID="problem-question"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={MIN_FONT_SCALE}
        style={[styles.question, { color: colors.textPrimary, fontSize }]}
      >
        {question}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 28,
    borderWidth: 2,
    borderRadius: radius.xl,
  },
  // A defined width lets a long sum such as "144 ÷ 12" shrink to fit instead of wrapping.
  question: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
