import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format, differenceInCalendarDays } from "date-fns"; // 🚀 Изменили импорт
import { ru } from "date-fns/locale";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSubscriptionDetails } from "../hooks/useSubscriptionDetails";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import { getBrandData } from "../utils/brandUtils";

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
  onBack: () => void;
  onEdit: (sub: Subscription, focus?: "note") => void;
}

export const SubscriptionDetailsScreen: React.FC<
  SubscriptionDetailsScreenProps
> = ({ subscriptionId, onBack, onEdit }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { subscription, categoryData, costs, cycleInfo, removeSubscription } =
    useSubscriptionDetails(subscriptionId);

  // 🚀 Считаем дни до конца триала
  const daysLeft = useMemo(() => {
    if (!subscription || subscription.status !== "trial") return null;
    return differenceInCalendarDays(
      // 🚀 Используем CalendarDays
      new Date(subscription.nextPaymentDate),
      new Date(),
    );
  }, [subscription]);

  const isTrialEndingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  // 🚀 Анимация пульсации
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
          <Text>Назад</Text>
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

  const renderBrandIcon = (size: number) => {
    if (brand.id === "telegram")
      return <Ionicons name="paper-plane" size={size} color={brand.color} />;
    if (brand.id === "vk")
      return <Ionicons name="logo-vk" size={size} color={brand.color} />;
    return (
      <MaterialCommunityIcons
        name={brand.icon as any}
        size={size}
        color={brand.color}
      />
    );
  };

  const handleBadgePress = () => {
    if (isTrialEndingSoon && daysLeft !== null) {
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: `${brand.color}15` },
            ]}
          >
            {renderBrandIcon(36)}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <Text style={styles.subName}>{subscription.name}</Text>

            {/* 🚀 Обновленный бейдж с анимацией и обработчиком нажатия */}
            {subscription.status === "trial" && (
              <TouchableOpacity
                onPress={handleBadgePress}
                activeOpacity={isTrialEndingSoon ? 0.6 : 1}
                disabled={!isTrialEndingSoon}
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
          <Text style={styles.subCategory}>{categoryData.label}</Text>
        </View>

        {isTrialExpired && (
          <View
            style={[styles.banner, { backgroundColor: `${colors.danger}15` }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.danger }]}>
                Пробный период закончился
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.bannerButton, { backgroundColor: colors.danger }]}
              onPress={() => onEdit(subscription)}
            >
              <Text style={styles.bannerButtonText}>Обновить</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              {subscription.status === "trial" ? "Сейчас" : "В месяц"}
            </Text>
            <Text style={styles.statValue}>{costs.monthly} ₽</Text>
          </View>
          {subscription.status === "trial" &&
          costs.futureMonthly > costs.monthly ? (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>После триала</Text>
              <Text style={[styles.statValue, { color: colors.danger }]}>
                {costs.futureMonthly} ₽
              </Text>
            </View>
          ) : (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>В год</Text>
              <Text style={styles.statValue}>{costs.yearly} ₽</Text>
            </View>
          )}
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>До следующего платежа</Text>
            <Text style={styles.progressValue}>{cycleInfo.daysLeft} дн.</Text>
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

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={colors.textSecondary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {subscription.status === "trial"
                ? "Конец пробного периода"
                : "Следующее списание"}
            </Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="repeat-outline"
            size={24}
            color={colors.textSecondary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Периодичность</Text>
            <Text style={styles.infoValue}>
              {subscription.billingCycle === "monthly"
                ? "Каждый месяц"
                : "Каждый год"}
            </Text>
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
              size={24}
              color={colors.textSecondary}
            />
            <View style={styles.noteTextContainer}>
              <Text style={styles.noteLabel}>Заметка</Text>
              <Text style={styles.noteText}>{subscription.note}</Text>
            </View>
            <Ionicons name="pencil" size={16} color={colors.border} />
          </TouchableOpacity>
        ) : null}

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
      </ScrollView>
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
      marginBottom: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: 50 },

    heroCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      alignItems: "center",
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    subName: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 22 },
    subCategory: { ...TYPOGRAPHY.caption, color: colors.textSecondary },

    trialBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F59E0B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    trialBadgeWarning: {
      backgroundColor: colors.danger,
    },
    trialBadgeText: { fontSize: 10, color: "#fff", fontWeight: "bold" },

    banner: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.md,
      gap: SPACING.md,
    },
    bannerTitle: { ...TYPOGRAPHY.subtitle, fontSize: 16 },
    bannerButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.round,
    },
    bannerButtonText: {
      ...TYPOGRAPHY.button,
      color: colors.white,
      fontSize: 14,
    },

    statsGrid: {
      flexDirection: "row",
      gap: SPACING.md,
      marginBottom: SPACING.md,
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
      marginBottom: SPACING.xs,
    },
    statValue: { fontSize: 20, fontWeight: "bold", color: colors.primary },

    progressCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
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
    },
    progressValue: {
      ...TYPOGRAPHY.subtitle,
      color: colors.primary,
      fontSize: 16,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTextContainer: { marginLeft: SPACING.md },
    infoLabel: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    infoValue: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
      marginTop: 2,
    },

    noteCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
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
    },
    noteText: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontStyle: "italic",
    },

    actionBtn: {
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginTop: SPACING.md,
    },
    actionBtnText: { ...TYPOGRAPHY.button, fontSize: 16 },
  });
