import React, { useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme'
import { Subscription } from '../types'

export const MainScreen = () => {
  const styles = useMemo(() => createStyles(), [])

  // Достаем данные из Zustand
  const { subscriptions, addSubscription, removeSubscription } =
    useSubscriptionStore()

  // Считаем общую сумму в месяц
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0)
  }, [subscriptions])

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionCard subscription={item} onRemove={removeSubscription} />
    ),
    [removeSubscription],
  )

  // Функция для добавления тестовой подписки
  const handleAddTest = () => {
    const today = new Date().toISOString().split('T')[0]
    addSubscription({
      name: 'Яндекс.Плюс',
      price: 399,
      currency: 'RUB',
      billingCycle: 'monthly',
      nextPaymentDate: today,
      category: 'Развлечения',
    })
  }

  return (
    <View style={styles.container}>
      {/* Шапка с общей суммой */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои подписки</Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Расходы в месяц</Text>
          <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
          <Text style={styles.totalYearly}>
            Это {totalMonthly * 12} ₽ в год
          </Text>
        </View>
      </View>

      {/* Список подписок */}
      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>У вас пока нет подписок</Text>
          <TouchableOpacity style={styles.testButton} onPress={handleAddTest}>
            <Text style={styles.testButtonText}>Добавить тестовую</Text>
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
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: 60, // Отступ под статус-бар
    },
    header: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
    },
    headerTitle: {
      ...TYPOGRAPHY.title,
      color: COLORS.textMain,
      marginBottom: SPACING.md,
    },
    totalCard: {
      backgroundColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
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
    totalYearly: {
      ...TYPOGRAPHY.body,
      color: 'rgba(255,255,255,0.9)',
    },
    listContent: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xl,
    },
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
    testButtonText: {
      ...TYPOGRAPHY.button,
      color: COLORS.primary,
    },
  })
