import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../theme'

interface LockScreenProps {
  onUnlock: () => void
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { colors } = useTheme()
  const styles = createStyles(colors)

  // Автоматически вызываем FaceID/TouchID при появлении
  useEffect(() => {
    onUnlock()
  }, [onUnlock])

  return (
    <View style={styles.container}>
      <Ionicons name='lock-closed' size={64} color={colors.primary} />
      <Text style={styles.title}>Приложение заблокировано</Text>
      <TouchableOpacity style={styles.button} onPress={onUnlock}>
        <Text style={styles.buttonText}>Разблокировать</Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl,
      textAlign: 'center',
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 999,
    },
    buttonText: { ...TYPOGRAPHY.button, color: colors.white },
  })
