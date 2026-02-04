export const theme = {
  colors: {
    // Primary colors
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',

    // Secondary colors
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',

    // Accent colors
    accent: '#8b5cf6',
    accentLight: '#a78bfa',

    // Neutral colors
    surface: '#ffffff',
    background: '#f8fafc',
    backgroundDark: '#f1f5f9',

    // Text colors
    text: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    muted: '#cbd5e1',

    // Border colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Gradient presets
    gradientPrimary: ['#3b82f6', '#2563eb'] as const,
    gradientSecondary: ['#10b981', '#059669'] as const,
    gradientAccent: ['#8b5cf6', '#7c3aed'] as const,
    gradientWarm: ['#f59e0b', '#d97706'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};