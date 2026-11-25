import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@sub_stop_onboarding_seen";

export const ONBOARDING_DATA = [
  {
    id: "1",
    // 🚀 ИСПРАВЛЕНО: ../../ вместо ../
    lottie: require("../../assets/lottie/wallet.json"),
    title: "Полный контроль над расходами",
    description:
      "Собирайте все подписки в одном месте и легко управляйте своим бюджетом.",
    color: "#2563EB",
  },
  {
    id: "2",
    lottie: require("../../assets/lottie/bell.json"),
    title: "Ни одного забытого триала",
    description: "Умный календарь и уведомления напомнят об оплате заранее.",
    color: "#F59E0B",
  },
  {
    id: "3",
    lottie: require("../../assets/lottie/lock.json"),
    title: "Премиум без подписок",
    description:
      "Биометрия доступна всем. А за 199 ₽ вы получите календарь списаний и чистый интерфейс без рекламы навсегда.",
    color: "#10B981",
  },
];

export const useOnboarding = (onFinishCallback: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      onFinishCallback();
    } catch (e) {
      console.error("Ошибка сохранения онбординга", e);
      onFinishCallback();
    }
  }, [onFinishCallback]);

  const nextSlide = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  }, [currentIndex, finishOnboarding]);

  return {
    currentIndex,
    setCurrentIndex,
    nextSlide,
    finishOnboarding,
    isLastSlide: currentIndex === ONBOARDING_DATA.length - 1,
  };
};
