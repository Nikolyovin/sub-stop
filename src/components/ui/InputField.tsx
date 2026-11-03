import React, { useMemo } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme'

interface InputFieldProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric'
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) => {
  const styles = useMemo(() => createStyles(), [])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: { marginBottom: SPACING.md },
    label: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING.xs,
    },
    input: {
      backgroundColor: COLORS.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      color: COLORS.textMain,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
  })
