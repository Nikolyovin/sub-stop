import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Category, Subscription } from "../types";
import {
  requestNotificationPermissions,
  scheduleSubscriptionReminder,
} from "../services/notificationService";

export const useSubscriptionForm = (
  onSuccess: () => void,
  initialData?: Subscription,
) => {
  const { addSubscriptionAndReturn, updateSubscription } =
    useSubscriptionStore();
  const { notificationDaysBefore } = useSettingsStore();

  const [isTrial, setIsTrial] = useState(initialData?.isTrial || false);
  const [trialEndDate, setTrialEndDate] = useState(
    initialData?.trialEndDate ? new Date(initialData.trialEndDate) : new Date(),
  );

  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [cycle, setCycle] = useState<"monthly" | "yearly">(
    initialData?.billingCycle || "monthly",
  );
  const [date, setDate] = useState(
    initialData ? new Date(initialData.nextPaymentDate) : new Date(),
  );
  const [category, setCategory] = useState<Category>(
    initialData?.category || "entertainment",
  );

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const isValid = name.trim().length > 0 && Number(price) > 0;

  const save = async () => {
    if (!isValid) return;

    const formData = {
      name,
      price: Number(price),
      currency: "RUB",
      billingCycle: cycle,
      nextPaymentDate: format(date, "yyyy-MM-dd"),
      category,
      isTrial,
      trialEndDate: isTrial ? format(trialEndDate, "yyyy-MM-dd") : undefined,
    };

    if (initialData) {
      updateSubscription(initialData.id, formData);
      await scheduleSubscriptionReminder(
        { ...initialData, ...formData },
        notificationDaysBefore,
      );
    } else {
      const createdSub = addSubscriptionAndReturn(formData);
      if (createdSub) {
        await scheduleSubscriptionReminder(createdSub, notificationDaysBefore);
      }
    }

    onSuccess();
  };

  return {
    name,
    setName,
    price,
    setPrice,
    cycle,
    setCycle,
    date,
    setDate,
    category,
    setCategory,
    isValid,
    save,
    isEditing: !!initialData,
    isTrial,
    setIsTrial,
    trialEndDate,
    setTrialEndDate,
  };
};
