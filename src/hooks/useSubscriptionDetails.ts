import { useMemo } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { CATEGORIES } from '../types'

export const useSubscriptionDetails = (id: string | null) => {
  const { subscriptions, removeSubscription } = useSubscriptionStore()

  const subscription = useMemo(() => {
    return subscriptions.find((s) => s.id === id)
  }, [subscriptions, id])

  const categoryData = useMemo(() => {
    if (!subscription) return null
    return (
      CATEGORIES.find((c) => c.id === subscription.category) || CATEGORIES[4]
    )
  }, [subscription])

  // Считаем траты в месяц и в год
  const costs = useMemo(() => {
    if (!subscription) return { monthly: 0, yearly: 0 }
    const isYearly = subscription.billingCycle === 'yearly'
    return {
      monthly: isYearly
        ? Math.round(subscription.price / 12)
        : subscription.price,
      yearly: isYearly ? subscription.price : subscription.price * 12,
    }
  }, [subscription])

  return {
    subscription,
    categoryData,
    costs,
    removeSubscription,
  }
}
