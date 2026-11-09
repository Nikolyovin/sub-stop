import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsState {
  notificationsEnabled: boolean
  notifyTrials: boolean
  notifyRegular: boolean
  reminderHour: number
  reminderMinute: number

  toggleNotifications: () => void
  toggleNotifyTrials: () => void
  toggleNotifyRegular: () => void
  setReminderTime: (hour: number, minute: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      notifyTrials: true,
      notifyRegular: true,
      reminderHour: 10,
      reminderMinute: 0,

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleNotifyTrials: () =>
        set((state) => ({ notifyTrials: !state.notifyTrials })),
      toggleNotifyRegular: () =>
        set((state) => ({ notifyRegular: !state.notifyRegular })),
      setReminderTime: (hour, minute) =>
        set({ reminderHour: hour, reminderMinute: minute }),
    }),
    {
      name: 'sub-stop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
