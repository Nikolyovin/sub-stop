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
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { KNOWN_BRANDS } from "../utils/brandUtils";
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []); // Чуть увеличили, чтобы было удобнее

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
  }));

  const filteredBrands = useMemo(() => {
    if (!search.trim()) return KNOWN_BRANDS;
    return KNOWN_BRANDS.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()),
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

  const renderIcon = (brand: any, size: number) => {
    if (brand.id === "telegram") {
      return <Ionicons name="paper-plane" size={size} color={brand.color} />;
    }
    if (brand.id === "vk") {
      return <Ionicons name="logo-vk" size={size} color={brand.color} />;
    }
    return (
      <MaterialCommunityIcons
        name={brand.icon as any}
        size={size}
        color={brand.color}
      />
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      // 🚀 РЕШЕНИЕ ПРОБЛЕМЫ:
      enableDynamicSizing={false} // <-- Запрещает шторке сжиматься, когда список короткий
      keyboardBehavior="interactive" // <-- Плавно поднимает шторку над клавиатурой
      keyboardBlurBehavior="restore" // <-- Возвращает на исходную высоту
    >
      {/* flex: 1 заставляет контент занять всю высоту шторки */}
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

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // <-- Выбор бренда с первого тапа
          contentContainerStyle={{ flexGrow: 1 }} // <-- Важно, чтобы пустое место было
        >
          <View style={styles.grid}>
            {filteredBrands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandCard}
                onPress={() => handleSelect(brand.name)}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: `${brand.color}15` },
                  ]}
                >
                  {renderIcon(brand, 28)}
                </View>
                <Text style={styles.brandName} numberOfLines={1}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredBrands.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Ничего не найдено</Text>
              <TouchableOpacity
                style={styles.customBtn}
                onPress={() => handleSelect(search)}
              >
                <Text style={styles.customBtnText}>Создать "{search}"</Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { paddingHorizontal: SPACING.lg },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
      marginBottom: SPACING.md,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.lg,
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.md,
      paddingBottom: SPACING.xl,
    },
    brandCard: { width: "30%", alignItems: "center", marginBottom: SPACING.md },
    iconWrapper: {
      width: 60,
      height: 60,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    brandName: {
      ...TYPOGRAPHY.caption,
      color: colors.textMain,
      textAlign: "center",
    },
    emptyState: { alignItems: "center", marginTop: SPACING.xl },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    customBtn: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: BORDER_RADIUS.round,
    },
    customBtnText: { ...TYPOGRAPHY.button, color: colors.white },
  });
