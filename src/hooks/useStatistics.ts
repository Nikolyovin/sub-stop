import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { CATEGORIES, Category, Subscription } from "../types";

const getActualPrice = (sub: Subscription) => {
  if (sub.status === "active" && sub.price === 0 && sub.regularPrice) {
    return sub.regularPrice;
  }
  return sub.price;
};

export interface CategoryStat {
  category: Category;
  label: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export const useStatistics = () => {
  const { subscriptions } = useSubscriptionStore();

  const stats = useMemo(() => {
    // 1. Текущие траты
    const activeSubs = subscriptions.filter(
      (sub) =>
        sub.status === "active" ||
        (sub.status === "trial" && getActualPrice(sub) > 0),
    );

    const totalMonthly = activeSubs.reduce((sum, sub) => {
      const actualPrice = getActualPrice(sub);
      const monthlyCost =
        sub.billingCycle === "yearly" ? actualPrice / 12 : actualPrice;
      return sum + monthlyCost;
    }, 0);

    // 2. Будущие траты
    const futureTotalMonthly = subscriptions.reduce((sum, sub) => {
      const priceToUse =
        sub.status === "trial" && sub.regularPrice
          ? sub.regularPrice
          : getActualPrice(sub);
      const monthlyCost =
        sub.billingCycle === "yearly" ? priceToUse / 12 : priceToUse;
      return sum + monthlyCost;
    }, 0);

    const difference = futureTotalMonthly - totalMonthly;

    // 3. Группировка по категориям
    const categoryTotals = activeSubs.reduce(
      (acc, sub) => {
        const actualPrice = getActualPrice(sub);
        const monthlyCost =
          sub.billingCycle === "yearly" ? actualPrice / 12 : actualPrice;
        acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
        return acc;
      },
      {} as Record<Category, number>,
    );

    const result: CategoryStat[] = CATEGORIES.map((cat) => {
      const amount = categoryTotals[cat.id] || 0;
      const percentage = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;

      return {
        category: cat.id,
        label: cat.label,
        color: cat.color,
        icon: cat.icon,
        amount: Math.round(amount),
        percentage: Math.round(percentage),
      };
    })
      .filter((stat) => stat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      totalMonthly: Math.round(totalMonthly),
      futureTotalMonthly: Math.round(futureTotalMonthly),
      difference: Math.round(difference),
      result,
    };
  }, [subscriptions]);

  return stats;
};
