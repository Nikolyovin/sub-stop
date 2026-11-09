import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  notifyTrials: boolean;
  notifyRegular: boolean;
  reminderHour: number;
  reminderMinute: number;

  toggleNotifyTrials: () => void;
  toggleNotifyRegular: () => void;
  setReminderTime: (hour: number, minute: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifyTrials: true,
      notifyRegular: true,
      reminderHour: 10,
      reminderMinute: 0,

      toggleNotifyTrials: () =>
        set((state) => ({ notifyTrials: !state.notifyTrials })),
      toggleNotifyRegular: () =>
        set((state) => ({ notifyRegular: !state.notifyRegular })),
      setReminderTime: (hour, minute) =>
        set({ reminderHour: hour, reminderMinute: minute }),
    }),
    {
      name: "sub-stop-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
