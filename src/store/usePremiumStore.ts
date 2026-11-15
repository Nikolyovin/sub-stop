import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { Platform } from "react-native";

// 🚀 Ссылка на твой сервер
const API_URL = "https://sub-stop-server-nikolyovin.msk1.amvera.tech";

interface PremiumState {
  isPremium: boolean;
  setPremium: (status: boolean) => void;
  getDeviceId: () => string;
  checkPremiumStatus: () => Promise<boolean>;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      setPremium: (status) => set({ isPremium: status }),

      // Получаем уникальный ID устройства Android
      getDeviceId: () => {
        if (Platform.OS === "android") {
          return Application.getAndroidId() || "unknown_android";
        }
        return "unknown_device";
      },

      // Запрос к серверу для проверки статуса
      checkPremiumStatus: async () => {
        try {
          const deviceId = get().getDeviceId();
          const response = await fetch(
            `${API_URL}/api/check-premium?device_id=${deviceId}`,
          );
          const data = await response.json();

          if (data.isPremium) {
            set({ isPremium: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Ошибка проверки премиума:", error);
          return get().isPremium; // Если сервер недоступен, оставляем локальный статус
        }
      },
    }),
    {
      name: "sub-stop-premium",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
