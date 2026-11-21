import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterstitialAd, InterstitialAdLoader } from "yandex-mobile-ads";
import { usePremiumStore } from "../store/usePremiumStore";

const AD_KEY = "@sub_stop_last_ad_shown";
const ACTION_COOLDOWN_MS = 10 * 60 * 1000;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const RETRY_DELAY_MS = 30 * 1000;
const MAX_RETRIES = 3; // 🚀 Максимум 3 попытки

const INTERSTITIAL_AD_UNIT_ID = "R-M-20431707-2";

export const useInterstitialAd = () => {
  const { isPremium } = usePremiumStore();
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const isLoadingRef = useRef(false);
  const isShowingRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0); // 🚀 Счетчик попыток

  const loadAd = async () => {
    if (isPremium || isLoadingRef.current || interstitialRef.current) return;
    isLoadingRef.current = true;

    try {
      const loader = await InterstitialAdLoader.create();
      const ad = await loader.loadAd({
        adUnitId: INTERSTITIAL_AD_UNIT_ID,
      });

      ad.onAdShown = () => {
        isShowingRef.current = true;
      };

      ad.onAdDismissed = () => {
        interstitialRef.current = null;
        isShowingRef.current = false;
      };

      ad.onAdFailedToShow = (error) => {
        console.error("❌ Ошибка показа Interstitial:", error);
        interstitialRef.current = null;
        isShowingRef.current = false;
      };

      interstitialRef.current = ad;
      retryCountRef.current = 0; // 🚀 Сбрасываем счетчик при успехе
      console.log("✅ Interstitial загружен и готов к показу");
    } catch (error) {
      console.warn("⚠️ Interstitial не загрузился:", error);

      // 🚀 Проверяем, не превысили ли мы лимит попыток
      if (retryCountRef.current < MAX_RETRIES) {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current += 1;
          console.log(
            `🔄 Повторная попытка загрузки Interstitial (${retryCountRef.current}/${MAX_RETRIES})...`,
          );
          loadAd();
        }, RETRY_DELAY_MS);
      } else {
        console.log(
          "⏹️ Достигнут лимит попыток загрузки рекламы. Ждем следующего запуска.",
        );
      }
    } finally {
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (isPremium) return;
    loadAd();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        // 🚀 При возврате в приложение сбрасываем счетчик и пробуем снова
        if (nextState === "active") {
          retryCountRef.current = 0;
          if (!interstitialRef.current && !isLoadingRef.current) {
            loadAd();
          }
        }
      },
    );

    return () => {
      subscription.remove();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isPremium]);

  const showAd = async (type: "action" | "daily") => {
    if (isPremium || !interstitialRef.current || isShowingRef.current) return;

    try {
      const lastShownStr = await AsyncStorage.getItem(AD_KEY);
      const lastShown = lastShownStr ? parseInt(lastShownStr, 10) : 0;
      const now = Date.now();
      const timePassed = now - lastShown;

      const cooldown =
        type === "action" ? ACTION_COOLDOWN_MS : DAILY_COOLDOWN_MS;

      if (timePassed >= cooldown) {
        isShowingRef.current = true;
        interstitialRef.current.show();
        await AsyncStorage.setItem(AD_KEY, now.toString());
      }
    } catch (error) {
      console.error("Ошибка показа рекламы:", error);
      isShowingRef.current = false;
    }
  };

  useEffect(() => {
    if (isPremium) return;
    const timer = setTimeout(() => showAd("daily"), 3000);
    return () => clearTimeout(timer);
  }, [isPremium]);

  return {
    showActionAd: () => showAd("action"),
  };
};
