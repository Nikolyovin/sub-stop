import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Subscription } from "../types";
import { getBrandData } from "../utils/brandUtils";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const brand = getBrandData(subscription.name);

  const renderIcon = (size: number) => {
    if (brand.id === "telegram") {
      return <Ionicons name="paper-plane" size={size} color={brand.color} />;
    }
    if (brand.id === "vk") {
      return <Ionicons name="logo-vk" size={size} color={brand.color} />;
    }
    return (
      <MaterialCommunityIcons
        name={brand.icon as any}
        size={size}
        color={brand.color}
      />
    );
  };

  return (
    <View style={styles.card}>
      <View
        style={[styles.iconContainer, { backgroundColor: `${brand.color}15` }]}
      >
        {renderIcon(24)}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          {subscription.status === "trial" && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>TRIAL</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>
          {subscription.status === "trial" ? "Конец триала: " : "Списание: "}
          {subscription.nextPaymentDate}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={styles.price}>
          {subscription.price} ₽
          {subscription.billingCycle === "yearly" && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>
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
      borderWidth: 1,
      borderColor: colors.border, // <-- Тонкая аккуратная рамка вместо тени
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    info: { flex: 1, justifyContent: "center" },
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
      flexShrink: 1,
    },
    trialBadge: {
      backgroundColor: "#F59E0B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    trialBadgeText: { fontSize: 10, color: "#fff", fontWeight: "bold" },
    date: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    rightSide: {
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: SPACING.sm,
    },
    price: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    cycleText: { fontSize: 12, color: colors.textSecondary, fontWeight: "400" },
  });
