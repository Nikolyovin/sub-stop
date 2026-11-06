import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

export const useDashboard = () => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();

  // Реальные траты (активные + платные триалы)
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter(
        (sub) =>
          sub.status === "active" || (sub.status === "trial" && sub.price > 0),
      )
      .reduce((sum, sub) => {
        const monthlyCost =
          sub.billingCycle === "yearly" ? sub.price / 12 : sub.price;
        return sum + monthlyCost;
      }, 0);
  }, [subscriptions]);

  // Потенциальные траты (активные + триалы по их будущей цене)
  const totalWithTrials = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      // Если это триал, берем regularPrice (будущую цену), иначе текущую
      const priceToUse =
        sub.status === "trial" && sub.regularPrice
          ? sub.regularPrice
          : sub.price;
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
