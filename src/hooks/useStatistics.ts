import { useMemo } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { CATEGORIES, Category, Subscription } from '../types'

export interface CategoryStat {
  category: Category
  label: string
  color: string
  icon: string
  amount: number
  percentage: number
}

export const useStatistics = () => {
  const { subscriptions } = useSubscriptionStore()
  const { usdRate, eurRate } = useSettingsStore()

  const stats = useMemo(() => {
    const toRUB = (sub: Subscription) => {
      const price =
        sub.status === 'active' && sub.price === 0 && sub.regularPrice
          ? sub.regularPrice
          : sub.price

      let rubPrice = price
      if (sub.currency === 'USD') rubPrice = price * usdRate
      if (sub.currency === 'EUR') rubPrice = price * eurRate

      return sub.billingCycle === 'yearly' ? rubPrice / 12 : rubPrice
    }

    // 1. Текущие траты
    const activeSubs = subscriptions.filter(
      (sub) =>
        sub.status === 'active' || (sub.status === 'trial' && sub.price > 0),
    )

    const totalMonthly = activeSubs.reduce((sum, sub) => sum + toRUB(sub), 0)
    // 🚀 Год = округлённая месячная × 12 (согласованно с показываемым "в месяц")
    const totalYearly = Math.round(totalMonthly) * 12

    // 2. Будущие траты
    const futureTotalMonthly = subscriptions.reduce((sum, sub) => {
      const futureSub = { ...sub, price: sub.regularPrice || sub.price }
      return sum + toRUB(futureSub)
    }, 0)

    const difference = futureTotalMonthly - totalMonthly

    // 3. Топ-3 подписок
    const topSubscriptions = [...activeSubs]
      .sort((a, b) => toRUB(b) - toRUB(a))
      .slice(0, 3)

    // 4. Группировка по категориям
    const categoryTotals = activeSubs.reduce(
      (acc, sub) => {
        const monthlyCost = toRUB(sub)
        acc[sub.category] = (acc[sub.category] || 0) + monthlyCost
        return acc
      },
      {} as Record<Category, number>,
    )

    const result: CategoryStat[] = CATEGORIES.map((cat) => {
      const amount = categoryTotals[cat.id] || 0
      const percentage = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0

      return {
        category: cat.id,
        label: cat.label,
        color: cat.color,
        icon: cat.icon,
        amount: Math.round(amount),
        percentage: Math.round(percentage),
      }
    })
      .filter((stat) => stat.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    return {
      totalMonthly: Math.round(totalMonthly),
      totalYearly,
      futureTotalMonthly: Math.round(futureTotalMonthly),
      difference: Math.round(difference),
      topSubscriptions,
      result,
    }
  }, [subscriptions, usdRate, eurRate])

  return stats
}
