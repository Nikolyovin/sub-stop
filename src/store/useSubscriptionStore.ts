import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription } from "../types";

interface SubscriptionState {
  subscriptions: Subscription[];
  // Добавили необязательный параметр index
  addSubscriptionAndReturn: (
    sub: Omit<Subscription, "id">,
    index?: number,
  ) => Subscription;
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscriptionAndReturn: (sub, index) => {
        const newSub = {
          ...sub,
          id: Math.random().toString(36).substring(2, 9),
        };

        set((state) => {
          const newSubs = [...state.subscriptions];

          // Если индекс передан и он корректен, вставляем на его место
          if (index !== undefined && index >= 0 && index <= newSubs.length) {
            newSubs.splice(index, 0, newSub);
          } else {
            // Иначе добавляем в конец
            newSubs.push(newSub);
          }

          return { subscriptions: newSubs };
        });

        return newSub;
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
      name: "sub-stop-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
