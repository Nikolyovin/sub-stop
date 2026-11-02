import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Subscription } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme'

interface SubscriptionCardProps {
  subscription: Subscription
  onRemove: (id: string) => void
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onRemove,
}) => {
  const styles = useMemo(() => createStyles(), [])

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {/* Пока используем эмодзи, позже заменим на реальные иконки */}
        <Text style={styles.icon}>
          {subscription.category === 'Развлечения' ? '🎬' : '📦'}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text style={styles.date}>
          Следующее списание: {subscription.nextPaymentDate}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={styles.price}>{subscription.price} ₽</Text>
        <TouchableOpacity onPress={() => onRemove(subscription.id)}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const createStyles = () =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      ...SHADOWS.soft,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    icon: {
      fontSize: 24,
    },
    info: {
      flex: 1,
    },
    name: {
      ...TYPOGRAPHY.subtitle,
      color: COLORS.textMain,
      fontSize: 16,
      marginBottom: 4,
    },
    date: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
    },
    rightSide: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
    },
    price: {
      ...TYPOGRAPHY.subtitle,
      color: COLORS.textMain,
    },
    deleteBtn: {
      color: COLORS.danger,
      fontSize: 16,
      marginTop: 8,
      padding: 4,
    },
  })
