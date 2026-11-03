import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { useDashboard } from '../hooks/useDashboard'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme'
import { Subscription } from '../types'

interface MainScreenProps {
  onAddPress: () => void
}

export const MainScreen: React.FC<MainScreenProps> = ({ onAddPress }) => {
  const styles = useMemo(() => createStyles(), [])

  // Вся логика скрыта в хуке!
  const { subscriptions, removeSubscription, totalMonthly, totalYearly } =
    useDashboard()

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionCard subscription={item} onRemove={removeSubscription} />
    ),
    [removeSubscription],
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои подписки</Text>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Расходы в месяц</Text>
        <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
        <Text style={styles.totalYearly}>Это {totalYearly} ₽ в год</Text>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>У вас пока нет подписок</Text>
          <TouchableOpacity style={styles.testButton} onPress={onAddPress}>
            <Text style={styles.testButtonText}>Добавить первую</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.title, color: COLORS.textMain },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: COLORS.white,
      fontSize: 28,
      fontWeight: '300',
      marginTop: -2,
    },
    totalCard: {
      backgroundColor: COLORS.primary,
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
      color: COLORS.white,
      marginBottom: SPACING.sm,
    },
    totalYearly: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.9)' },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: COLORS.textSecondary,
      marginBottom: SPACING.lg,
    },
    testButton: {
      backgroundColor: COLORS.card,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      ...SHADOWS.soft,
    },
    testButtonText: { ...TYPOGRAPHY.button, color: COLORS.primary },
  })
