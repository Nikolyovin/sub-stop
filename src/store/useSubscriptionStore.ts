import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Subscription } from '../types'

interface SubscriptionState {
  subscriptions: Subscription[]
  // Возвращает созданный объект (нужно для уведомлений)
  addSubscriptionAndReturn: (sub: Omit<Subscription, 'id'>) => Subscription
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void
  removeSubscription: (id: string) => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscriptionAndReturn: (sub) => {
        const newSub = {
          ...sub,
          id: Math.random().toString(36).substring(2, 9),
        }
        set((state) => ({
          subscriptions: [...state.subscriptions, newSub],
        }))
        return newSub
      },

      updateSubscription: (id, updatedSub) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updatedSub } : s,
          ),
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'sub-stop-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
