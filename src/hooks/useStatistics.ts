import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { CATEGORIES, Category, Subscription } from "../types";

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
  const { usdRate, eurRate } = useSettingsStore();

  const stats = useMemo(() => {
    const toRUBMonthly = (sub: Subscription) => {
      const price =
        sub.price === 0 && sub.regularPrice ? sub.regularPrice : sub.price;
      let rubPrice = price;
      if (sub.currency === "USD") rubPrice = price * usdRate;
      if (sub.currency === "EUR") rubPrice = price * eurRate;
      return sub.billingCycle === "yearly" ? rubPrice / 12 : rubPrice;
    };

    const toRUBYearly = (sub: Subscription) => {
      const price =
        sub.price === 0 && sub.regularPrice ? sub.regularPrice : sub.price;
      let rubPrice = price;
      if (sub.currency === "USD") rubPrice = price * usdRate;
      if (sub.currency === "EUR") rubPrice = price * eurRate;
      return sub.billingCycle === "yearly" ? rubPrice : rubPrice * 12;
    };

    // 🚀 ИСПРАВЛЕНО (Вариант C): Берем СТРОГО активные подписки. Триалы исключены из текущей статистики.
    const activeSubs = subscriptions.filter((sub) => sub.status === "active");

    const totalMonthly = activeSubs.reduce(
      (sum, sub) => sum + toRUBMonthly(sub),
      0,
    );
    const totalYearly = activeSubs.reduce(
      (sum, sub) => sum + toRUBYearly(sub),
      0,
    );

    // Будущие траты считаются по ВСЕМ подпискам (включая триалы)
    const futureTotalMonthly = subscriptions.reduce((sum, sub) => {
      const futureSub = { ...sub, price: sub.regularPrice || sub.price };
      return sum + toRUBMonthly(futureSub);
    }, 0);

    const difference = futureTotalMonthly - totalMonthly;

    const topSubscriptions = [...activeSubs]
      .sort((a, b) => toRUBMonthly(b) - toRUBMonthly(a))
      .slice(0, 3);

    const categoryTotals = activeSubs.reduce(
      (acc, sub) => {
        const monthlyCost = toRUBMonthly(sub);
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
      totalYearly: Math.round(totalYearly),
      futureTotalMonthly: Math.round(futureTotalMonthly),
      difference: Math.round(difference),
      topSubscriptions,
      result,
    };
  }, [subscriptions, usdRate, eurRate]);

  return stats;
};
