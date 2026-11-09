import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
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

  const { totalMonthly, futureTotalMonthly, difference, result } =
    useStatistics();

  // Параметры для круговой диаграммы
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

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
        bounces={false}
        overScrollMode="never"
      >
        {/* 🚀 Блок с круговой диаграммой */}
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <Svg width={size} height={size}>
              {/* Фоновый круг */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Сегменты диаграммы */}
              {result.map((stat) => {
                const strokeDashoffset = -currentOffset;
                const segmentLength = (stat.percentage / 100) * circumference;
                currentOffset += segmentLength;

                return (
                  <Circle
                    key={stat.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={stat.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                  />
                );
              })}
            </Svg>
            {/* Текст в центре диаграммы */}
            <View style={styles.chartCenter}>
              <Text style={styles.chartLabel}>В месяц</Text>
              <Text style={styles.chartAmount}>{totalMonthly} ₽</Text>
            </View>
          </View>
        </View>

        {/* 🚀 Плашка предупреждения с нормальными отступами */}
        {difference > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning-outline" size={22} color="#D97706" />
              <Text style={styles.warningTitle}>Внимание: Триалы</Text>
            </View>
            <Text style={styles.warningText}>
              Если вы не отмените пробные периоды, ваши расходы вырастут до{" "}
              <Text style={styles.boldText}>{futureTotalMonthly} ₽/мес</Text>{" "}
              <Text style={styles.plusText}>(+{difference} ₽)</Text>
            </Text>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>По категориям</Text>
        </View>

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
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      height: 56,
      marginBottom: SPACING.md,
    },
    backBtn: { width: 44, justifyContent: "center" },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

    // Стили для графика
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.soft,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    chartCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    chartLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    chartAmount: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.textMain,
    },

    // 🚀 Плашка триалов (увеличены отступы)
    warningCard: {
      backgroundColor: "#FEF3C7",
      borderRadius: BORDER_RADIUS.lg,
      padding: 16, // Увеличили паддинг
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    warningHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    warningTitle: { ...TYPOGRAPHY.subtitle, color: "#92400E", fontSize: 16 },
    warningText: { ...TYPOGRAPHY.body, color: "#92400E", lineHeight: 22 },
    boldText: { fontWeight: "bold", color: "#92400E" },
    plusText: { fontWeight: "bold", color: "#EF4444" },

    listHeader: {
      marginTop: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    listTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
    },

    emptyState: { alignItems: "center", marginTop: SPACING.xl },
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
