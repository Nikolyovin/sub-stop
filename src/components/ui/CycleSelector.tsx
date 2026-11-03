import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === 'monthly' && styles.activeButton]}
        onPress={() => onChange('monthly')}
      >
        <Text style={[styles.text, value === 'monthly' && styles.activeText]}>
          Месяц
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, value === 'yearly' && styles.activeButton]}
        onPress={() => onChange('yearly')}
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
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    button: {
      flex: 1,
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    text: { ...TYPOGRAPHY.body, color: colors.textMain, fontWeight: '500' },
    activeText: { color: colors.white, fontWeight: 'bold' },
  })
