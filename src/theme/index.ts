export const COLORS = {
  primary: '#2563EB', // Глубокий синий (кнопки, акценты)
  accent: '#10B981', // Мятно-зеленый (успешные статусы, "Выгода")
  danger: '#EF4444', // Красный (удаление, дорогие подписки)
  background: '#F8FAFC', // Очень светлый серо-голубой (фон экрана)
  card: '#FFFFFF', // Белый (карточки подписок)
  textMain: '#0F172A', // Почти черный (заголовки)
  textSecondary: '#64748B', // Серый (подписи, даты)
  white: '#FFFFFF',
  border: '#E2E8F0', // Светлая рамка для карточек
  shadow: '#000000',
}

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
}

export const SHADOWS = {
  soft: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
}
