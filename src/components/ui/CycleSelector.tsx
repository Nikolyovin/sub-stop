import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../theme'

interface CycleSelectorProps {
  value: 'monthly' | 'yearly'
  onChange: (value: 'monthly' | 'yearly') => void
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  value,
  onChange,
}) => {
  const styles = useMemo(() => createStyles(), [])

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

const createStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    button: {
      flex: 1,
      backgroundColor: COLORS.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    activeButton: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    text: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '500' },
    activeText: { color: COLORS.white, fontWeight: 'bold' },
  })
