import { useMemo } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { Subscription } from '../types'

const getActualPrice = (sub: Subscription) => {
  if (sub.status === 'active' && sub.price === 0 && sub.regularPrice) {
    return sub.regularPrice
  }
  return sub.price
}

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore()
  const { usdRate, eurRate } = useSettingsStore() // 🚀 Берем курсы

  // Функция конвертации в рубли
  const toRUB = (price: number, currency: string) => {
    if (currency === 'USD') return price * usdRate
    if (currency === 'EUR') return price * eurRate
    return price // RUB
  }

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter(
        (sub) =>
          sub.status === 'active' ||
          (sub.status === 'trial' && getActualPrice(sub) > 0),
      )
      .reduce((sum, sub) => {
        const priceInRUB = toRUB(getActualPrice(sub), sub.currency)
        const monthlyCost =
          sub.billingCycle === 'yearly' ? priceInRUB / 12 : priceInRUB
        return sum + monthlyCost
      }, 0)
  }, [subscriptions, usdRate, eurRate])

  const totalWithTrials = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const priceToUse =
        sub.status === 'trial' && sub.regularPrice
          ? sub.regularPrice
          : getActualPrice(sub)
      const priceInRUB = toRUB(priceToUse, sub.currency)
      const monthlyCost =
        sub.billingCycle === 'yearly' ? priceInRUB / 12 : priceInRUB
      return sum + monthlyCost
    }, 0)
  }, [subscriptions, usdRate, eurRate])

  return {
    subscriptions,
    removeSubscription,
    totalMonthly: Math.round(totalMonthly),
    totalWithTrials: Math.round(totalWithTrials),
    // 🚀 Годовая сумма теперь = округлённая месячная × 12.
    // Это гарантирует, что на экране "X в месяц" и "Y в год" всегда согласованы
    // (раньше из-за "хвоста" после запятой получалось +6 ₽ рассогласования).
    totalYearly: Math.round(totalMonthly) * 12,
  }
}
