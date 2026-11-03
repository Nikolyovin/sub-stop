import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

const { width } = Dimensions.get('window')

interface OnboardingSlideProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  color: string
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  icon,
  title,
  description,
  color,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={80} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    slide: {
      width: width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    description: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  })
