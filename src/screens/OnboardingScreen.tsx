import React, { useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import LottieView from 'lottie-react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useOnboarding, ONBOARDING_DATA } from '../hooks/useOnboarding'
import { AnimatedDot } from '../components/ui/AnimatedDot'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from '../theme'
import { useTheme } from '../theme/ThemeContext'

const { width } = Dimensions.get('window')
const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 }

interface OnboardingScreenProps {
  onFinish: () => void
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const flatListRef = useRef<FlatList>(null)

  const { currentIndex, setCurrentIndex, nextSlide, isLastSlide } =
    useOnboarding(onFinish)

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    }
  }).current

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    if (!isLastSlide) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      nextSlide()
    }
  }

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    onFinish()
  }

  return (
    <View style={styles.container}>
      {/* Кнопка "Пропустить" */}
      <View style={styles.skipContainer}>
        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* 🚀 Lottie-анимация */}
            <LottieView
              source={item.lottie}
              autoPlay
              loop
              style={styles.lottie}
              resizeMode='contain'
            />

            {/* Текст с плавным появлением */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(600).springify()}
              style={styles.textContainer}
            >
              <Text style={[styles.title, { color: colors.textMain }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {item.description}
              </Text>
            </Animated.View>
          </View>
        )}
      />

      {/* Точки-индикаторы */}
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, index) => (
          <AnimatedDot
            key={index}
            isActive={index === currentIndex}
            colors={colors}
          />
        ))}
      </View>

      {/* Кнопка действия */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isLastSlide ? 'Начать' : 'Далее'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    skipContainer: {
      position: 'absolute',
      top: 60,
      right: 24,
      zIndex: 10,
    },
    skipText: {
      ...TYPOGRAPHY.button,
      color: colors.textSecondary,
      fontSize: 16,
    },
    slide: {
      width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
      paddingTop: 80,
    },
    lottie: {
      width: 260,
      height: 260,
      marginBottom: SPACING.xl,
    },
    textContainer: {
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
    },
    title: {
      ...TYPOGRAPHY.title,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: SPACING.md,
      lineHeight: 34,
    },
    description: {
      ...TYPOGRAPHY.body,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: SPACING.xl,
      alignItems: 'center',
    },
    button: {
      backgroundColor: colors.primary,
      marginHorizontal: SPACING.xl,
      marginBottom: 60,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: 'center',
    },
    buttonText: {
      ...TYPOGRAPHY.button,
      color: colors.white,
      fontSize: 18,
      fontWeight: '700',
    },
  })
