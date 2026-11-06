import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { useDashboard } from "../hooks/useDashboard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { UndoSnackbar } from "../components/ui/UndoSnackbar";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

interface MainScreenProps {
  onAddPress: () => void;
  onOpenSettings: () => void;
  onOpenDetails: (id: string) => void;
  onOpenStatistics: () => void;
}

const UNDO_TIMEOUT_MS = 5000;

interface RightActionProps {
  drag: SharedValue<number>;
  item: Subscription;
  onDelete: (item: Subscription) => void;
  colors: ThemeColors;
}

const RightAction = ({ drag, item, onDelete, colors }: RightActionProps) => {
  const styleAnimation = useAnimatedStyle(() => {
    return { transform: [{ translateX: drag.value + 60 }] };
  });

  return (
    <Animated.View
      style={[
        styleAnimation,
        { width: 60, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <TouchableOpacity
        onPress={() => onDelete(item)}
        activeOpacity={0.7}
        style={{ padding: SPACING.sm }}
      >
        <Ionicons name="trash-outline" size={28} color={colors.danger} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MainScreen: React.FC<MainScreenProps> = ({
  onAddPress,
  onOpenSettings,
  onOpenDetails,
  onOpenStatistics,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    subscriptions,
    removeSubscription,
    totalMonthly,
    totalWithTrials,
    totalYearly,
  } = useDashboard();
  const { addSubscriptionAndReturn } = useSubscriptionStore();

  const [lastDeleted, setLastDeleted] = useState<Subscription | null>(null);
  const [lastDeletedIndex, setLastDeletedIndex] = useState<number>(-1);
  const [showUndo, setShowUndo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDelete = useCallback(
    (sub: Subscription) => {
      const currentIndex = subscriptions.findIndex((s) => s.id === sub.id);
      setLastDeletedIndex(currentIndex);
      setLastDeleted(sub);
      removeSubscription(sub.id);
      setShowUndo(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowUndo(false);
      }, UNDO_TIMEOUT_MS);
    },
    [removeSubscription, subscriptions],
  );

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return;
    addSubscriptionAndReturn(lastDeleted, lastDeletedIndex);
    setShowUndo(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [lastDeleted, lastDeletedIndex, addSubscriptionAndReturn]);

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <View style={{ marginBottom: SPACING.sm }}>
        <ReanimatedSwipeable
          renderRightActions={(prog, drag) => (
            <RightAction
              drag={drag}
              item={item}
              onDelete={handleDelete}
              colors={colors}
            />
          )}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenDetails(item.id)}
          >
            <SubscriptionCard subscription={item} />
          </TouchableOpacity>
        </ReanimatedSwipeable>
      </View>
    ),
    [onOpenDetails, handleDelete, colors],
  );

  return (
    <View style={styles.container}>
      {/* Шапка стала чище: только настройки слева и плюс справа */}
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

      {/* 🚀 СИНЯЯ КАРТОЧКА ТЕПЕРЬ КЛИКАБЕЛЬНАЯ */}
      <TouchableOpacity
        style={styles.totalCard}
        activeOpacity={0.85}
        onPress={onOpenStatistics}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.totalLabel}>Расходы в месяц</Text>
          <View style={styles.chartIconBg}>
            <Ionicons
              name="pie-chart"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </View>

        <Text style={styles.totalAmount}>{totalMonthly} ₽</Text>
        <Text style={styles.totalYearly}>Это {totalYearly} ₽ в год</Text>

        {totalWithTrials > totalMonthly && (
          <View style={{ width: "100%" }}>
            <View style={styles.trialDivider} />
            <Text style={styles.trialHint}>
              С учетом оплаты после триалов: {totalWithTrials} ₽/мес
            </Text>
          </View>
        )}
      </TouchableOpacity>

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

      <UndoSnackbar
        key={lastDeleted?.id || "empty"}
        visible={showUndo}
        onUndo={handleUndo}
        duration={UNDO_TIMEOUT_MS}
      />
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
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    chartIconBg: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    totalLabel: {
      ...TYPOGRAPHY.caption,
      color: "rgba(255,255,255,0.8)",
    },
    totalAmount: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.white,
      marginBottom: SPACING.sm,
    },
    totalYearly: { ...TYPOGRAPHY.body, color: "rgba(255,255,255,0.9)" },
    trialDivider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginVertical: SPACING.sm,
      width: "100%",
    },
    trialHint: {
      ...TYPOGRAPHY.caption,
      color: "rgba(255,255,255,0.7)",
      marginTop: SPACING.xs,
      fontStyle: "italic",
    },
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
