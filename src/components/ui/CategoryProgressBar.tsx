import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SPACING, TYPOGRAPHY, ThemeColors, BORDER_RADIUS } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'
import { formatPrice } from '../../utils/formatUtils'

interface CategoryProgressBarProps {
  label: string
  amount: number
  percentage: number
  color: string
  icon: string
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({
  label,
  amount,
  percentage,
  color,
  icon,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSide}>
          <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={16} color={color} />{' '}
            {/* 🚀 Было 18 */}
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
        {/* 🚀 Сумма и процент в одну строку, компактнее */}
        <View style={styles.rightSide}>
          <Text style={styles.amount}>{formatPrice(amount)}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      padding: 10, // 🚀 Было SPACING.md (16)
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: 6, // 🚀 Было SPACING.sm (8)
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6, // 🚀 Было SPACING.sm
    },
    leftSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rightSide: { alignItems: 'flex-end' }, // 🚀 Новое: сумма + процент справа
    iconWrapper: {
      width: 24, // 🚀 Было 32
      height: 24,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontWeight: '500',
      fontSize: 14,
    }, // 🚀 Было 16
    amount: { ...TYPOGRAPHY.subtitle, color: colors.textMain, fontSize: 14 }, // 🚀 Было 16
    percentageText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 11, // 🚀 Было 12
    },
    progressTrack: {
      height: 6, // 🚀 Было 8
      backgroundColor: colors.background,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 3 },
  })
