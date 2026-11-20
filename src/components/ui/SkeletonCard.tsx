import React, { useEffect, useMemo } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { SPACING, BORDER_RADIUS, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

export const SkeletonCard: React.FC = () => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const opacity = new Animated.Value(0.3)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [opacity])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.icon, { opacity }]} />
      <View style={styles.textContainer}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.subtitle, { opacity }]} />
      </View>
      <Animated.View style={[styles.price, { opacity }]} />
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.border,
      marginRight: SPACING.md,
    },
    textContainer: { flex: 1, gap: 6 },
    title: {
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border,
      width: '60%',
    },
    subtitle: {
      height: 12,
      borderRadius: 4,
      backgroundColor: colors.border,
      width: 80,
    },
    price: {
      height: 18,
      borderRadius: 4,
      backgroundColor: colors.border,
      width: 60,
    },
  })
