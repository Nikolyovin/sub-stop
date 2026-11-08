import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
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
  focusField?: "note";
}

export const SubscriptionFormScreen: React.FC<SubscriptionFormScreenProps> = ({
  onBack,
  initialData,
  focusField,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const bottomSheetRef = useRef<{ open: () => void }>(null);
  const noteInputRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);

  const form = useSubscriptionForm(onBack, initialData);

  // 🚀 Следим за клавиатурой, чтобы менять paddingBottom только когда она открыта
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Если фокус на заметке, скроллим вниз после того, как клавиатура выехала
      if (noteInputRef.current?.isFocused()) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (focusField === "note") {
      const timer = setTimeout(() => {
        noteInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [focusField]);

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          // 🚀 МАГИЯ: если клавиатура открыта, добавляем её высоту в отступ. Если закрыта — стандартный 24px.
          contentContainerStyle={[
            styles.form,
            {
              paddingBottom:
                keyboardHeight > 0 ? keyboardHeight + 20 : SPACING.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
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

          {form.status === "trial" && (
            <InputField
              label="Стоимость после окончания (₽)"
              value={form.regularPrice}
              onChangeText={form.setRegularPrice}
              placeholder="Например, 599"
              keyboardType="numeric"
            />
          )}

          <Text style={styles.label}>Периодичность</Text>
          <CycleSelector value={form.cycle} onChange={form.setCycle} />

          <CategorySelector
            selected={form.category}
            onSelect={form.setCategory}
          />

          <Text style={styles.label}>
            {form.status === "trial"
              ? "Дата окончания триала (первое списание)"
              : "Дата следующего списания"}
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {format(form.date, "dd.MM.yyyy")}
            </Text>
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

          <Text style={styles.label}>Заметка (необязательно)</Text>
          <TextInput
            ref={noteInputRef}
            style={[styles.dateInput, styles.noteInput]}
            placeholder="Например, аккаунт или когда отменить"
            placeholderTextColor={colors.textSecondary}
            value={form.note}
            onChangeText={form.setNote}
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            onFocus={() => {
              if (Platform.OS === "android") {
                setTimeout(
                  () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                  300,
                );
              }
            }}
          />

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
      </KeyboardAvoidingView>

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

    form: {
      paddingHorizontal: SPACING.lg,
    },

    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
      marginTop: SPACING.sm,
    },
    inputGroup: { marginBottom: SPACING.sm },

    selectorInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: 12,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.sm,
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
      paddingVertical: 12,
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
      paddingVertical: 12,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    dateText: { fontSize: 16, color: colors.textMain },

    noteInput: {
      height: 56,
      textAlignVertical: "center",
      fontSize: 16,
      color: colors.textMain,
    },

    saveBtn: {
      backgroundColor: colors.primary,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginTop: SPACING.lg,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
  });
