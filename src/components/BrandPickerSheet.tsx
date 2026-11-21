import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList, // 🚀 ИСПОЛЬЗУЕМ FLATLIST
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { KNOWN_BRANDS, getBrandBackground, Brand } from "../utils/brandUtils";
import { BrandIcon } from "./ui/BrandIcon";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface BrandPickerSheetProps {
  onClose: () => void;
  onSelect: (brandName: string) => void;
}

export const BrandPickerSheet = React.forwardRef<
  { open: () => void },
  BrandPickerSheetProps
>(({ onClose, onSelect }, ref) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%", "100%"], []);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
  }));

  // 🚀 Поиск с учетом синонимов (aliases)
  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return KNOWN_BRANDS;

    return KNOWN_BRANDS.filter((b) => {
      const nameMatch = b.name.toLowerCase().includes(query);
      const aliasMatch = b.aliases?.some((alias) =>
        alias.toLowerCase().includes(query),
      );
      return nameMatch || aliasMatch;
    });
  }, [search]);

  // 🚀 Проверяем, есть ли точное совпадение
  const hasExactMatch = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return KNOWN_BRANDS.some(
      (b) =>
        b.name.toLowerCase() === query ||
        b.aliases?.some((alias) => alias.toLowerCase() === query),
    );
  }, [search]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleSelect = (name: string) => {
    onSelect(name);
    setSearch("");
    sheetRef.current?.dismiss();
  };

  // 🚀 Рендер одной карточки бренда
  const renderItem = useCallback(
    ({ item }: { item: Brand }) => (
      <TouchableOpacity
        style={styles.brandCard}
        onPress={() => handleSelect(item.name)}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: getBrandBackground(item, isDark) },
          ]}
        >
          <BrandIcon brand={item} size={28} />
        </View>
        <Text style={styles.brandName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [isDark, styles],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={[styles.content, { flex: 1 }]}>
        <Text style={styles.title}>Выберите сервис</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск сервиса..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* 🚀 Кнопка "Создать" */}
        {search.trim().length > 0 && !hasExactMatch && (
          <TouchableOpacity
            style={styles.inlineCreateBtn}
            onPress={() => handleSelect(search)}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.inlineCreateBtnText} numberOfLines={1}>
              Добавить "{search}"
            </Text>
          </TouchableOpacity>
        )}

        {/* 🚀 ВИРТУАЛИЗИРОВАННЫЙ СПИСОК */}
        <BottomSheetFlatList
          data={filteredBrands}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: SPACING.xs }}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: 10 }} // Распределяем по ширине
          initialNumToRender={12} // Сначала грузим только 12 иконок
          maxToRenderPerBatch={12} // Потом догружаем по 12
          windowSize={5} // Держим в памяти только 5 экранов
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            </View>
          )}
        />
      </View>
    </BottomSheetModal>
  );
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 20,
      marginBottom: SPACING.sm,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: SPACING.sm,
      fontSize: 16,
      color: colors.textMain,
    },
    inlineCreateBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.primary}15`,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    inlineCreateBtnText: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: "600",
      flex: 1,
    },
    // 🚀 Стили карточки (flex: 1 позволяет ровно распределить 3 колонки)
    brandCard: {
      flex: 1,
      maxWidth: "33.33%", // Защита от растягивания
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    iconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    brandName: {
      ...TYPOGRAPHY.caption,
      color: colors.textMain,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 14,
    },
    emptyState: { alignItems: "center", marginTop: SPACING.xl },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
    },
  });
