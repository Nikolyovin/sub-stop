import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();

  // Реальные траты (только активные подписки)
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        const monthlyCost =
          sub.billingCycle === "yearly" ? sub.price / 12 : sub.price;
        return sum + monthlyCost;
      }, 0);
  }, [subscriptions]);

  // Потенциальные траты (активные + триалы)
  const totalWithTrials = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      // Берем либо текущую цену, либо будущую (если есть регулярная)
      const futurePrice = sub.regularPrice || sub.price;
      const monthlyCost =
        sub.billingCycle === "yearly" ? futurePrice / 12 : futurePrice;
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
