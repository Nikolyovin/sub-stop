import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { CATEGORIES } from "../types";
import { differenceInCalendarDays } from "date-fns";

export const useSubscriptionDetails = (id: string | null) => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();

  const subscription = useMemo(() => {
    return subscriptions.find((s) => s.id === id);
  }, [subscriptions, id]);

  const categoryData = useMemo(() => {
    if (!subscription) return null;
    return (
      CATEGORIES.find((c) => c.id === subscription.category) || CATEGORIES[4]
    );
  }, [subscription]);

  // Считаем цены (текущую и будущую)
  const costs = useMemo(() => {
    if (!subscription) return { monthly: 0, yearly: 0, futureMonthly: 0 };
    const isYearly = subscription.billingCycle === "yearly";

    const currentPrice = subscription.price;
    const futurePrice = subscription.regularPrice || subscription.price;

    return {
      monthly: isYearly ? Math.round(currentPrice / 12) : currentPrice,
      yearly: isYearly ? currentPrice : currentPrice * 12,
      futureMonthly: isYearly ? Math.round(futurePrice / 12) : futurePrice,
    };
  }, [subscription]);

  // Считаем прогресс до списания
  const cycleInfo = useMemo(() => {
    if (!subscription) return { daysLeft: 0, progress: 0 };

    const today = new Date();
    const paymentDate = new Date(subscription.nextPaymentDate);
    const daysLeft = Math.max(0, differenceInCalendarDays(paymentDate, today));

    // Примерная длина цикла (30 дней для месяца, 365 для года)
    const totalDays = subscription.billingCycle === "monthly" ? 30 : 365;

    // Сколько дней прошло из цикла
    const daysPassed = Math.max(0, totalDays - daysLeft);
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return { daysLeft, progress };
  }, [subscription]);

  return {
    subscription,
    categoryData,
    costs,
    cycleInfo,
    removeSubscription,
  };
};
