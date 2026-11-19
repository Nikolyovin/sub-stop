import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

interface CycleSelectorProps {
  value: 'monthly' | 'yearly'
  onChange: (value: 'monthly' | 'yearly') => void
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const handlePress = (val: 'monthly' | 'yearly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(val)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === 'monthly' && styles.activeButton]}
        onPress={() => handlePress('monthly')}
      >
        <Text style={[styles.text, value === 'monthly' && styles.activeText]}>
          Месяц
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, value === 'yearly' && styles.activeButton]}
        onPress={() => handlePress('yearly')}
      >
        <Text style={[styles.text, value === 'yearly' && styles.activeText]}>
          Год
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: 4,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 8, // 🚀 Уменьшили высоту
      borderRadius: BORDER_RADIUS.md - 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeButton: {
      backgroundColor: colors.primary,
    },
    text: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    activeText: { color: colors.white, fontWeight: 'bold' },
  })
