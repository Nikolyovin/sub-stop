import React from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { ThemeColors } from '../../theme'

interface AnimatedDotProps {
  isActive: boolean
  colors: ThemeColors
}

export const AnimatedDot: React.FC<AnimatedDotProps> = ({
  isActive,
  colors,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // Если активна — растягиваем до 24px, если нет — 8px
      width: withTiming(isActive ? 24 : 8, { duration: 300 }),
      // Плавно меняем цвет с серого на основной синий/фиолетовый
      backgroundColor: interpolateColor(
        isActive ? 1 : 0,
        [0, 1],
        [colors.border, colors.primary],
      ),
    }
  }, [isActive, colors])

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
})
