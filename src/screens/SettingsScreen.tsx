import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useSettingsStore } from "../store/useSettingsStore";
import { useBiometricLock } from "../hooks/useBiometricLock";
import { usePremiumStore } from "../store/usePremiumStore";
import { SettingsRow } from "../components/ui/SettingsRow";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import { SPACING, TYPOGRAPHY, ThemeColors } from "../theme";

interface SettingsScreenProps {
  onBack: () => void;
  onOpenPremium: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenPremium,
}) => {
  const { theme, toggleTheme, colors } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    notifyTrials,
    toggleNotifyTrials,
    notifyRegular,
    toggleNotifyRegular,
    reminderHour,
    reminderMinute,
    setReminderTime,
  } = useSettingsStore();

  const {
    isLockEnabled,
    isBiometricAvailable,
    toggleLock,
    isLockLoading,
    isCheckingHardware,
  } = useBiometricLock();

  const { isPremium } = usePremiumStore();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isAnyNotificationEnabled = notifyTrials || notifyRegular;
  const reminderDate = new Date();
  reminderDate.setHours(reminderHour, reminderMinute);

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (date) setReminderTime(date.getHours(), date.getMinutes());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <Text style={styles.sectionTitle}>Уведомления</Text>

        <SettingsRow
          icon="time-outline"
          title="Обычные подписки"
          value={notifyRegular}
          onToggle={toggleNotifyRegular}
        />
        <SettingsRow
          icon="alert-circle-outline"
          title="Пробные периоды (Триалы)"
          value={notifyTrials}
          onToggle={toggleNotifyTrials}
        />

        <TouchableOpacity
          style={[
            styles.timeButton,
            !isAnyNotificationEnabled && { opacity: 0.5 },
          ]}
          onPress={() => isAnyNotificationEnabled && setShowTimePicker(true)}
          disabled={!isAnyNotificationEnabled}
        >
          <View style={styles.left}>
            <Ionicons
              name="time-outline"
              size={20}
              color={
                !isAnyNotificationEnabled
                  ? colors.textSecondary
                  : colors.primary
              }
            />
            <Text
              style={[
                styles.timeLabel,
                !isAnyNotificationEnabled && { color: colors.textSecondary },
              ]}
            >
              Время напоминаний
            </Text>
          </View>
          <Text
            style={[
              styles.timeValue,
              !isAnyNotificationEnabled && { color: colors.textSecondary },
            ]}
          >
            {reminderHour.toString().padStart(2, "0")}:
            {reminderMinute.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onValueChange={onTimeChange}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}

        {(isBiometricAvailable || isCheckingHardware) && (
          <>
            <Text style={styles.sectionTitle}>Безопасность</Text>
            <SettingsRow
              icon="finger-print-outline"
              title="Вход по биометрии"
              value={isLockEnabled}
              onToggle={() => toggleLock(!isLockEnabled)}
              isLoading={isCheckingHardware || isLockLoading}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Основные</Text>
        <SettingsRow
          icon="moon-outline"
          title="Темная тема"
          value={theme === "dark"}
          onToggle={toggleTheme}
        />

        <Text style={styles.sectionTitle}>Поддержка</Text>
        {/* 🚀 Передаем золотой цвет иконки, если Премиум активен */}
        <SettingsRow
          icon={isPremium ? "star" : "star-outline"}
          title={isPremium ? "Премиум активен" : "Премиум-версия"}
          iconColor={isPremium ? "#F59E0B" : undefined}
          onPress={onOpenPremium}
        />

        <Text style={styles.sectionTitle}>О приложении</Text>
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Политика конфиденциальности"
          onPress={() =>
            Linking.openURL("https://nikolyovin.github.io/sub-stop-privacy/")
          }
        />

        <Text style={styles.versionText}>
          Версия {Constants.expoConfig?.version || "1.0.0"}
        </Text>
      </ScrollView>
    </View>
  );
};

// ... (стили createStyles остаются точно такими же, как в прошлом сообщении)
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
    content: { paddingHorizontal: SPACING.lg },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: "uppercase",
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    timeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.md,
      borderRadius: 16,
      marginBottom: 6,
      height: 56,
    },
    left: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    timeLabel: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 15 },
    timeValue: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: "bold",
      fontSize: 15,
    },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
    },
  });
