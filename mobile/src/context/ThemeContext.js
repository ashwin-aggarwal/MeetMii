/**
 * ThemeContext — app-wide dark/light mode management.
 *
 * Supports three modes: 'system' (follows device), 'dark', 'light'.
 * The user's manual override is persisted in AsyncStorage so it
 * survives app restarts.
 *
 * Usage:
 *   const { colors, isDark, mode, toggleTheme } = useThemeContext();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const STORAGE_KEY = 'meetmii_theme_mode';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system'); // 'system' | 'dark' | 'light'

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setMode(saved);
      }
    });
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  function setThemeMode(newMode) {
    setMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  }

  const palette = isDark ? Colors.dark : Colors.light;

  const colors = {
    ...palette,
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    primaryDark: Colors.primaryDark,
    accent: Colors.accent,
    success: Colors.success,
    error: Colors.error,
    warning: Colors.warning,
  };

  return (
    <ThemeContext.Provider
      value={{ colors, isDark, mode, toggleTheme, setThemeMode, typography: Typography, spacing: Spacing }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider');
  return ctx;
}
