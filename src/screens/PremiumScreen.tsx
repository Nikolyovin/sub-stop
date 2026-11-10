import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePremiumStore } from "../store/usePremiumStore";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface PremiumScreenProps {
  onBack: () => void;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isPremium, setPremium } = usePremiumStore();

  const handleBuy = () => {
    Alert.alert(
      "Тестовая покупка",
      "В будущем здесь откроется форма оплаты Robokassa. Пока что мы просто включим Премиум для теста.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Включить",
          onPress: () => {
            setPremium(true);
            Alert.alert("Успех", "Премиум активирован! Реклама отключена.");
          },
        },
      ],
    );
  };

  const handleResetPremium = () => {
    Alert.alert(
      "Сброс Премиума",
      "Вы уверены, что хотите отключить Премиум? Это нужно только для тестирования.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: () => {
            setPremium(false);
            Alert.alert("Готово", "Статус Премиума сброшен.");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Премиум</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconWrapper}>
            <Ionicons name="star" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Стоп-Подписка Премиум</Text>
          <Text style={styles.subtitle}>
            Поддержите разработку и получите максимум возможностей.
          </Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>149 ₽</Text>
            <Text style={styles.priceSubtext}>разово, навсегда</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Что входит сейчас</Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.danger}15` },
              ]}
            >
              <Ionicons name="close-circle" size={22} color={colors.danger} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Отключение рекламы</Text>
              <Text style={styles.featureDesc}>
                Никаких баннеров, которые отвлекают от контроля трат.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: `#F59E0B15` }]}
            >
              <Ionicons name="ribbon" size={22} color="#F59E0B" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Премиум-статус</Text>
              <Text style={styles.featureDesc}>
                Специальный золотой значок в настройках приложения.
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
          Скоро в обновлениях
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="eye-off" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Режим Инкогнито</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Скрытие сумм одним нажатием, если рядом чужие люди.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.accent}15` },
              ]}
            >
              <Ionicons name="pause" size={22} color={colors.accent} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Пауза подписок</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Заморозьте списания на время отпуска, не удаляя подписку.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: `#8B5CF615` }]}
            >
              <Ionicons name="apps" size={22} color="#8B5CF6" />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Виджеты на экран</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Сумма ваших трат всегда на виду на рабочем столе.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: `#10B98115` }]}
            >
              <Ionicons name="cloud-upload" size={22} color="#10B981" />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Облачный бэкап</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Восстановление всех данных при смене телефона.
              </Text>
            </View>
          </View>
        </View>

        {/* 🚀 Кнопка сброса для теста (видна только если премиум активен) */}
        {isPremium && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetPremium}
          >
            <Ionicons name="refresh" size={20} color={colors.danger} />
            <Text style={styles.resetBtnText}>Сбросить статус (для теста)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.buyBtn, isPremium && styles.buyBtnActive]}
          onPress={isPremium ? undefined : handleBuy}
          disabled={isPremium}
        >
          <Text style={styles.buyBtnText}>
            {isPremium ? "Премиум активирован" : "Купить за 149 ₽"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Единоразовый платеж. Без скрытых списаний.
        </Text>
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
      marginBottom: SPACING.md,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

    heroCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      alignItems: "center",
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.soft,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#F59E0B15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 24,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },
    subtitle: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: SPACING.md,
    },

    priceBadge: {
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    priceText: { fontSize: 24, fontWeight: "800", color: colors.primary },
    priceSubtext: {
      ...TYPOGRAPHY.caption,
      color: colors.primary,
      marginTop: 4,
    },

    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: "uppercase",
      marginBottom: SPACING.md,
    },

    featuresList: { gap: SPACING.md },
    featureItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.md,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    featureTextContainer: { flex: 1, paddingTop: 2 },

    featureTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 2,
    },
    featureTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
    },
    featureDesc: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    soonBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    soonText: {
      fontSize: 10,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
    },

    // 🚀 Стили для кнопки сброса
    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: SPACING.xl,
      paddingVertical: SPACING.md,
      borderWidth: 1,
      borderColor: `${colors.danger}30`,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: `${colors.danger}05`,
    },
    resetBtnText: {
      ...TYPOGRAPHY.body,
      color: colors.danger,
      fontWeight: "600",
    },

    bottomActions: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: 34,
      backgroundColor: colors.background,
    },
    buyBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    buyBtnActive: { backgroundColor: colors.accent },
    buyBtnText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
    footerText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
