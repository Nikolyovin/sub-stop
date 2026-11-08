import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { differenceInCalendarDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Subscription } from "../types";
import { getBrandData, getBrandBackground } from "../utils/brandUtils";
import { BrandIcon } from "./ui/BrandIcon";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => createStyles(colors), [colors]);
  const brand = getBrandData(subscription.name);

  const daysLeft = useMemo(() => {
    return differenceInCalendarDays(
      new Date(subscription.nextPaymentDate),
      new Date(),
    );
  }, [subscription]);

  const isTrial = subscription.status === "trial";
  const isEndingSoon = daysLeft >= 0 && daysLeft <= 3;

  const displayPrice =
    !isTrial && subscription.price === 0 && subscription.regularPrice
      ? subscription.regularPrice
      : subscription.price;

  // Форматируем дату (например, "7 декабря")
  const formattedDate = useMemo(() => {
    return format(new Date(subscription.nextPaymentDate), "d MMMM", {
      locale: ru,
    });
  }, [subscription.nextPaymentDate]);

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
  }, [isEndingSoon]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleBadgePress = () => {
    if (isEndingSoon) {
      const dayText =
        daysLeft === 0
          ? "сегодня"
          : daysLeft === 1
            ? "завтра"
            : `через ${daysLeft} дн.`;

      const priceText =
        isTrial && subscription.regularPrice
          ? ` Далее спишут ${subscription.regularPrice} ₽.`
          : ` Спишут ${displayPrice} ₽.`;

      Alert.alert(
        isTrial ? "Триал скоро закончится ⏳" : "Скоро списание! 💸",
        `Платеж по «${subscription.name}» пройдет ${dayText}.${priceText}`,
        [{ text: "Понятно", style: "default" }],
      );
    }
  };

  // Настройки для нижней плашки (показывается только если <= 3 дней)
  const urgentBadge = isEndingSoon
    ? {
        text: isTrial
          ? `TRIAL • ${daysLeft === 0 ? "Сегодня" : daysLeft === 1 ? "Завтра" : `${daysLeft} дн.`}`
          : daysLeft === 0
            ? "Сегодня"
            : daysLeft === 1
              ? "Завтра"
              : `${daysLeft} дн.`,
        color: isTrial ? colors.danger : "#F97316",
      }
    : null;

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getBrandBackground(brand, isDark) },
        ]}
      >
        <BrandIcon brand={brand} size={24} />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>

          {/* Маленькая плашка TRIAL, если время еще есть */}
          {isTrial && !isEndingSoon && (
            <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}>
              <Text style={styles.badgeText}>TRIAL</Text>
            </View>
          )}
        </View>

        <View style={styles.subInfoRow}>
          <Text style={styles.date}>
            {isTrial ? "Конец триала:" : "Списание:"}
          </Text>

          {/* 🚀 УМНАЯ ЛОГИКА: Либо пишем красивую дату, либо показываем плашку с днями */}
          {!urgentBadge ? (
            <Text style={styles.date}>{formattedDate}</Text>
          ) : (
            <TouchableOpacity onPress={handleBadgePress} activeOpacity={0.6}>
              <View
                style={[styles.badge, { backgroundColor: urgentBadge.color }]}
              >
                <Animated.View style={[pulseStyle, { marginRight: 3 }]}>
                  <Ionicons name="alert-circle" size={10} color="#fff" />
                </Animated.View>
                <Text style={styles.badgeText}>{urgentBadge.text}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.rightSide}>
        <Text style={styles.price}>
          {displayPrice === 0 ? "Бесплатно" : `${displayPrice} ₽`}
          {subscription.billingCycle === "yearly" && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>
        {isTrial && subscription.regularPrice && (
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
      marginBottom: 4,
      gap: 8,
    },
    name: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
      flexShrink: 1,
    },
    subInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    date: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
    },
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
