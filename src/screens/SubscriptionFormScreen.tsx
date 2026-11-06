import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const bottomSheetRef = useRef<{ open: () => void }>(null);

  const form = useSubscriptionForm(onBack, initialData);

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) form.setDate(date);
  };

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
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Название */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Название</Text>
          <TouchableOpacity
            style={styles.selectorInput}
            onPress={() => bottomSheetRef.current?.open()}
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

        {/* 2. Статус (перенесли наверх) */}
        <Text style={styles.label}>Статус подписки</Text>
        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              form.status === "active" && styles.statusBtnActive,
            ]}
            onPress={() => form.setStatus("active")}
          >
            <Text
              style={
                form.status === "active"
                  ? styles.statusTextActive
                  : styles.statusText
              }
            >
              Платно
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              form.status === "trial" && styles.statusBtnActive,
            ]}
            onPress={() => form.setStatus("trial")}
          >
            <Text
              style={
                form.status === "trial"
                  ? styles.statusTextActive
                  : styles.statusText
              }
            >
              Триал
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Стоимость (зависит от статуса) */}
        <InputField
          label={
            form.status === "trial"
              ? "Стоимость во время промо (₽)"
              : "Стоимость (₽)"
          }
          value={form.price}
          onChangeText={form.setPrice}
          placeholder="0"
          keyboardType="numeric"
        />

        {/* 4. Регулярная стоимость (только для триала) */}
        {form.status === "trial" && (
          <InputField
            label="Стоимость после окончания (₽)"
            value={form.regularPrice}
            onChangeText={form.setRegularPrice}
            placeholder="Например, 499"
            keyboardType="numeric"
          />
        )}

        {/* 5. Периодичность */}
        <Text style={styles.label}>Периодичность</Text>
        <CycleSelector value={form.cycle} onChange={form.setCycle} />

        {/* 6. Категория */}
        <CategorySelector
          selected={form.category}
          onSelect={form.setCategory}
        />

        {/* 7. Дата */}
        <Text style={styles.label}>
          {form.status === "trial"
            ? "Дата окончания триала (первое списание)"
            : "Дата следующего списания"}
        </Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{format(form.date, "dd.MM.yyyy")}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.date}
            mode="date"
            display="default"
            onValueChange={onDateChange}
            onDismiss={() => setShowDatePicker(false)}
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

      <BrandPickerSheet
        ref={bottomSheetRef}
        onSelect={(name) => form.setName(name)}
        onClose={() => {}}
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
    inputGroup: { marginBottom: SPACING.md },
    selectorInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md, // Добавили отступ снизу
    },
    selectorTextPlaceholder: { fontSize: 16, color: colors.textSecondary },
    selectorTextActive: {
      fontSize: 16,
      color: colors.textMain,
      fontWeight: "500",
    },
    statusRow: {
      flexDirection: "row",
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    statusBtn: {
      flex: 1,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statusBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusText: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontWeight: "500",
    },
    statusTextActive: {
      ...TYPOGRAPHY.body,
      color: colors.white,
      fontWeight: "bold",
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
