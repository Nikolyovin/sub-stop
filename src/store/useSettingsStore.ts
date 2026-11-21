import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  notifyTrials: boolean;
  notifyRegular: boolean;
  reminderHour: number;
  reminderMinute: number;
  usdRate: number;
  eurRate: number;
  lastRateUpdate: number;

  toggleNotifyTrials: () => void;
  toggleNotifyRegular: () => void;
  setReminderTime: (hour: number, minute: number) => void;
  setRates: (usd: number, eur: number) => void;
  reset: () => void; // 🚀 ДОБАВЛЕНО
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifyTrials: true,
      notifyRegular: true,
      reminderHour: 10,
      reminderMinute: 0,
      usdRate: 90,
      eurRate: 100,
      lastRateUpdate: 0,

      toggleNotifyTrials: () =>
        set((state) => ({ notifyTrials: !state.notifyTrials })),
      toggleNotifyRegular: () =>
        set((state) => ({ notifyRegular: !state.notifyRegular })),
      setReminderTime: (hour, minute) =>
        set({ reminderHour: hour, reminderMinute: minute }),
      setRates: (usd, eur) =>
        set({ usdRate: usd, eurRate: eur, lastRateUpdate: Date.now() }),

      // 🚀 МГНОВЕННЫЙ СБРОС НАСТРОЕК
      reset: () =>
        set({
          notifyTrials: true,
          notifyRegular: true,
          reminderHour: 10,
          reminderMinute: 0,
          usdRate: 90,
          eurRate: 100,
          lastRateUpdate: 0,
        }),
    }),
    {
      name: "sub-stop-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
