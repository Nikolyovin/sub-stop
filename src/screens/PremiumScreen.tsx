import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { usePremiumStore } from "../store/usePremiumStore";
import { HeaderBackButton } from "../components/ui/HeaderBackButton";
import {
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  ThemeColors,
} from "../theme";
import { useTheme } from "../theme/ThemeContext";

const API_URL = "https://sub-stop-server-nikolyovin.msk1.amvera.tech";

interface PremiumScreenProps {
  onBack: () => void;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isPremium, setPremium, getDeviceId, checkPremiumStatus } =
    usePremiumStore();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active" && !isPremium) {
          console.log(
            "🔄 [APP] Приложение вернулось в активное состояние, проверяем премиум...",
          );
          await checkPremiumStatus();
        }
      },
    );
    return () => subscription.remove();
  }, [isPremium, checkPremiumStatus]);

  const handleStartPayment = async () => {
    if (!email.includes("@") || email.length < 5) {
      Alert.alert("Ошибка", "Пожалуйста, введите корректный Email");
      return;
    }

    setIsLoading(true);
    try {
      const deviceId = getDeviceId();
      console.log(
        "🟢 [APP 1] Начало запроса оплаты. Email:",
        email,
        "DeviceID:",
        deviceId,
      );

      const response = await fetch(`${API_URL}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          email: email,
        }),
      });

      console.log(
        "🟢 [APP 2] Статус ответа сервера:",
        response.status,
        response.statusText,
      );
      console.log(
        "🟢 [APP 2b] Заголовки ответа:",
        response.headers.get("content-type"),
      );

      // 🚀 ГЛАВНЫЙ ТРЮК: читаем сырой текст ДО парсинга JSON, чтобы поймать HTML-ошибки хостинга
      const rawText = await response.text();
      console.log(
        "🟡 [APP 3] Сырой ответ от сервера (первые 200 символов):",
        rawText.substring(0, 200),
      );

      let data;
      try {
        data = JSON.parse(rawText);
        console.log("🟢 [APP 4] Успешно распарсен JSON:", data);
      } catch (parseError) {
        console.error(
          "🔴 [APP 4.5] ОШИБКА ПАРСИНГА JSON! Сервер вернул не JSON:",
          parseError,
        );
        throw new Error(
          "Сервер вернул некорректный формат данных (не JSON). Возможно, сервер временно недоступен.",
        );
      }

      if (!response.ok) {
        console.error(
          "🔴 [APP 5] Сервер вернул ошибку HTTP:",
          response.status,
          data,
        );
        throw new Error(
          data.error || data.details || `Ошибка сервера: ${response.status}`,
        );
      }

      if (data.url) {
        console.log("🟢 [APP 6] Ссылка получена! Открываем браузер...");
        setShowEmailModal(false);

        // Открываем браузер
        await WebBrowser.openBrowserAsync(data.url);

        console.log(
          "🟢 [APP 7] Браузер закрыт. Ждем вебхук от Робокассы и проверяем статус...",
        );

        // 🚀 Даем Робокассе 3 секунды на отправку вебхука на наш сервер
        await new Promise<void>((resolve) => setTimeout(resolve, 3000));

        const isNowPremium = await checkPremiumStatus();

        if (isNowPremium) {
          Alert.alert(
            "🎉 Успех!",
            "Премиум активирован. Спасибо за поддержку!",
          );
        } else {
          Alert.alert(
            "⏳ Оплата обрабатывается",
            "Если вы успешно оплатили, статус обновится в течение 1-2 минут. Если нет, просто перезапустите приложение.",
          );
        }
      } else {
        console.error("🔴 [APP 8] В ответе сервера нет поля 'url'!", data);
        Alert.alert(
          "Ошибка",
          data.error ||
            "Сервер не вернул ссылку на оплату. Проверьте логи консоли.",
        );
      }
    } catch (error: any) {
      console.error(
        "🔴 🔴 🔴 [APP ❌] КРИТИЧЕСКАЯ ОШИБКА В ПРОЦЕССЕ ОПЛАТЫ 🔴 🔴 🔴",
      );
      console.error("Сообщение:", error.message);
      console.error("Имя ошибки:", error.name);
      console.error("Стек вызовов:", error.stack);

      Alert.alert(
        "Ошибка оплаты",
        error.message || "Не удалось связаться с сервером. Проверьте интернет.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Премиум</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconWrapper}>
            <Ionicons name="star" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Стоп-Подписка Премиум</Text>
          <Text style={styles.subtitle}>
            Поддержите разработку и получите максимум возможностей.
          </Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>199 ₽</Text>
            <Text style={styles.priceSubtext}>разово, навсегда</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Что входит сейчас</Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.danger}15` },
              ]}
            >
              <Ionicons name="close-circle" size={22} color={colors.danger} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Отключение рекламы</Text>
              <Text style={styles.featureDesc}>
                Никаких баннеров, которые отвлекают от контроля трат.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: `#10B98115` }]}
            >
              <Ionicons name="calendar" size={22} color="#10B981" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Календарь списаний</Text>
              <Text style={styles.featureDesc}>
                Наглядный график всех ваших платежей на каждый день.
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
          Скоро в обновлениях
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="eye-off" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Режим Инкогнито</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Скрытие сумм одним нажатием, если рядом чужие люди.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.accent}15` },
              ]}
            >
              <Ionicons name="pause" size={22} color={colors.accent} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Пауза подписок</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Заморозьте списания на время отпуска, не удаляя подписку.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: `#8B5CF615` }]}
            >
              <Ionicons name="apps" size={22} color="#8B5CF6" />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Виджеты на экран</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Сумма ваших трат всегда на виду на рабочем столе.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.buyBtn, isPremium && styles.buyBtnActive]}
          onPress={() => !isPremium && setShowEmailModal(true)}
          disabled={isPremium}
        >
          <Text style={styles.buyBtnText}>
            {isPremium ? "Премиум активирован" : "Купить за 199 ₽"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Единоразовый платеж. Без скрытых списаний.
        </Text>
      </View>

      <Modal visible={showEmailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Завершение покупки</Text>
            <Text style={styles.modalDesc}>
              Укажите свой Email. Он нужен для привязки покупки к вам и
              восстановления доступа, если вы смените телефон.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="example@mail.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowEmailModal(false)}
                disabled={isLoading}
              >
                <Text style={{ color: colors.textMain, fontWeight: "bold" }}>
                  Отмена
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleStartPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Оплатить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    headerTitle: {
      flex: 1,
      textAlign: "center",
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      alignItems: "center",
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.soft,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#F59E0B15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 24,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },
    subtitle: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: SPACING.md,
    },
    priceBadge: {
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    priceText: { fontSize: 24, fontWeight: "800", color: colors.primary },
    priceSubtext: {
      ...TYPOGRAPHY.caption,
      color: colors.primary,
      marginTop: 4,
    },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: "uppercase",
      marginBottom: SPACING.md,
    },
    featuresList: { gap: SPACING.md },
    featureItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.md,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    featureTextContainer: { flex: 1, paddingTop: 2 },
    featureTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 2,
    },
    featureTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textMain,
      fontSize: 16,
    },
    featureDesc: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    soonBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    soonText: {
      fontSize: 10,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    bottomActions: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: 34,
      backgroundColor: colors.background,
    },
    buyBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    buyBtnActive: { backgroundColor: colors.accent },
    buyBtnText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
    footerText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
    },
    modalTitle: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 20,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },
    modalDesc: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: SPACING.md,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      color: colors.textMain,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.lg,
    },
    modalActions: { flexDirection: "row", gap: SPACING.md },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: BORDER_RADIUS.round,
      alignItems: "center",
      justifyContent: "center",
    },
  });
