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
      addSubscriptionAndReturn: (sub: Omit<Subscription, 'id'>) => {
        const newSub = {
          ...sub,
          id: Math.random().toString(36).substring(2, 9),
        }
        set((state) => ({
          subscriptions: [...state.subscriptions, newSub],
        }))
        return newSub
      },

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
