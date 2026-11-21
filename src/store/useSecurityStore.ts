import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SecurityState {
  isLockEnabled: boolean;
  isUnlocked: boolean;
  setLockEnabled: (enabled: boolean) => void;
  setUnlocked: (unlocked: boolean) => void;
  reset: () => void; // 🚀 ДОБАВЛЕНО
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isLockEnabled: false,
      isUnlocked: true,

      setLockEnabled: (enabled) =>
        set({ isLockEnabled: enabled, isUnlocked: !enabled }),
      setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),

      // 🚀 МГНОВЕННЫЙ СБРОС БЕЗОПАСZNOSТИ
      reset: () => set({ isLockEnabled: false, isUnlocked: true }),
    }),
    {
      name: "@sub_stop_security",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isLockEnabled: state.isLockEnabled }),
    },
  ),
);
