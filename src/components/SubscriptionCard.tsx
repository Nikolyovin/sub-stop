import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Subscription, CATEGORIES } from '../types'
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from '../theme'
import { useTheme } from '../theme/ThemeContext'

interface SubscriptionCardProps {
  subscription: Subscription
  onRemove: (id: string) => void
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onRemove,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const categoryData =
    CATEGORIES.find((c) => c.id === subscription.category) || CATEGORIES[4]

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${categoryData.color}15` },
        ]}
      >
        <Ionicons
          name={categoryData.icon as any}
          size={24}
          color={categoryData.color}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text style={styles.date}>
          Списание: {subscription.nextPaymentDate}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={styles.price}>
          {subscription.price} ₽
          {subscription.billingCycle === 'yearly' && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>
        <TouchableOpacity onPress={() => onRemove(subscription.id)}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      ...SHADOWS.soft,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    info: { flex: 1 },
    name: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
      marginBottom: 4,
    },
    date: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    rightSide: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
    },
    price: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    cycleText: { fontSize: 12, color: colors.textSecondary, fontWeight: '400' },
    deleteBtn: { color: colors.danger, fontSize: 16, marginTop: 8, padding: 4 },
  })
