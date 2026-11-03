import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsState {
  notificationsEnabled: boolean
  toggleNotifications: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true, // По умолчанию включены
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    {
      name: 'sub-stop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
