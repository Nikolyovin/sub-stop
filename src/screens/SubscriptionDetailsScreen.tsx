import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, differenceInCalendarDays } from "date-fns";
import { ru } from "date-fns/locale";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSubscriptionDetails } from "../hooks/useSubscriptionDetails";
import { formatPrice, formatCurrency } from "../utils/formatUtils";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import { getBrandData, getBrandBackground } from "../utils/brandUtils";
import { BrandIcon } from "../components/ui/BrandIcon";

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
  onBack: () => void;
  onEdit: (sub: Subscription, focus?: "note") => void;
}

export const SubscriptionDetailsScreen: React.FC<
  SubscriptionDetailsScreenProps
> = ({ subscriptionId, onBack, onEdit }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { subscription, categoryData, costs, cycleInfo, removeSubscription } =
    useSubscriptionDetails(subscriptionId);

  const daysLeft = useMemo(() => {
    if (!subscription || subscription.status !== "trial") return null;
    return differenceInCalendarDays(
      new Date(subscription.nextPaymentDate),
      new Date(),
    );
  }, [subscription]);

  const isTrial = subscription?.status === "trial";
  const isTrialEndingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const isYearly = subscription?.billingCycle === "yearly";

  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isTrialEndingSoon) {
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
  }, [isTrialEndingSoon, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!subscription || !categoryData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Подписка не найдена</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: colors.primary }}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const brand = getBrandData(subscription.name);
  const formattedDate = format(
    new Date(subscription.nextPaymentDate),
    "d MMMM yyyy",
    { locale: ru },
  );
  const isTrialExpired =
    subscription.status === "trial" &&
    new Date(subscription.nextPaymentDate) < new Date();

  const handleBadgePress = () => {
    if (isTrialEndingSoon && daysLeft !== null) {
      const dayText =
        daysLeft === 0
          ? "сегодня"
          : daysLeft === 1
            ? "завтра"
            : `через ${daysLeft} дн.`;
      const priceText = subscription.regularPrice
        ? ` Далее спишут ${formatCurrency(subscription.regularPrice, subscription.currency)}.`
        : "";
      Alert.alert(
        "Триал скоро закончится ⏳",
        `Пробный период на «${subscription.name}» закончится ${dayText}.${priceText}`,
        [{ text: "Понятно", style: "default" }],
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Удалить подписку?",
      "Вы уверены, что хотите удалить эту подписку из трекера?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            removeSubscription(subscription.id);
            onBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Детали</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 🚀 Hero-карточка: фиксированная высота, бейдж отдельной строкой */}
        <View style={styles.heroCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: getBrandBackground(brand, isDark) },
            ]}
          >
            <BrandIcon brand={brand} size={40} />
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.subName} numberOfLines={2}>
              {subscription.name}
            </Text>

            {/* 🚀 Бейдж на отдельной строке — никогда не вылезает за край */}
            {isTrial && (
              <TouchableOpacity
                onPress={handleBadgePress}
                activeOpacity={isTrialEndingSoon ? 0.6 : 1}
                disabled={!isTrialEndingSoon}
                style={styles.badgeRow}
              >
                <View
                  style={[
                    styles.trialBadge,
                    isTrialEndingSoon && styles.trialBadgeWarning,
                  ]}
                >
                  {isTrialEndingSoon && (
                    <Animated.View style={pulseStyle}>
                      <Ionicons
                        name="alert-circle"
                        size={12}
                        color="#fff"
                        style={{ marginRight: 3 }}
                      />
                    </Animated.View>
                  )}
                  <Text style={styles.trialBadgeText}>
                    {isTrialEndingSoon
                      ? `TRIAL • ${daysLeft === 0 ? "Сегодня" : daysLeft === 1 ? "Завтра" : `${daysLeft} дн.`}`
                      : "TRIAL"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.subCategory}>{categoryData.label}</Text>
          </View>
        </View>

        {/* Плашка если триал просрочен */}
        {isTrialExpired && (
          <View
            style={[styles.banner, { backgroundColor: `${colors.danger}15` }]}
          >
            <Text style={[styles.bannerTitle, { color: colors.danger }]}>
              Пробный период закончился
            </Text>
            <TouchableOpacity
              style={[styles.bannerButton, { backgroundColor: colors.danger }]}
              onPress={() => onEdit(subscription)}
            >
              <Text style={styles.bannerButtonText}>Обновить</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Стоимость */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              {isTrial ? "Сейчас" : "В месяц"}
            </Text>
            <Text
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {formatCurrency(costs.monthly, subscription.currency)}
            </Text>
            {subscription.currency !== "RUB" && costs.monthly > 0 && (
              <Text style={styles.statSubValue}>
                ≈ {formatPrice(costs.monthlyRub)}
              </Text>
            )}
          </View>

          {isTrial && costs.futureMonthly > costs.monthly ? (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>
                После триала {isYearly ? "(в год)" : ""}
              </Text>
              <Text
                style={[styles.statValue, { color: colors.danger }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {formatCurrency(
                  isYearly ? costs.futureYearly : costs.futureMonthly,
                  subscription.currency,
                )}
              </Text>
              {subscription.currency !== "RUB" &&
                (isYearly ? costs.futureYearly : costs.futureMonthly) > 0 && (
                  <Text style={styles.statSubValue}>
                    ≈{" "}
                    {formatPrice(
                      isYearly ? costs.futureYearlyRub : costs.futureMonthlyRub,
                    )}
                  </Text>
                )}
            </View>
          ) : (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>В год</Text>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {formatCurrency(costs.yearly, subscription.currency)}
              </Text>
              {subscription.currency !== "RUB" && costs.yearly > 0 && (
                <Text style={styles.statSubValue}>
                  ≈ {formatPrice(costs.yearlyRub)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Объединенная карточка: Дата, Периодичность и Прогресс */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                {isTrial ? "Конец пробного периода" : "Следующее списание"}
              </Text>
              <Text style={styles.progressDate}>
                {formattedDate} •{" "}
                {subscription.billingCycle === "monthly"
                  ? "каждый месяц"
                  : "каждый год"}
              </Text>
            </View>
            <Text style={styles.progressValue}>
              {cycleInfo.daysLeft === 0
                ? "Сегодня"
                : cycleInfo.daysLeft === 1
                  ? "Завтра"
                  : `${cycleInfo.daysLeft} дн.`}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, cycleInfo.progress)}%` },
              ]}
            />
          </View>
        </View>

        {subscription.note ? (
          <TouchableOpacity
            style={styles.noteCard}
            activeOpacity={0.7}
            onPress={() => onEdit(subscription, "note")}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.noteTextContainer}>
              <Text style={styles.noteLabel}>Заметка</Text>
              <Text style={styles.noteText} numberOfLines={2}>
                {subscription.note}
              </Text>
            </View>
            <Ionicons name="pencil" size={16} color={colors.border} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => onEdit(subscription)}
        >
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>
            Редактировать
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${colors.danger}15` }]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>
            Удалить подписку
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      height: 56,
      marginBottom: SPACING.sm,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
    errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: 50 },

    // 🚀 Hero-карточка: выше + стабильная высота
    heroCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: 24, // Было 20 → стало 24 (блок выше)
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 150, // 🚀 Фиксация высоты: без бейджа карточка НЕ сдувается
    },
    iconWrapper: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
      flexShrink: 0,
    },
    heroTextContainer: {
      flex: 1,
      justifyContent: "center",
    },
    subName: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
      fontWeight: "700",
      lineHeight: 28,
    },
    // 🚀 Бейдж отдельной строкой, прижат слева, не вылезает за край
    badgeRow: {
      alignSelf: "flex-start",
      marginTop: 6,
    },
    subCategory: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginTop: 6,
      fontSize: 14,
      fontWeight: "500",
    },

    trialBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F59E0B",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    trialBadgeWarning: { backgroundColor: colors.danger },
    trialBadgeText: { fontSize: 11, color: "#fff", fontWeight: "bold" },

    banner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.sm,
    },
    bannerTitle: { ...TYPOGRAPHY.body, fontWeight: "500", fontSize: 14 },
    bannerButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: BORDER_RADIUS.round,
    },
    bannerButtonText: {
      ...TYPOGRAPHY.button,
      color: colors.white,
      fontSize: 12,
    },

    statsGrid: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: { fontSize: 18, fontWeight: "bold", color: colors.primary },
    statSubValue: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    progressCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    progressTitle: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontWeight: "500",
      fontSize: 15,
    },
    progressDate: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    progressValue: {
      ...TYPOGRAPHY.subtitle,
      color: colors.primary,
      fontSize: 15,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
    },

    noteCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
      gap: SPACING.sm,
      alignItems: "center",
    },
    noteTextContainer: { flex: 1 },
    noteLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 2,
      fontSize: 12,
    },
    noteText: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontStyle: "italic",
      fontSize: 14,
    },

    bottomActions: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: Platform.OS === "ios" ? 34 : SPACING.md,
      backgroundColor: colors.background,
      gap: SPACING.sm,
    },
    actionBtn: {
      paddingVertical: 14,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
    },
    actionBtnText: { ...TYPOGRAPHY.button, fontSize: 16 },
  });
