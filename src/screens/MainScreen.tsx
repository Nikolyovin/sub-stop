import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BannerView, BannerAdSize } from 'yandex-mobile-ads'
import { useDashboard } from '../hooks/useDashboard'
import { usePremiumStore } from '../store/usePremiumStore'
import { useSubscriptionStore } from '../store/useSubscriptionStore' // 🚀 Для isHydrated
import { UndoSnackbar } from '../components/ui/UndoSnackbar'
import { SwipeableCard } from '../components/ui/SwipeableCard'
import { SkeletonCard } from '../components/ui/SkeletonCard' // 🚀 Скелетон
import { formatPrice } from '../utils/formatUtils'
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from '../theme'
import { useTheme } from '../theme/ThemeContext'
import { Subscription } from '../types'

interface MainScreenProps {
  onAddPress: () => void
  onOpenSettings: () => void
  onOpenDetails: (id: string) => void
  onOpenStatistics: () => void
  onOpenCalendar: () => void
  onShowAd: () => void
}

const UNDO_TIMEOUT_MS = 5000

export const MainScreen: React.FC<MainScreenProps> = ({
  onAddPress,
  onOpenSettings,
  onOpenDetails,
  onOpenStatistics,
  onOpenCalendar,
  onShowAd,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { isPremium } = usePremiumStore()

  // 🚀 Проверяем, загружены ли данные из AsyncStorage
  const isHydrated = useSubscriptionStore((state) => state.isHydrated)

  const {
    subscriptions,
    removeSubscription,
    totalMonthly,
    totalWithTrials,
    totalYearly,
  } = useDashboard()

  const { addSubscriptionAndReturn } = useSubscriptionStore()

  const [lastDeleted, setLastDeleted] = useState<Subscription | null>(null)
  const [lastDeletedIndex, setLastDeletedIndex] = useState<number>(-1)
  const [showUndo, setShowUndo] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [adSize, setAdSize] = useState<BannerAdSize | null>(null)

  useEffect(() => {
    BannerAdSize.stickySize(Dimensions.get('window').width)
      .then((size) => setAdSize(size))
      .catch((err) => console.error('❌ Ошибка размера баннера:', err))
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      const sub = subscriptions.find((s) => s.id === id)
      if (!sub) return
      if (openCardId === id) setOpenCardId(null)
      const currentIndex = subscriptions.findIndex((s) => s.id === id)
      setLastDeletedIndex(currentIndex)
      setLastDeleted(sub)
      removeSubscription(id)
      setShowUndo(true)

      onShowAd()

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowUndo(false), UNDO_TIMEOUT_MS)
    },
    [removeSubscription, subscriptions, openCardId, onShowAd],
  )

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return
    addSubscriptionAndReturn(lastDeleted, lastDeletedIndex)
    setShowUndo(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [lastDeleted, lastDeletedIndex, addSubscriptionAndReturn])

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <SwipeableCard
        item={item}
        onPress={onOpenDetails}
        onDelete={handleDelete}
        colors={colors}
        openCardId={openCardId}
        onOpenCard={setOpenCardId}
      />
    ),
    [onOpenDetails, handleDelete, colors, openCardId],
  )

  // 🚀 Показываем скелетон пока данные не загружены из AsyncStorage
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <View style={[styles.iconBtn, { backgroundColor: colors.card }]} />
          </View>
          <View style={styles.headerTitleContainer}>
            <View
              style={[styles.skeletonTitle, { backgroundColor: colors.border }]}
            />
          </View>
          <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
            <View style={styles.iconBtnPrimary} />
          </View>
        </View>

        <View
          style={[styles.skeletonCard, { backgroundColor: colors.border }]}
        />
        <View
          style={[styles.skeletonCardSmall, { backgroundColor: colors.border }]}
        />

        <FlatList
          style={{ flex: 1 }}
          data={[1, 2, 3]} // 3 скелетона
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.xs,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode='never'
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[styles.iconBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons
              name='settings-outline'
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Мои подписки</Text>
          {isPremium && (
            <View style={styles.proBadge}>
              <Ionicons name='star' size={10} color='#FFF' />
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
          <TouchableOpacity onPress={onAddPress} style={styles.iconBtnPrimary}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.totalCard}
        activeOpacity={0.85}
        onPress={onOpenStatistics}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.totalLabel}>Расходы в месяц</Text>
          <View style={styles.chartIconBg}>
            <Ionicons
              name='pie-chart'
              size={18}
              color='rgba(255,255,255,0.8)'
            />
          </View>
        </View>
        <Text
          style={styles.totalAmount}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {formatPrice(totalMonthly)}
        </Text>
        <Text style={styles.totalYearly} numberOfLines={2}>
          Это {formatPrice(totalYearly)} в год
        </Text>
        {totalWithTrials > totalMonthly && (
          <View style={{ width: '100%' }}>
            <View style={styles.trialDivider} />
            <Text style={styles.trialHint} numberOfLines={2}>
              С учетом оплаты после триалов: {formatPrice(totalWithTrials)}/мес
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.calendarBtn}
        onPress={onOpenCalendar}
        activeOpacity={0.7}
      >
        <View style={styles.calendarIconBg}>
          <Ionicons name='calendar-outline' size={18} color={colors.primary} />
        </View>
        <Text style={styles.calendarBtnText}>Календарь списаний</Text>
        <Ionicons
          name='chevron-forward'
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>У вас пока нет подписок</Text>
          <TouchableOpacity style={styles.testButton} onPress={onAddPress}>
            <Text style={styles.testButtonText}>Добавить первую</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.xs,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setOpenCardId(null)}
          bounces={false}
          overScrollMode='never'
        />
      )}

      {!isPremium && adSize && (
        <View style={styles.adContainer}>
          <BannerView
            size={adSize}
            adRequest={{ adUnitId: 'R-M-20431707-1' }}
            onAdLoaded={() => console.log('✅ Баннер загружен')}
            onAdFailedToLoad={(error) =>
              console.log('❌ Ошибка баннера:', error)
            }
          />
        </View>
      )}

      <UndoSnackbar
        key={lastDeleted?.id || 'empty'}
        visible={showUndo}
        onUndo={handleUndo}
        duration={UNDO_TIMEOUT_MS}
      />
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
    headerSide: { width: 44, justifyContent: 'center' },
    headerTitleContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    skeletonTitle: {
      height: 22,
      borderRadius: 4,
      width: '50%',
    },
    proBadge: {
      backgroundColor: '#F59E0B',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 2,
      marginTop: 2,
    },
    proText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBtnPrimary: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.white,
      fontSize: 28,
      fontWeight: '300',
      marginTop: -2,
    },

    totalCard: {
      backgroundColor: colors.primary,
      borderRadius: BORDER_RADIUS.xl,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
      ...SHADOWS.medium,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    chartIconBg: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalLabel: { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.8)' },
    totalAmount: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.white,
      marginBottom: 2,
    },

    totalYearly: {
      ...TYPOGRAPHY.body,
      color: 'rgba(255,255,255,0.9)',
      fontSize: 15,
    },

    trialDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginVertical: SPACING.xs,
      width: '100%',
    },

    trialHint: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.8)',
      fontSize: 13,
      fontStyle: 'italic',
    },

    calendarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
      paddingVertical: 8,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.soft,
    },
    calendarIconBg: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    calendarBtnText: {
      flex: 1,
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontWeight: '500',
      fontSize: 15,
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      marginBottom: SPACING.lg,
    },
    testButton: {
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      ...SHADOWS.soft,
    },
    testButtonText: { ...TYPOGRAPHY.button, color: colors.primary },

    adContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      backgroundColor: colors.background,
    },

    // 🚀 Стили для скелетона карточек (заглушки)
    skeletonCard: {
      height: 120,
      borderRadius: BORDER_RADIUS.xl,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    skeletonCardSmall: {
      height: 48,
      borderRadius: BORDER_RADIUS.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
    },
  })
