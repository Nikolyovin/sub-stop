export const lightColors = {
  primary: '#2563EB',
  accent: '#10B981',
  danger: '#EF4444',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#0F172A',
  textSecondary: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
  shadow: '#000000',
}

export const darkColors = {
  primary: '#3B82F6',
  accent: '#10B981',
  danger: '#EF4444',
  background: '#0F172A',
  card: '#1E293B',
  textMain: '#F8FAFC',
  textSecondary: '#94A3B8',
  white: '#FFFFFF',
  border: '#334155',
  shadow: '#000000',
}

export type ThemeColors = typeof lightColors

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
}

export const TYPOGRAPHY = {
  title: { fontSize: 28, fontWeight: '800' as const },
  subtitle: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '500' as const },
  button: { fontSize: 16, fontWeight: '700' as const },
}

export const SHADOWS = {
  soft: {
    shadowColor: '#000000', // <-- Заменили COLORS.shadow на жесткий черный цвет
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000', // <-- Заменили COLORS.shadow на жесткий черный цвет
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
}
