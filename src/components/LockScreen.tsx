import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { SPACING, TYPOGRAPHY, ThemeColors } from "../theme";

interface LockScreenProps {
  onUnlock: () => void;
  isAuthenticating: boolean; // 🚀 Добавили пропс
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  isAuthenticating,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 🚀 Защита от бесконечного цикла: вызываем биометрию только 1 раз при открытии
  const hasAutoPrompted = useRef(false);

  useEffect(() => {
    if (!hasAutoPrompted.current) {
      hasAutoPrompted.current = true;
      onUnlock();
    }
  }, [onUnlock]);

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed" size={64} color={colors.primary} />
      <Text style={styles.title}>Приложение заблокировано</Text>

      <TouchableOpacity
        style={[styles.button, isAuthenticating && { opacity: 0.7 }]}
        onPress={onUnlock}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Разблокировать</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.xl,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 999,
      minWidth: 200, // Фиксируем ширину, чтобы лоадер не прыгал
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: { ...TYPOGRAPHY.button, color: colors.white },
  });
