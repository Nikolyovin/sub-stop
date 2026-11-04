import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSubscriptionDetails } from "../hooks/useSubscriptionDetails";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import { getBrandData } from "../utils/brandUtils";

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
  onBack: () => void;
  onEdit: (sub: Subscription) => void;
}

export const SubscriptionDetailsScreen: React.FC<
  SubscriptionDetailsScreenProps
> = ({ subscriptionId, onBack, onEdit }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Достаем данные (categoryData нам всё еще нужен для текста категории)
  const { subscription, categoryData, costs, removeSubscription } =
    useSubscriptionDetails(subscriptionId);

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

  // Определяем визуал бренда
  const brand = getBrandData(subscription.name);

  const formattedDate = format(
    new Date(subscription.nextPaymentDate),
    "d MMMM yyyy",
    { locale: ru },
  );

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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: `${brand.color}15` },
            ]}
          >
            <MaterialCommunityIcons
              name={brand.icon as any}
              size={40}
              color={brand.color}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text style={styles.subName}>{subscription.name}</Text>
            {subscription.isTrial && (
              <View
                style={{
                  backgroundColor: "#F59E0B",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{ fontSize: 10, color: "#fff", fontWeight: "bold" }}
                >
                  TRIAL
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.subCategory}>{categoryData.label}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>В месяц</Text>
            <Text style={styles.statValue}>{costs.monthly} ₽</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>В год</Text>
            <Text style={styles.statValue}>{costs.yearly} ₽</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={colors.textSecondary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Следующее списание</Text>
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
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    headerTitle: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: 50 },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      alignItems: "center",
      marginBottom: SPACING.lg,
      ...SHADOWS.soft,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    subName: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 24 },
    subCategory: { ...TYPOGRAPHY.body, color: colors.textSecondary },
    statsGrid: {
      flexDirection: "row",
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOWS.soft,
    },
    statLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    statValue: { fontSize: 22, fontWeight: "bold", color: colors.primary },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      ...SHADOWS.soft,
    },
    infoTextContainer: { marginLeft: SPACING.md },
    infoLabel: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
    infoValue: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
      marginTop: 2,
    },
    actionBtn: {
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginTop: SPACING.md,
    },
    actionBtnText: { ...TYPOGRAPHY.button, fontSize: 16 },
  });
