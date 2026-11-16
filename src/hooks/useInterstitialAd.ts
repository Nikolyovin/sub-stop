import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterstitialAd, InterstitialAdLoader } from "yandex-mobile-ads";
import { usePremiumStore } from "../store/usePremiumStore";

const AD_KEY = "@sub_stop_last_ad_shown";
const ACTION_COOLDOWN_MS = 10 * 60 * 1000; // 10 минут
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 часа

// 🚀 Твой ID межстраничной рекламы
const INTERSTITIAL_AD_UNIT_ID = "R-M-20431707-2";

export const useInterstitialAd = () => {
  const { isPremium } = usePremiumStore();
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const isLoadingRef = useRef(false);

  const loadAd = async () => {
    if (isPremium || isLoadingRef.current || interstitialRef.current) return;
    isLoadingRef.current = true;

    try {
      const loader = await InterstitialAdLoader.create();
      const ad = await loader.loadAd({
        adUnitId: INTERSTITIAL_AD_UNIT_ID,
      });

      ad.onAdShown = () => console.log("✅ Interstitial показан");
      ad.onAdDismissed = () => {
        interstitialRef.current = null;
      };
      ad.onAdFailedToShow = (error) => {
        console.error("❌ Ошибка показа Interstitial:", error);
        interstitialRef.current = null;
      };

      interstitialRef.current = ad;
      console.log("✅ Interstitial загружен и готов к показу");
    } catch (error) {
      console.error("❌ Ошибка загрузки Interstitial:", error);
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
        if (nextState === "active" && !interstitialRef.current) {
          loadAd();
        }
      },
    );

    return () => subscription.remove();
  }, [isPremium]);

  const showAd = async (type: "action" | "daily") => {
    if (isPremium || !interstitialRef.current) return;

    try {
      const lastShownStr = await AsyncStorage.getItem(AD_KEY);
      const lastShown = lastShownStr ? parseInt(lastShownStr) : 0;
      const now = Date.now();
      const timePassed = now - lastShown;

      const cooldown =
        type === "action" ? ACTION_COOLDOWN_MS : DAILY_COOLDOWN_MS;

      if (timePassed > cooldown) {
        interstitialRef.current.show();
        await AsyncStorage.setItem(AD_KEY, now.toString());
      }
    } catch (error) {
      console.error("Ошибка показа рекламы:", error);
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
