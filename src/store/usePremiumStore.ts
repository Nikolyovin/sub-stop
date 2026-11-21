import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { Platform } from "react-native";

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

      getDeviceId: () => {
        if (Platform.OS === "android") {
          return Application.getAndroidId() || "unknown_android";
        }
        return "unknown_device";
      },

      checkPremiumStatus: async () => {
        try {
          const deviceId = get().getDeviceId();
          console.log(
            "🔍 [PREMIUM CHECK] Запрашиваем статус для deviceId:",
            deviceId,
          );

          const response = await fetch(
            `${API_URL}/api/check-premium?device_id=${deviceId}`,
          );

          if (!response.ok) {
            console.warn(`⚠️ Сервер вернул ошибку ${response.status}`);
            return get().isPremium;
          }

          const data = await response.json();
          console.log(
            "🔍 [PREMIUM CHECK] Ответ сервера:",
            JSON.stringify(data),
          ); // 🚀 ВОТ ЭТОТ ЛОГ

          if (data.isPremium) {
            set({ isPremium: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Ошибка сети при проверке премиума:", error);
          return get().isPremium;
        }
      },
    }),
    {
      name: "sub-stop-premium",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
