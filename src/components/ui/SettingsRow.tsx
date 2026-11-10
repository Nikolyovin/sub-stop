import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, TYPOGRAPHY, ThemeColors } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  iconColor?: string; // 🚀 Добавили пропс для цвета иконки
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  title,
  value,
  onToggle,
  onPress,
  disabled = false,
  isLoading = false,
  iconColor,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <View style={[styles.container, disabled && { opacity: 0.5 }]}>
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? colors.textSecondary : iconColor || colors.primary}
        />
        <Text
          style={[styles.title, disabled && { color: colors.textSecondary }]}
        >
          {title}
        </Text>
      </View>

      {onToggle !== undefined ? (
        isLoading ? (
          <View
            style={{
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Switch value={false} disabled={true} style={{ opacity: 0 }} />
            <View style={{ position: "absolute" }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        ) : (
          <Switch
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        )
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={disabled ? colors.border : colors.textSecondary}
        />
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.md,
      borderRadius: 16,
      marginBottom: 6,
      height: 56,
    },
    left: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    title: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 15 },
  });
