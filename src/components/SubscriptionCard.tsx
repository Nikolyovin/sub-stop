import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { differenceInCalendarDays } from "date-fns"; // 🚀 Изменили на CalendarDays
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

  // 🚀 Считаем, сколько дней осталось до конца триала
  const daysLeft = useMemo(() => {
    if (subscription.status !== "trial") return null;
    const diff = differenceInCalendarDays(
      // 🚀 Используем CalendarDays
      new Date(subscription.nextPaymentDate),
      new Date(),
    );
    return diff;
  }, [subscription]);

  const isEndingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  // 🚀 Анимация пульсации
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isEndingSoon) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      pulse.value = 1;
    }
  }, [isEndingSoon, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleBadgePress = () => {
    if (isEndingSoon && daysLeft !== null) {
      const dayText =
        daysLeft === 0
          ? "сегодня"
          : daysLeft === 1
            ? "завтра"
            : `через ${daysLeft} дн.`;
      const priceText = subscription.regularPrice
        ? ` Далее спишут ${subscription.regularPrice} ₽.`
        : "";

      Alert.alert(
        "Триал скоро закончится ⏳",
        `Пробный период на «${subscription.name}» закончится ${dayText}.${priceText}`,
        [{ text: "Понятно", style: "default" }],
      );
    }
  };

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

          {/* 🚀 Бейдж становится кликабельным */}
          {subscription.status === "trial" && (
            <TouchableOpacity
              onPress={handleBadgePress}
              activeOpacity={isEndingSoon ? 0.6 : 1}
              disabled={!isEndingSoon}
            >
              <View
                style={[
                  styles.trialBadge,
                  isEndingSoon && styles.trialBadgeWarning,
                ]}
              >
                {isEndingSoon && (
                  <Animated.View style={pulseStyle}>
                    <Ionicons name="alert-circle" size={12} color="#fff" />
                  </Animated.View>
                )}
                <Text style={styles.trialBadgeText}>
                  {isEndingSoon
                    ? daysLeft === 0
                      ? "Сегодня"
                      : daysLeft === 1
                        ? "Завтра" // 🚀 Добавили "Завтра"
                        : `${daysLeft} дн.`
                    : "TRIAL"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.date}>
          {subscription.status === "trial" ? "Конец триала: " : "Списание: "}
          {subscription.nextPaymentDate}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={styles.price}>
          {subscription.price === 0 ? "Бесплатно" : `${subscription.price} ₽`}
          {subscription.billingCycle === "yearly" && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>
        {subscription.regularPrice && (
          <Text style={styles.regularPriceText}>
            Далее: {subscription.regularPrice} ₽
          </Text>
        )}
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
      borderColor: colors.border,
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
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: "#F59E0B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    trialBadgeWarning: {
      backgroundColor: colors.danger,
    },
    trialBadgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
    },
    date: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    rightSide: {
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: SPACING.sm,
    },
    price: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    cycleText: { fontSize: 12, color: colors.textSecondary, fontWeight: "400" },
    regularPriceText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
