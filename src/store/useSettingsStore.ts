import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsState {
  notificationsEnabled: boolean
  notifyTrials: boolean // 🚀 Уведомления по триалам
  notifyRegular: boolean // 🚀 Уведомления по платным подпискам

  toggleNotifications: () => void
  toggleNotifyTrials: () => void
  toggleNotifyRegular: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      notifyTrials: true,
      notifyRegular: true,

      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),

      toggleNotifyTrials: () =>
        set((state) => ({ notifyTrials: !state.notifyTrials })),

      toggleNotifyRegular: () =>
        set((state) => ({ notifyRegular: !state.notifyRegular })),
    }),
    {
      name: 'sub-stop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
