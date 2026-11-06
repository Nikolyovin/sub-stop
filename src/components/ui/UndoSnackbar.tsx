import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { SPACING, SHADOWS, ThemeColors } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

interface UndoSnackbarProps {
  visible: boolean;
  onUndo: () => void;
  duration?: number;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  visible,
  onUndo,
  duration = 4000,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const translateY = useSharedValue(100);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      progress.value = 1;
      progress.value = withTiming(0, {
        duration: duration,
        easing: Easing.linear,
      });
    } else {
      translateY.value = withTiming(100, { duration: 300 });
    }
  }, [visible, duration]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      // Блокируем нажатия, когда плашка скрыта (уехала вниз)
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.container, containerStyle]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>Подписка удалена</Text>
        <TouchableOpacity onPress={onUndo} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Отменить</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressBarBackground}>
        <Animated.View style={[styles.progressBarFill, progressStyle]} />
      </View>
    </Animated.View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 30,
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      ...SHADOWS.medium,
      overflow: "hidden",
      zIndex: 100,
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    text: {
      color: colors.textMain,
      fontSize: 16,
      fontWeight: "500",
    },
    buttonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "bold",
    },
    progressBarBackground: {
      height: 4,
      backgroundColor: colors.border,
      width: "100%",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
    },
  });
