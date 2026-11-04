/**
 * Palette « cartographie du XIXe siècle » : papier vergé, encre sépia, vermillon et bleu de Prusse.
 * Le mode sombre reprend la même encre sur un papier « nocturne ».
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A1E14',
    background: '#F2E8D0',
    backgroundElement: '#EADDBF',
    backgroundSelected: '#DCCA9C',
    textSecondary: '#6B5640',
    accent: '#8C2F1B',
    sea: '#4A6A7E',
    border: '#B49D73',
    land: '#EFE3C6',
    forest: '#6E7A4F',
  },
  dark: {
    text: '#EDE0C4',
    background: '#17130E',
    backgroundElement: '#221C15',
    backgroundSelected: '#30281D',
    textSecondary: '#B3A283',
    accent: '#D9714F',
    sea: '#7499AE',
    border: '#54452F',
    land: '#1E1912',
    forest: '#8D9A69',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = (typeof Colors)['light' | 'dark'];

/** Familles chargées dans `src/app/_layout.tsx` via expo-font. */
export const Typefaces = {
  display: 'IMFellEnglishSC_400Regular',
  heading: 'IMFellEnglish_400Regular',
  headingItalic: 'IMFellEnglish_400Regular_Italic',
  body: 'EBGaramond_400Regular',
  bodyItalic: 'EBGaramond_400Regular_Italic',
  bodyMedium: 'EBGaramond_500Medium',
  bodyBold: 'EBGaramond_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 88 }) ?? 0;
export const MaxContentWidth = 720;
