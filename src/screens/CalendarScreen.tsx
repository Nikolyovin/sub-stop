import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { usePremiumStore } from '../store/usePremiumStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { HeaderBackButton } from '../components/ui/HeaderBackButton'
import { formatPrice } from '../utils/formatUtils'
import { getBrandData, getBrandBackground } from '../utils/brandUtils'
import { BrandIcon } from '../components/ui/BrandIcon'
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  ThemeColors,
  SHADOWS,
} from '../theme'
import { useTheme } from '../theme/ThemeContext'

// 🚀 Настройка русского языка для календаря
LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня',
}
LocaleConfig.defaultLocale = 'ru'

interface CalendarScreenProps {
  onBack: () => void
  onOpenPremium: () => void
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onBack,
  onOpenPremium,
}) => {
  const { colors, theme } = useTheme()
  const isDark = theme === 'dark'
  const styles = useMemo(() => createStyles(colors), [colors])

  const { subscriptions } = useSubscriptionStore()
  const { isPremium } = usePremiumStore()
  const { usdRate, eurRate } = useSettingsStore()

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  )

  // 🚀 Подготовка дат для календаря
  const markedDates = useMemo(() => {
    const marked: any = {}

    subscriptions.forEach((sub) => {
      // Мы берем только первый платеж (или текущий), для календаря этого достаточно
      const dateStr = sub.nextPaymentDate
      if (!marked[dateStr]) {
        marked[dateStr] = { marked: true, dotColor: colors.primary }
      }
    })

    // Добавляем выделение выбранного дня
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    }

    return marked
  }, [subscriptions, selectedDate, colors.primary])

  // 🚀 Фильтруем подписки на выбранный день
  const daySubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => sub.nextPaymentDate === selectedDate)
  }, [subscriptions, selectedDate])

  // 🚀 Считаем сумму за день (в рублях)
  const dayTotal = useMemo(() => {
    return daySubscriptions.reduce((sum, sub) => {
      const price = sub.price
      let rubPrice = price
      if (sub.currency === 'USD') rubPrice = price * usdRate
      if (sub.currency === 'EUR') rubPrice = price * eurRate
      return sum + (sub.billingCycle === 'yearly' ? rubPrice / 12 : rubPrice)
    }, 0)
  }, [daySubscriptions, usdRate, eurRate])

  const formattedSelectedDate = format(new Date(selectedDate), 'd MMMM', {
    locale: ru,
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Календарь</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 🚀 Плашка Премиума (если не куплен) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={onOpenPremium}
            activeOpacity={0.8}
          >
            <Ionicons name='star' size={24} color='#F59E0B' />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.premiumTitle}>Доступно в Премиуме</Text>
              <Text style={styles.premiumDesc}>
                Купите Премиум, чтобы видеть все даты списаний в календаре.
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#F59E0B' />
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.calendarWrapper,
            !isPremium && { opacity: 0.3, pointerEvents: 'none' },
          ]}
        >
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            firstDay={1}
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: colors.primary,
              dayTextColor: colors.textMain,
              textDisabledColor: colors.border,
              dotColor: colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: colors.primary,
              monthTextColor: colors.textMain,
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        <View
          style={[
            styles.listSection,
            !isPremium && { opacity: 0.3, pointerEvents: 'none' },
          ]}
        >
          <View style={styles.dateHeader}>
            <Text style={styles.dateTitle}>{formattedSelectedDate}</Text>
            {dayTotal > 0 && (
              <Text style={styles.dateTotal}>{formatPrice(dayTotal)}</Text>
            )}
          </View>

          {daySubscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name='calendar-clear-outline'
                size={48}
                color={colors.border}
              />
              <Text style={styles.emptyText}>Нет списаний на этот день</Text>
            </View>
          ) : (
            daySubscriptions.map((sub) => {
              const brand = getBrandData(sub.name)
              return (
                <View key={sub.id} style={styles.subCard}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: getBrandBackground(brand, isDark) },
                    ]}
                  >
                    <BrandIcon brand={brand} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subName} numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <Text style={styles.subCycle}>
                      {sub.billingCycle === 'monthly'
                        ? 'Ежемесячно'
                        : 'Ежегодно'}
                    </Text>
                  </View>
                  <Text style={styles.subPrice}>
                    {sub.price}{' '}
                    {sub.currency === 'RUB'
                      ? '₽'
                      : sub.currency === 'USD'
                        ? '$'
                        : '€'}
                  </Text>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      height: 56,
      marginBottom: SPACING.md,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

    // Баннер премиума
    premiumBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    premiumTitle: { ...TYPOGRAPHY.subtitle, color: '#92400E', fontSize: 15 },
    premiumDesc: { ...TYPOGRAPHY.caption, color: '#92400E', marginTop: 2 },

    // Календарь
    calendarWrapper: {
      borderRadius: BORDER_RADIUS.xl,
      overflow: 'hidden',
      marginBottom: SPACING.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.soft,
    },

    // Список подписок
    listSection: { flex: 1 },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    dateTitle: { ...TYPOGRAPHY.subtitle, color: colors.textMain, fontSize: 18 },
    dateTotal: { ...TYPOGRAPHY.subtitle, color: colors.primary, fontSize: 18 },

    emptyState: { alignItems: 'center', marginTop: SPACING.xl },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      marginTop: SPACING.sm,
    },

    subCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    subName: { ...TYPOGRAPHY.body, color: colors.textMain, fontWeight: '500' },
    subCycle: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    subPrice: { ...TYPOGRAPHY.subtitle, color: colors.primary },
  })
