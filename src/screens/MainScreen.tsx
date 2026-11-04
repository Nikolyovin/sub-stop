import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDashboard } from "../hooks/useDashboard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";

interface MainScreenProps {
  onAddPress: () => void;
  onOpenSettings: () => void;
  onOpenDetails: (id: string) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onAddPress,
  onOpenSettings,
  onOpenDetails,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { subscriptions, removeSubscription, totalMonthly, totalYearly } =
    useDashboard();

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onOpenDetails(item.id)}
      >
        <SubscriptionCard subscription={item} onRemove={removeSubscription} />
      </TouchableOpacity>
    ),
    [removeSubscription, onOpenDetails],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[styles.iconBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Мои подписки</Text>

        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
          <TouchableOpacity onPress={onAddPress} style={styles.iconBtnPrimary}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Расходы в месяц</Text>
        <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
        <Text style={styles.totalYearly}>Это {totalYearly} ₽ в год</Text>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>У вас пока нет подписок</Text>
          <TouchableOpacity style={styles.testButton} onPress={onAddPress}>
            <Text style={styles.testButtonText}>Добавить первую</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
      marginBottom: SPACING.md,
    },
    headerSide: { flex: 1 },
    headerTitle: {
      flex: 2,
      textAlign: "center",
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    iconBtnPrimary: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      color: colors.white,
      fontSize: 28,
      fontWeight: "300",
      marginTop: -2,
    },
    totalCard: {
      backgroundColor: colors.primary,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.medium,
    },
    totalLabel: {
      ...TYPOGRAPHY.caption,
      color: "rgba(255,255,255,0.8)",
      marginBottom: SPACING.xs,
    },
    totalAmount: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.white,
      marginBottom: SPACING.sm,
    },
    totalYearly: { ...TYPOGRAPHY.body, color: "rgba(255,255,255,0.9)" },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.xl,
    },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      marginBottom: SPACING.lg,
    },
    testButton: {
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      ...SHADOWS.soft,
    },
    testButtonText: { ...TYPOGRAPHY.button, color: colors.primary },
  });
