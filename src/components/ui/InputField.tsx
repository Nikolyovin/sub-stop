import React, { useMemo } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

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
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { marginBottom: SPACING.md },
    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      color: colors.textMain,
      borderWidth: 1,
      borderColor: colors.border,
    },
  })
