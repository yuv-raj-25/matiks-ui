/**
 * Matiks-specific design tokens for the Score Reveal screen.
 * Dark electric-arcade aesthetic: midnight blue + neon amber + electric cyan.
 */
export const MatiksColors = {
  /** Deep midnight background */
  bg: '#08090F',
  /** Card / surface layer */
  surface: '#0D1120',
  /** Subtle grid lines */
  gridLine: '#151D2E',
  /** Score counter, primary highlight */
  neonAmber: '#FFB827',
  neonAmberGlow: 'rgba(255,184,39,0.18)',
  /** Rank / secondary accent */
  electricCyan: '#00E5FF',
  electricCyanGlow: 'rgba(0,229,255,0.15)',
  /** Combo badge flame */
  fireOrange: '#FF5A1F',
  fireSoft: '#FF8C42',
  /** Text */
  textPrimary: '#EDF2FF',
  textMuted: '#3D4F6E',
  textSubtle: '#8897B4',
  /** Share button */
  shareGradientStart: '#1E2D4A',
  shareGradientEnd: '#0D1A30',
  shareBorder: '#2A3F5F',
  /** Confetti colors */
  confetti: ['#FFB827', '#00E5FF', '#FF5A1F', '#B827FF', '#27FF87', '#FF2775'],
};

export const AnimationTiming = {
  counterDuration: 1800,
  counterOvershoot: 200,
  badgeEntryDamping: 6,
  badgeEntryStiffness: 200,
  flamePulseDuration: 550,
  rankRevealDelay: 200,
  rankRevealDuration: 600,
  shimmerDuration: 1800,
  pressFeedbackIn: 100,
};

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
