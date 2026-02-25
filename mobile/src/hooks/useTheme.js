/**
 * useTheme — returns a unified theme object driven by the device color scheme.
 *
 * Reads the system dark/light preference via useColorScheme and selects the
 * matching color palette from Colors. Also bundles Typography and Spacing so
 * every screen can pull everything it needs from a single hook call.
 *
 * Returns: { colors, typography, spacing, isDark }
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  return {
    colors: {
      ...palette,
      primary: Colors.primary,
      primaryLight: Colors.primaryLight,
      primaryDark: Colors.primaryDark,
      accent: Colors.accent,
      success: Colors.success,
      error: Colors.error,
      warning: Colors.warning,
    },
    typography: Typography,
    spacing: Spacing,
    isDark,
  };
}
