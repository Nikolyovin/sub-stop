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
import { useOnboarding, ONBOARDING_DATA } from '../hooks/useOnboarding'
import { OnboardingSlide } from '../components/ui/OnboardingSlide'
import { AnimatedDot } from '../components/ui/AnimatedDot' // <-- Импорт нашего нового компонента
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
      {/* Кнопка Пропустить */}
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
          <OnboardingSlide
            icon={item.icon}
            title={item.title}
            description={item.description}
            color={item.color}
          />
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isLastSlide ? 'Начать пользоваться' : 'Далее'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    skipContainer: {
      height: 40,
      paddingHorizontal: SPACING.xl,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    skipText: {
      ...TYPOGRAPHY.button,
      color: colors.textSecondary,
      fontSize: 16,
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
    },
  })
