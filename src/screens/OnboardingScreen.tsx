import React, { useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { useOnboarding, ONBOARDING_DATA } from '../hooks/useOnboarding'
import { OnboardingSlide } from '../components/ui/OnboardingSlide'
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
    }
  }).current

  const handleNext = () => {
    if (!isLastSlide) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      nextSlide()
    }
  }

  return (
    <View style={styles.container}>
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

      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
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
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 80 },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: SPACING.xl,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: SPACING.xs },
    activeDot: { backgroundColor: colors.primary },
    inactiveDot: { backgroundColor: colors.border },
    button: {
      backgroundColor: colors.primary,
      marginHorizontal: SPACING.xl,
      marginBottom: 60,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: 'center',
    },
    buttonText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
  })
