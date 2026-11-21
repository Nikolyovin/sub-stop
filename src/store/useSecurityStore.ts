import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SecurityState {
  isLockEnabled: boolean;
  isUnlocked: boolean;
  lastUnlockTime: number;
  isHydrated: boolean;
  setLockEnabled: (enabled: boolean) => void;
  setUnlocked: (unlocked: boolean) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isLockEnabled: false,
      isUnlocked: true,
      lastUnlockTime: Date.now(),
      isHydrated: false,

      setLockEnabled: (enabled) =>
        set({
          isLockEnabled: enabled,
          isUnlocked: true,
          lastUnlockTime: Date.now(),
        }),

      setUnlocked: (unlocked) =>
        set({
          isUnlocked: unlocked,
          lastUnlockTime: unlocked ? Date.now() : 0,
        }),

      setHydrated: (value) => set({ isHydrated: value }),

      reset: () =>
        set({
          isLockEnabled: false,
          isUnlocked: true,
          lastUnlockTime: Date.now(),
          isHydrated: true,
        }),
    }),
    {
      name: "@sub_stop_security",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLockEnabled: state.isLockEnabled,
        lastUnlockTime: state.lastUnlockTime,
      }),
      // 🚀 ГЛАВНЫЙ ФИКС: При загрузке из памяти (холодный старт), если защита включена, мы ЗАКРЫВАЕМ приложение
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isLockEnabled) {
            state.isUnlocked = false;
          }
          state.isHydrated = true;
        }
      },
    },
  ),
);
