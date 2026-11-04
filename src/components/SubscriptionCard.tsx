import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Subscription } from "../types";
import { getBrandData } from "../utils/brandUtils"; // <-- Твой правильный путь
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface SubscriptionCardProps {
  subscription: Subscription;
  onRemove: (id: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onRemove,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Определяем иконку и цвет по названию бренда
  const brand = getBrandData(subscription.name);

  return (
    <View style={styles.card}>
      {/* Иконка бренда */}
      <View
        style={[styles.iconContainer, { backgroundColor: `${brand.color}15` }]}
      >
        <MaterialCommunityIcons
          name={brand.icon as any}
          size={24}
          color={brand.color}
        />
      </View>

      {/* Информация о подписке */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          {subscription.isTrial && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>TRIAL</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>
          Списание: {subscription.nextPaymentDate}
        </Text>
      </View>

      {/* Цена и кнопка удаления */}
      <View style={styles.rightSide}>
        <Text style={styles.price}>
          {subscription.price} ₽
          {subscription.billingCycle === "yearly" && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(subscription.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      ...SHADOWS.soft,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    info: {
      flex: 1,
      justifyContent: "center",
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    name: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
      flexShrink: 1, // Чтобы длинное название не ломало карточку
    },
    trialBadge: {
      backgroundColor: "#F59E0B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    trialBadgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
    },
    date: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
    },
    rightSide: {
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: SPACING.sm,
    },
    price: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
    },
    cycleText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "400",
    },
    deleteBtn: {
      color: colors.danger,
      fontSize: 18,
      marginTop: 8,
    },
  });
