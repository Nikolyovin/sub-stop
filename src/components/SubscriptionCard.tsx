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
import { formatPrice, formatCurrency } from "../utils/formatUtils";
import { useSettingsStore } from "../store/useSettingsStore";
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
  const { usdRate, eurRate } = useSettingsStore();

  const convertToRub = (amount: number, currency: string) => {
    if (currency === "USD") return amount * usdRate;
    if (currency === "EUR") return amount * eurRate;
    return amount;
  };

  const daysLeft = useMemo(() => {
    return differenceInCalendarDays(
      new Date(subscription.nextPaymentDate),
      new Date(),
    );
  }, [subscription]);

  const isTrial = subscription.status === "trial";
  const isEndingSoon = daysLeft >= 0 && daysLeft <= 3;

  // 🚀 ИСПРАВЛЕНО: у триала основная (крупная) цена = та, что спишется после триала.
  //    Если regularPrice нет — fallback на price, чтобы не было пустых карточек.
  const displayPrice =
    isTrial && subscription.regularPrice
      ? subscription.regularPrice
      : subscription.price;

  const formattedDate = useMemo(() => {
    return format(new Date(subscription.nextPaymentDate), "d MMMM yyyy", {
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
          ? ` Спишут ${formatCurrency(subscription.regularPrice, subscription.currency)}.`
          : ` Спишут ${formatCurrency(displayPrice, subscription.currency)}.`;

      Alert.alert(
        isTrial ? "Триал скоро закончится ⏳" : "Скоро списание! 💸",
        `Платеж по «${subscription.name}» пройдет ${dayText}.${priceText}`,
        [{ text: "Понятно", style: "default" }],
      );
    }
  };

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

          {isTrial && !isEndingSoon && (
            <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}>
              <Text style={styles.badgeText}>TRIAL</Text>
            </View>
          )}
        </View>

        <View style={styles.subInfoRow}>
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
        {/* 🚀 Крупная цена = реальное списание (для триала — regularPrice) */}
        <Text
          style={styles.price}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {displayPrice === 0
            ? "Бесплатно"
            : formatCurrency(displayPrice, subscription.currency)}
          {subscription.billingCycle === "yearly" && (
            <Text style={styles.cycleText}>/год</Text>
          )}
        </Text>

        {subscription.currency !== "RUB" && displayPrice > 0 && !isTrial && (
          <Text style={styles.rubPriceText}>
            ≈ {formatPrice(convertToRub(displayPrice, subscription.currency))}
          </Text>
        )}

        {/* 🚀 Текущая цена триала — мелким под основной */}
        {isTrial && subscription.regularPrice && (
          <Text style={styles.trialNowText} numberOfLines={1}>
            Сейчас:{" "}
            {subscription.price === 0
              ? "бесплатно"
              : formatCurrency(subscription.price, subscription.currency)}
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
    rubPriceText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    trialNowText: {
      fontSize: 11,
      color: colors.accent,
      marginTop: 2,
      fontWeight: "500",
    },
  });
