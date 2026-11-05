import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Swipeable } from 'react-native-gesture-handler'
import { useDashboard } from '../hooks/useDashboard'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { UndoSnackbar } from '../components/ui/UndoSnackbar' // <-- Импорт нашей премиум-плашки
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from '../theme'
import { useTheme } from '../theme/ThemeContext'
import { Subscription } from '../types'
import { useSubscriptionStore } from '../store/useSubscriptionStore'

interface MainScreenProps {
  onAddPress: () => void
  onOpenSettings: () => void
  onOpenDetails: (id: string) => void
}

const UNDO_TIMEOUT_MS = 5000 // Вынесли константу из компонента

export const MainScreen: React.FC<MainScreenProps> = ({
  onAddPress,
  onOpenSettings,
  onOpenDetails,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const {
    subscriptions,
    removeSubscription,
    totalMonthly,
    totalWithTrials,
    totalYearly,
  } = useDashboard()
  const { addSubscriptionAndReturn } = useSubscriptionStore()

  // --- ЛОГИКА UNDO ---
  const [lastDeleted, setLastDeleted] = useState<Subscription | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleDelete = useCallback(
    (sub: Subscription) => {
      setLastDeleted(sub)
      removeSubscription(sub.id)
      setShowUndo(true)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowUndo(false)
      }, UNDO_TIMEOUT_MS)
    },
    [removeSubscription],
  )

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return
    addSubscriptionAndReturn(lastDeleted)
    setShowUndo(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [lastDeleted, addSubscriptionAndReturn])

  // --- СВАЙП ДЛЯ УДАЛЕНИЯ ---
  const renderRightActions = useCallback(
    (item: Subscription, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })

      return (
        <TouchableOpacity
          style={styles.swipeDeleteButton}
          onPress={() => handleDelete(item)}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name='trash-outline' size={28} color={colors.white} />
          </Animated.View>
        </TouchableOpacity>
      )
    },
    [handleDelete, colors, styles],
  )

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(item, dragX)
        }
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onOpenDetails(item.id)}
        >
          <SubscriptionCard subscription={item} />
        </TouchableOpacity>
      </Swipeable>
    ),
    [onOpenDetails, renderRightActions],
  )

  return (
    <View style={styles.container}>
      {/* --- ШАПКА --- */}
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

        <Text style={styles.headerTitle}>Мои подписки</Text>

        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
          <TouchableOpacity onPress={onAddPress} style={styles.iconBtnPrimary}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- КАРТОЧКА С СУММОЙ --- */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Расходы в месяц</Text>
        <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
        <Text style={styles.totalYearly}>Это {totalYearly} ₽ в год</Text>

        {totalWithTrials > totalMonthly && (
          <Text style={styles.trialHint}>
            С учетом триалов: {totalWithTrials} ₽
          </Text>
        )}
      </View>

      {/* --- СПИСОК ПОДПИСОК --- */}
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- НАША ПРЕМИАЛЬНАЯ ПЛАШКА UNDO --- */}
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
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    headerSide: { flex: 1 },
    headerTitle: {
      flex: 2,
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
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
      padding: SPACING.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.medium,
    },
    totalLabel: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: SPACING.xs,
    },
    totalAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.white,
      marginBottom: SPACING.sm,
    },
    totalYearly: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.9)' },
    trialHint: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.7)',
      marginTop: SPACING.sm,
      fontStyle: 'italic',
    },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
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

    // Стиль для красной кнопки удаления при свайпе
    swipeDeleteButton: {
      backgroundColor: colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '85%',
      marginTop: SPACING.xs,
      borderRadius: BORDER_RADIUS.lg,
      marginLeft: SPACING.sm,
      marginBottom: SPACING.sm,
    },
  })
