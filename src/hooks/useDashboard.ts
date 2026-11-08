import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { Subscription } from "../types";

// 🚀 Хелпер для защиты от "нулевой" цены после триала
const getActualPrice = (sub: Subscription) => {
  if (sub.status === "active" && sub.price === 0 && sub.regularPrice) {
    return sub.regularPrice;
  }
  return sub.price;
};

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();

  // Реальные траты (активные + платные триалы)
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter(
        (sub) =>
          sub.status === "active" ||
          (sub.status === "trial" && getActualPrice(sub) > 0),
      )
      .reduce((sum, sub) => {
        const actualPrice = getActualPrice(sub);
        const monthlyCost =
          sub.billingCycle === "yearly" ? actualPrice / 12 : actualPrice;
        return sum + monthlyCost;
      }, 0);
  }, [subscriptions]);

  // Потенциальные траты (активные + триалы по их будущей цене)
  const totalWithTrials = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const priceToUse =
        sub.status === "trial" && sub.regularPrice
          ? sub.regularPrice
          : getActualPrice(sub);
      const monthlyCost =
        sub.billingCycle === "yearly" ? priceToUse / 12 : priceToUse;
      return sum + monthlyCost;
    }, 0);
  }, [subscriptions]);

  const totalYearly = useMemo(() => {
    return totalMonthly * 12;
  }, [totalMonthly]);

  return {
    subscriptions,
    removeSubscription,
    totalMonthly: Math.round(totalMonthly),
    totalWithTrials: Math.round(totalWithTrials),
    totalYearly: Math.round(totalYearly),
  };
};
