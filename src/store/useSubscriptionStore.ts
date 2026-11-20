import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Subscription } from '../types'

interface SubscriptionState {
  subscriptions: Subscription[]
  isHydrated: boolean // 🚀 Флаг загрузки из AsyncStorage
  setHydrated: (value: boolean) => void
  addSubscriptionAndReturn: (
    sub: Omit<Subscription, 'id'>,
    index?: number,
  ) => Subscription
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void
  // 🚀 Новый метод: обновить несколько подписок одним батчем (1 ререндер)
  batchUpdateSubscriptions: (
    updates: Array<{ id: string; data: Partial<Subscription> }>,
  ) => void
  removeSubscription: (id: string) => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],
      isHydrated: false,

      setHydrated: (value) => set({ isHydrated: value }),

      addSubscriptionAndReturn: (sub, index) => {
        const newSub = {
          ...sub,
          id: Math.random().toString(36).substring(2, 9),
        }

        set((state) => {
          const newSubs = [...state.subscriptions]

          if (index !== undefined && index >= 0 && index <= newSubs.length) {
            newSubs.splice(index, 0, newSub)
          } else {
            newSubs.push(newSub)
          }

          return { subscriptions: newSubs }
        })

        return newSub
      },

      updateSubscription: (id, updatedSub) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updatedSub } : s,
          ),
        })),

      // 🚀 Батч-обновление: один ререндер вместо N
      batchUpdateSubscriptions: (updates) =>
        set((state) => {
          const updateMap = new Map(updates.map((u) => [u.id, u.data]))
          return {
            subscriptions: state.subscriptions.map((s) => {
              const update = updateMap.get(s.id)
              return update ? { ...s, ...update } : s
            }),
          }
        }),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'sub-stop-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 🚀 Колбэк после загрузки из AsyncStorage
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
