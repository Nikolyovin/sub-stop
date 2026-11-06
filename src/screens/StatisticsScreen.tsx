import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStatistics } from "../hooks/useStatistics";
import { CategoryProgressBar } from "../components/ui/CategoryProgressBar";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface StatisticsScreenProps {
  onBack: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  onBack,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Достаем новые данные из хука
  const { totalMonthly, futureTotalMonthly, difference, result } =
    useStatistics();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Статистика</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Общие расходы в месяц</Text>
          <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
          <Text style={styles.totalSubtitle}>По категориям</Text>
        </View>

        {/* 🚨 Блок с предупреждением о триалах */}
        {difference > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning-outline" size={24} color="#D97706" />
              <Text style={styles.warningTitle}>Внимание: Триалы</Text>
            </View>
            <Text style={styles.warningText}>
              Если вы не отмените пробные периоды, ваши расходы вырастут до{" "}
              <Text style={styles.boldText}>{futureTotalMonthly} ₽/мес</Text>{" "}
              <Text style={styles.plusText}>(+{difference} ₽)</Text>
            </Text>
          </View>
        )}

        {result.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Нет данных для статистики</Text>
            <Text style={styles.emptySubtext}>
              Добавьте подписки, чтобы увидеть, куда уходят деньги
            </Text>
          </View>
        ) : (
          result.map((stat) => (
            <CategoryProgressBar
              key={stat.category}
              label={stat.label}
              amount={stat.amount}
              percentage={stat.percentage}
              color={stat.color}
              icon={stat.icon}
            />
          ))
        )}
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
      marginBottom: SPACING.lg,
    },
    backBtn: { width: 44 },
    headerTitle: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 22 },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

    totalCard: {
      backgroundColor: colors.primary,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      alignItems: "center",
      ...SHADOWS.medium,
    },
    totalLabel: {
      ...TYPOGRAPHY.caption,
      color: "rgba(255,255,255,0.8)",
      marginBottom: SPACING.xs,
    },
    totalAmount: {
      fontSize: 42,
      fontWeight: "800",
      color: colors.white,
      marginBottom: SPACING.sm,
    },
    totalSubtitle: { ...TYPOGRAPHY.body, color: "rgba(255,255,255,0.9)" },

    // Стили для карточки предупреждения
    warningCard: {
      backgroundColor: "#FEF3C7", // Светло-желтый фон
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.xl,
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    warningHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    warningTitle: {
      ...TYPOGRAPHY.subtitle,
      color: "#92400E", // Темно-коричневый
      fontSize: 16,
    },
    warningText: {
      ...TYPOGRAPHY.body,
      color: "#92400E",
      lineHeight: 22,
    },
    boldText: {
      fontWeight: "bold",
      color: "#92400E",
    },
    plusText: {
      fontWeight: "bold",
      color: "#EF4444", // Красный для акцента
    },

    emptyState: {
      alignItems: "center",
      marginTop: SPACING.xl,
    },
    emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
    emptyText: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      marginBottom: SPACING.xs,
    },
    emptySubtext: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
