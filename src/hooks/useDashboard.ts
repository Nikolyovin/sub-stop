import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Subscription } from "../types";

const getActualPrice = (sub: Subscription) => {
  if (sub.status === "active" && sub.price === 0 && sub.regularPrice) {
    return sub.regularPrice;
  }
  return sub.price;
};

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();
  const { usdRate, eurRate } = useSettingsStore();

  const toRUB = (price: number, currency: string) => {
    if (currency === "USD") return price * usdRate;
    if (currency === "EUR") return price * eurRate;
    return price;
  };

  // 🚀 ИСПРАВЛЕНО (Вариант C): Считаем только АКТИВНЫЕ подписки. Триалы — не расход.
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        const priceInRUB = toRUB(getActualPrice(sub), sub.currency);
        const monthlyCost =
          sub.billingCycle === "yearly" ? priceInRUB / 12 : priceInRUB;
        return sum + monthlyCost;
      }, 0);
  }, [subscriptions, usdRate, eurRate]);

  // Прогноз с учетом триалов (остается без изменений, это наша "желтая плашка")
  const totalWithTrials = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const priceToUse =
        sub.status === "trial" && sub.regularPrice
          ? sub.regularPrice
          : getActualPrice(sub);
      const priceInRUB = toRUB(priceToUse, sub.currency);
      const monthlyCost =
        sub.billingCycle === "yearly" ? priceInRUB / 12 : priceInRUB;
      return sum + monthlyCost;
    }, 0);
  }, [subscriptions, usdRate, eurRate]);

  // 🚀 Годовая сумма тоже считается только по активным подпискам, чтобы биться с "в месяц"
  const totalYearly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        const priceInRUB = toRUB(getActualPrice(sub), sub.currency);
        const yearlyCost =
          sub.billingCycle === "yearly" ? priceInRUB : priceInRUB * 12;
        return sum + yearlyCost;
      }, 0);
  }, [subscriptions, usdRate, eurRate]);

  return {
    subscriptions,
    removeSubscription,
    totalMonthly: Math.round(totalMonthly),
    totalWithTrials: Math.round(totalWithTrials),
    totalYearly: Math.round(totalYearly),
  };
};
