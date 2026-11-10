import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PremiumState {
  isPremium: boolean;
  setPremium: (status: boolean) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      setPremium: (status) => set({ isPremium: status }),
    }),
    {
      name: "sub-stop-premium",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
