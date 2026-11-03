import { useMemo } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore()

  // Считаем общую сумму в месяц
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      // Если подписка годовая, делим её цену на 12, чтобы получить средний месячный расход
      const monthlyCost =
        sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price
      return sum + monthlyCost
    }, 0)
  }, [subscriptions])

  // Считаем сумму в год
  const totalYearly = useMemo(() => {
    return totalMonthly * 12
  }, [totalMonthly])

  return {
    subscriptions,
    removeSubscription,
    totalMonthly: Math.round(totalMonthly),
    totalYearly: Math.round(totalYearly),
  }
}
