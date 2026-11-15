import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SecurityState {
  isLockEnabled: boolean;
  isUnlocked: boolean;
  setLockEnabled: (enabled: boolean) => void;
  setUnlocked: (unlocked: boolean) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isLockEnabled: false,
      isUnlocked: true, // По умолчанию разблокировано

      setLockEnabled: (enabled) =>
        set({ isLockEnabled: enabled, isUnlocked: !enabled }),
      setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
    }),
    {
      name: "@sub_stop_security",
      storage: createJSONStorage(() => AsyncStorage),
      // Сохраняем на диск ТОЛЬКО настройку. Статус isUnlocked всегда сбрасывается при перезапуске.
      partialize: (state) => ({ isLockEnabled: state.isLockEnabled }),
    },
  ),
);
