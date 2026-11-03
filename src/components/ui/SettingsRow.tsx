import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  value?: boolean
  onToggle?: () => void
  onPress?: () => void
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  title,
  value,
  onToggle,
  onPress,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const content = (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {onToggle !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      ) : (
        <Ionicons
          name='chevron-forward'
          size={20}
          color={colors.textSecondary}
        />
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }
  return content
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: 16,
      marginBottom: SPACING.sm,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    title: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 16 },
  })
