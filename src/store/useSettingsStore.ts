import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsState {
  notificationsEnabled: boolean
  notificationDaysBefore: number
  toggleNotifications: () => void
  setNotificationDaysBefore: (days: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      notificationDaysBefore: 2,
      
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
        
      setNotificationDaysBefore: (days) => 
        set({ notificationDaysBefore: days }),
    }),
    {
      name: 'sub-stop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)