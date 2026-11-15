import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { CATEGORIES, Subscription } from "../types";
import { differenceInCalendarDays } from "date-fns";

const getActualPrice = (sub: Subscription) => {
  if (sub.status === "active" && sub.price === 0 && sub.regularPrice) {
    return sub.regularPrice;
  }
  return sub.price;
};

export const useSubscriptionDetails = (id: string | null) => {
  const { subscriptions, removeSubscription } = useSubscriptionStore();
  const { usdRate, eurRate } = useSettingsStore();

  const subscription = useMemo(() => {
    return subscriptions.find((s) => s.id === id);
  }, [subscriptions, id]);

  const categoryData = useMemo(() => {
    if (!subscription) return null;
    return (
      CATEGORIES.find((c) => c.id === subscription.category) || CATEGORIES[4]
    );
  }, [subscription]);

  const costs = useMemo(() => {
    if (!subscription) {
      return {
        monthly: 0,
        yearly: 0,
        futureMonthly: 0,
        monthlyRub: 0,
        yearlyRub: 0,
        futureMonthlyRub: 0,
      };
    }
    const isYearly = subscription.billingCycle === "yearly";

    const currentPrice = getActualPrice(subscription);
    const futurePrice = subscription.regularPrice || currentPrice;

    const monthly = isYearly ? currentPrice / 12 : currentPrice;
    const yearly = isYearly ? currentPrice : currentPrice * 12;
    const futureMonthly = isYearly ? futurePrice / 12 : futurePrice;

    const convertToRub = (amount: number) => {
      if (subscription.currency === "USD") return amount * usdRate;
      if (subscription.currency === "EUR") return amount * eurRate;
      return amount;
    };

    return {
      monthly,
      yearly,
      futureMonthly,
      monthlyRub: convertToRub(monthly),
      yearlyRub: convertToRub(yearly),
      futureMonthlyRub: convertToRub(futureMonthly),
    };
  }, [subscription, usdRate, eurRate]);

  const cycleInfo = useMemo(() => {
    if (!subscription) return { daysLeft: 0, progress: 0 };

    const today = new Date();
    const paymentDate = new Date(subscription.nextPaymentDate);
    const daysLeft = Math.max(0, differenceInCalendarDays(paymentDate, today));

    const totalDays = subscription.billingCycle === "monthly" ? 30 : 365;
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
