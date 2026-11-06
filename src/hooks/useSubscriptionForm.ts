import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Category, Subscription, SubscriptionStatus } from "../types";
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

  const [status, setStatus] = useState<SubscriptionStatus>(
    initialData?.status || "active",
  );
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price.toString() || "");
  const [regularPrice, setRegularPrice] = useState(
    initialData?.regularPrice?.toString() || "",
  );
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

  // Валидация: если выбран триал, то регулярная цена обязательна
  const isRegularPriceValid =
    status === "active" || (status === "trial" && Number(regularPrice) > 0);
  const isValid =
    name.trim().length > 0 && Number(price) >= 0 && isRegularPriceValid;

  const save = async () => {
    if (!isValid) return;

    const formData = {
      name,
      price: Number(price),
      regularPrice: status === "trial" ? Number(regularPrice) : undefined,
      currency: "RUB",
      billingCycle: cycle,
      nextPaymentDate: format(date, "yyyy-MM-dd"),
      category,
      status,
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
    regularPrice,
    setRegularPrice,
    cycle,
    setCycle,
    date,
    setDate,
    category,
    setCategory,
    status,
    setStatus,
    isValid,
    save,
    isEditing: !!initialData,
  };
};
