import React, { useMemo } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

interface InputFieldProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'
  error?: string
  rightElement?: React.ReactNode // 🚀 Добавили элемент справа
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  rightElement,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
        />
        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { marginBottom: SPACING.sm }, // 🚀 Уменьшили отступ
    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: SPACING.md,
      height: 48, // 🚀 Фиксируем высоту для компактности
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.textMain,
      height: '100%',
    },
    rightElement: {
      marginLeft: SPACING.sm,
    },
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      ...TYPOGRAPHY.caption,
      color: colors.danger,
      marginTop: 4,
      fontSize: 12,
    },
  })
