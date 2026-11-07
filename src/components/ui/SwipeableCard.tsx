import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Subscription } from "../../types";
import { SubscriptionCard } from "../SubscriptionCard";
import { ThemeColors, BORDER_RADIUS, SPACING } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;
const BUTTON_WIDTH = 60;
const MAX_SWIPE = -BUTTON_WIDTH - 20;

interface SwipeableCardProps {
  item: Subscription;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
  colors: ThemeColors;
  openCardId: string | null;
  onOpenCard: (id: string | null) => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  item,
  onPress,
  onDelete,
  colors,
  openCardId,
  onOpenCard,
}) => {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  // 🚀 Используем withTiming для четкого возврата без перелетов
  const close = () => {
    "worklet";
    translateX.value = withTiming(0, { duration: 250 });
    isOpen.value = false;
    runOnJS(onOpenCard)(null);
  };

  const open = () => {
    "worklet";
    translateX.value = withTiming(-BUTTON_WIDTH, { duration: 250 });
    isOpen.value = true;
    runOnJS(onOpenCard)(item.id);
  };

  useEffect(() => {
    if (openCardId !== item.id && isOpen.value) {
      translateX.value = withTiming(0, { duration: 250 });
      isOpen.value = false;
    }
  }, [openCardId, item.id, isOpen, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (isOpen.value) {
        const base = -BUTTON_WIDTH;
        const newX = base + event.translationX;
        translateX.value = Math.min(0, Math.max(newX, MAX_SWIPE));
      } else {
        if (event.translationX < 0) {
          translateX.value = Math.max(event.translationX, MAX_SWIPE);
        }
      }
    })
    .onEnd((event) => {
      if (isOpen.value) {
        if (event.translationX > 20) {
          close();
        } else {
          // Возвращаем в открытое положение, если дернули слабо
          translateX.value = withTiming(-BUTTON_WIDTH, { duration: 200 });
        }
      } else {
        if (event.translationX < -SWIPE_THRESHOLD) {
          open();
        } else {
          translateX.value = withTiming(0, { duration: 250 });
        }
      }
    });

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (!success) return;
      if (isOpen.value) {
        close();
      } else {
        runOnJS(onPress)(item.id);
      }
    });

  const composed = Gesture.Exclusive(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => {
    const progress = Math.min(1, Math.abs(translateX.value) / BUTTON_WIDTH);
    return { opacity: progress };
  });

  const handleDeletePress = () => {
    // Анимация удаления влево
    translateX.value = withTiming(-width, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onDelete)(item.id);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity
          onPress={handleDeletePress}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={28} color={colors.danger} />
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.cardWrapper, cardStyle]}>
          <SubscriptionCard subscription={item} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    position: "relative",
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.lg,
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: BUTTON_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    backgroundColor: "transparent",
  },
});
