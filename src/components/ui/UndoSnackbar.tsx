import React, { useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { SPACING, SHADOWS, ThemeColors } from '../../theme'
import { useTheme } from '../../theme/ThemeContext'

const { width } = Dimensions.get('window')

interface UndoSnackbarProps {
  visible: boolean
  onUndo: () => void
  duration?: number
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  visible,
  onUndo,
  duration = 4000,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  // Анимация выезда самой плашки
  const translateY = useSharedValue(100)
  // Анимация полоски прогресса (от 1 до 0)
  const progress = useSharedValue(1)

  useEffect(() => {
    if (visible) {
      // Выезжаем наверх
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 })
      // Запускаем таймер полоски (за duration миллисекунд уменьшается до 0)
      progress.value = 1 // Сбрасываем, если удалили второй элемент подряд
      progress.value = withTiming(0, {
        duration: duration,
        easing: Easing.linear,
      })
    } else {
      // Уезжаем вниз
      translateY.value = withTiming(100, { duration: 300 })
    }
  }, [visible, duration])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  if (!visible && translateY.value === 100) return null

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.text}>Подписка удалена</Text>
        <TouchableOpacity onPress={onUndo} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Отменить</Text>
        </TouchableOpacity>
      </View>
      {/* Та самая полоска прогресса */}
      <View style={styles.progressBarBackground}>
        <Animated.View style={[styles.progressBarFill, progressStyle]} />
      </View>
    </Animated.View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
      backgroundColor: colors.card, // В темной теме это темно-серый, в светлой - белый
      borderRadius: 16,
      ...SHADOWS.medium,
      overflow: 'hidden', // Чтобы полоска не вылезала за края
      zIndex: 100,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    text: {
      color: colors.textMain,
      fontSize: 16,
      fontWeight: '500',
    },
    buttonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    progressBarBackground: {
      height: 4,
      backgroundColor: colors.border, // Фон полоски (светло-серый)
      width: '100%',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary, // Цвет полоски (синий/фиолетовый)
    },
  })
