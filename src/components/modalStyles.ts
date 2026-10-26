import { StyleSheet } from 'react-native';
import { fontFamily, staticColors } from '../theme/tokens';

/**
 * Styles every modal card (Get Ready, name entry, parental gate, unlock) shares, so
 * they look like one family and a tweak is made once. Colors that depend on the theme
 * (including the error red) are applied by each component; these hold only layout and
 * typography.
 */
export const modalStyles = StyleSheet.create({
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
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    fontFamily: fontFamily.regular,
    marginBottom: 16,
  },
  inputError: {
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
  },
  centeredText: {
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryLabel: {
    color: staticColors.onColor,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  subtleLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
