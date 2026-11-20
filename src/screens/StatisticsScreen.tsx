import React, { useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Sharing from 'expo-sharing'
import ViewShot, { captureRef } from 'react-native-view-shot'
import Svg, { Circle } from 'react-native-svg'
import { useStatistics } from '../hooks/useStatistics'
import { useSettingsStore } from '../store/useSettingsStore'
import { CategoryProgressBar } from '../components/ui/CategoryProgressBar'
import { formatPrice, formatCurrency } from '../utils/formatUtils'
import { getBrandData, getBrandBackground } from '../utils/brandUtils'
import { BrandIcon } from '../components/ui/BrandIcon'
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from '../theme'
import { useTheme } from '../theme/ThemeContext'

interface StatisticsScreenProps {
  onBack: () => void
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  onBack,
}) => {
  const { colors, theme } = useTheme()
  const isDark = theme === 'dark'
  const styles = useMemo(() => createStyles(colors), [colors])

  const { usdRate, eurRate } = useSettingsStore()

  const {
    totalMonthly,
    totalYearly,
    futureTotalMonthly,
    difference,
    topSubscriptions,
    result,
  } = useStatistics()

  const viewShotRef = useRef<any>(null)

  const size = 160 // 🚀 Было 180, уменьшили
  const strokeWidth = 22 // 🚀 Было 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let currentOffset = 0

  const onShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri)
      }
    } catch (error) {
      await Share.share({
        message: `Я отслеживаю подписки в приложении «Стоп-Подписка».\n\nТрачу ${formatPrice(totalMonthly)} в месяц (${formatPrice(totalYearly)} в год). А ты?`,
      })
    }
  }

  const convertToRub = (amount: number, currency: string) => {
    if (currency === 'USD') return amount * usdRate
    if (currency === 'EUR') return amount * eurRate
    return amount
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Статистика</Text>
        <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
          <Ionicons name='share-social' size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode='never'
      >
        <ViewShot
          ref={viewShotRef}
          options={{ fileName: 'my-stats', format: 'png', quality: 1 }}
        >
          <View style={styles.shareableCard}>
            <View style={styles.chartContainer}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke='rgba(255,255,255,0.1)'
                  strokeWidth={strokeWidth}
                  fill='none'
                />
                {result.map((stat) => {
                  const strokeDashoffset = -currentOffset
                  const segmentLength = (stat.percentage / 100) * circumference
                  currentOffset += segmentLength
                  return (
                    <Circle
                      key={stat.category}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={stat.color}
                      strokeWidth={strokeWidth}
                      fill='none'
                      strokeDasharray={`${segmentLength} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap='butt'
                    />
                  )
                })}
              </Svg>
              <View style={styles.chartCenter}>
                <Text style={styles.chartLabel}>В месяц</Text>
                <Text style={styles.chartAmount}>
                  {formatPrice(totalMonthly)}
                </Text>
                <Text style={styles.chartYearly}>
                  {formatPrice(totalYearly)}/год
                </Text>
              </View>
            </View>

            <View style={styles.shareBrand}>
              <Ionicons name='checkmark-circle' size={16} color='#10B981' />
              <Text style={styles.shareBrandText}>Стоп-Подписка</Text>
            </View>
          </View>
        </ViewShot>

        {difference > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name='warning-outline' size={20} color='#D97706' />
              <Text style={styles.warningTitle}>Внимание: Триалы</Text>
            </View>
            <Text style={styles.warningText}>
              Без отмены триалов расходы вырастут до{' '}
              <Text style={styles.boldText}>
                {formatPrice(futureTotalMonthly)}/мес
              </Text>{' '}
              <Text style={styles.plusText}>(+{formatPrice(difference)})</Text>
            </Text>
          </View>
        )}

        {topSubscriptions.length > 0 && (
          <View style={styles.topSection}>
            <Text style={styles.sectionTitle}>Самые дорогие</Text>
            <View style={styles.topList}>
              {topSubscriptions.map((sub, index) => {
                const brand = getBrandData(sub.name)
                const originalPrice =
                  sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price
                const rubPrice = convertToRub(originalPrice, sub.currency)

                return (
                  <View key={sub.id} style={styles.topItem}>
                    {/* 🚀 Номер позиции (как в Т-Банке) */}
                    <Text style={styles.topRank}>{index + 1}</Text>

                    <View
                      style={[
                        styles.topIconWrapper,
                        { backgroundColor: getBrandBackground(brand, isDark) },
                      ]}
                    >
                      <BrandIcon brand={brand} size={18} />
                    </View>
                    <Text style={styles.topName} numberOfLines={1}>
                      {sub.name}
                    </Text>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.topPrice}>
                        {formatCurrency(originalPrice, sub.currency)}
                      </Text>
                      {sub.currency !== 'RUB' && (
                        <Text style={styles.topRubPrice}>
                          ≈ {formatPrice(rubPrice)}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>
          По категориям
        </Text>
        {result.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Нет данных для статистики</Text>
          </View>
        ) : (
          result.map((stat) => (
            <CategoryProgressBar
              key={stat.category}
              label={stat.label}
              amount={stat.amount}
              percentage={stat.percentage}
              color={stat.color}
              icon={stat.icon}
            />
          ))
        )}
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
      marginBottom: SPACING.sm,
    },
    backBtn: { width: 44, justifyContent: 'center' },
    shareBtn: { width: 44, justifyContent: 'center', alignItems: 'flex-end' },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

    shareableCard: {
      backgroundColor: '#1E293B',
      borderRadius: BORDER_RADIUS.xl,
      paddingVertical: SPACING.lg, // 🚀 Было xl
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#334155',
    },
    chartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: SPACING.sm,
    },
    chartCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartLabel: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 2,
      fontSize: 12,
    },
    chartAmount: { fontSize: 22, fontWeight: '800', color: '#FFF' }, // 🚀 Было 24
    chartYearly: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 2,
      fontSize: 11,
    },
    shareBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: SPACING.xs,
    },
    shareBrandText: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 'bold',
      fontSize: 12,
    },

    warningCard: {
      backgroundColor: '#FEF3C7',
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md, // 🚀 Было 16
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    warningTitle: { ...TYPOGRAPHY.subtitle, color: '#92400E', fontSize: 15 },
    warningText: {
      ...TYPOGRAPHY.body,
      color: '#92400E',
      lineHeight: 20,
      fontSize: 14,
    },
    boldText: { fontWeight: 'bold', color: '#92400E' },
    plusText: { fontWeight: 'bold', color: '#EF4444' },

    topSection: { marginBottom: SPACING.md },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 13, // 🚀 Было 14
      textTransform: 'uppercase',
      marginBottom: SPACING.xs, // 🚀 Было sm
    },
    topList: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.xs, // 🚀 Было sm
      borderWidth: 1,
      borderColor: colors.border,
    },
    topItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6, // 🚀 Было 10
      paddingHorizontal: SPACING.xs,
      // 🚀 Убрали borderBottomWidth — в Т-Банке нет разделителей
    },
    topRank: {
      width: 20,
      textAlign: 'center',
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    topIconWrapper: {
      width: 28, // 🚀 Было 36
      height: 28,
      borderRadius: 7,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    topName: {
      flex: 1,
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontSize: 14, // 🚀 Было 15
      fontWeight: '500',
    },
    topPrice: { ...TYPOGRAPHY.subtitle, color: colors.primary, fontSize: 14 }, // 🚀 Было 15

    topRubPrice: { fontSize: 10, color: colors.textSecondary, marginTop: 1 },

    emptyState: { alignItems: 'center', marginTop: SPACING.xl },
    emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
    emptyText: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      marginBottom: SPACING.xs,
    },
  })
