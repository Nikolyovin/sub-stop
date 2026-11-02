import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Subscription } from '../types'

interface SubscriptionState {
  subscriptions: Subscription[]
  addSubscription: (sub: Omit<Subscription, 'id'>) => void
  removeSubscription: (id: string) => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscription: (sub) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...sub, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'sub-stop-storage', // Имя ключа в памяти телефона
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
