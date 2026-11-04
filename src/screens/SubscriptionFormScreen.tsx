import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

import { useSubscriptionForm } from "../hooks/useSubscriptionForm";
import { InputField } from "../components/ui/InputField";
import { CycleSelector } from "../components/ui/CycleSelector";
import { CategorySelector } from "../components/ui/CategorySelector";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import { BrandPickerSheet } from "../components/BrandPickerSheet";

import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { Subscription } from "../types";

interface SubscriptionFormScreenProps {
  onBack: () => void;
  initialData?: Subscription;
}

export const SubscriptionFormScreen: React.FC<SubscriptionFormScreenProps> = ({
  onBack,
  initialData,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [pickerType, setPickerType] = useState<"main" | "trial" | null>(null);

  // Реф для открытия модального окна
  const bottomSheetRef = useRef<{ open: () => void }>(null);

  const form = useSubscriptionForm(onBack, initialData);

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setPickerType(null);
    if (date) {
      if (pickerType === "main") form.setDate(date);
      if (pickerType === "trial") form.setTrialEndDate(date);
    }
  };

  const onDismiss = () => setPickerType(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>
          {form.isEditing ? "Редактирование" : "Новая подписка"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Название</Text>
          <TouchableOpacity
            style={styles.selectorInput}
            onPress={() => bottomSheetRef.current?.open()} // Открываем модалку
            activeOpacity={0.7}
          >
            <Text
              style={
                form.name
                  ? styles.selectorTextActive
                  : styles.selectorTextPlaceholder
              }
            >
              {form.name || "Выберите или введите название"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <InputField
          label="Стоимость (₽)"
          value={form.price}
          onChangeText={form.setPrice}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Периодичность</Text>
        <CycleSelector value={form.cycle} onChange={form.setCycle} />

        <CategorySelector
          selected={form.category}
          onSelect={form.setCategory}
        />

        <Text style={styles.label}>Дата следующего списания</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setPickerType("main")}
        >
          <Text style={styles.dateText}>{format(form.date, "dd.MM.yyyy")}</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Пробный период</Text>
          <Switch
            value={form.isTrial}
            onValueChange={form.setIsTrial}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {form.isTrial && (
          <>
            <Text style={styles.label}>Дата окончания пробного периода</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setPickerType("trial")}
            >
              <Text style={styles.dateText}>
                {format(form.trialEndDate, "dd.MM.yyyy")}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {pickerType !== null && (
          <DateTimePicker
            value={pickerType === "main" ? form.date : form.trialEndDate}
            mode="date"
            display="default"
            onValueChange={onDateChange}
            onDismiss={onDismiss}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity
          style={[styles.saveBtn, !form.isValid && styles.saveBtnDisabled]}
          onPress={form.save}
          disabled={!form.isValid}
        >
          <Text style={styles.saveBtnText}>
            {form.isEditing ? "Сохранить изменения" : "Добавить"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Модальная шторка */}
      <BrandPickerSheet
        ref={bottomSheetRef}
        onSelect={(name) => form.setName(name)}
        onClose={() => {}} // Можно оставить пустым, т.к. шторка сама закрывается
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
      marginBottom: SPACING.xl,
    },
    headerTitle: { ...TYPOGRAPHY.subtitle, color: colors.textMain },
    placeholder: { width: 44 },
    form: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    inputGroup: {
      marginBottom: SPACING.md,
    },
    selectorInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectorTextPlaceholder: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    selectorTextActive: {
      fontSize: 16,
      color: colors.textMain,
      fontWeight: "500",
    },
    dateInput: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    dateText: { fontSize: 16, color: colors.textMain },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginTop: SPACING.xl,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
  });
