import { StyleSheet } from 'react-native';

type StyledElement = { props: { style?: unknown } };

/** How full the timer bar is, 0 to 100, read from the width the screen gave its fill. */
export function timerFillPercent(fill: StyledElement): number {
  const { width } = StyleSheet.flatten(fill.props.style as never) as { width: string };
  return parseFloat(width);
}
