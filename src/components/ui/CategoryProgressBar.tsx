import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, TYPOGRAPHY, ThemeColors, BORDER_RADIUS } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

interface CategoryProgressBarProps {
  label: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({
  label,
  amount,
  percentage,
  color,
  icon,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSide}>
          <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={18} color={color} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.amount}>{amount} ₽</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.percentageText}>{percentage}% от общих трат</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    leftSide: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    label: { ...TYPOGRAPHY.body, color: colors.textMain, fontWeight: "500" },
    amount: { ...TYPOGRAPHY.subtitle, color: colors.textMain, fontSize: 16 },
    progressTrack: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: SPACING.xs,
    },
    progressFill: { height: "100%", borderRadius: 4 },
    percentageText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
