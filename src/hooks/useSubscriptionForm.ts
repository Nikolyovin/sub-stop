import { useState, useEffect, useMemo } from "react";
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

  // 🚀 Убрали notificationsEnabled
  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore();

  const [status, setStatus] = useState<SubscriptionStatus>(
    initialData?.status || "active",
  );
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
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
  const [note, setNote] = useState(initialData?.note || "");

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const initialFormValues = useMemo(
    () => ({
      name: initialData?.name || "",
      price: initialData?.price?.toString() || "",
      regularPrice: initialData?.regularPrice?.toString() || "",
      cycle: initialData?.billingCycle || "monthly",
      date: initialData ? new Date(initialData.nextPaymentDate) : new Date(),
      category: initialData?.category || "entertainment",
      status: initialData?.status || "active",
      note: initialData?.note || "",
    }),
    [initialData],
  );

  const hasChanges = useMemo(() => {
    return (
      name !== initialFormValues.name ||
      price !== initialFormValues.price ||
      regularPrice !== initialFormValues.regularPrice ||
      cycle !== initialFormValues.cycle ||
      format(date, "yyyy-MM-dd") !==
        format(initialFormValues.date, "yyyy-MM-dd") ||
      category !== initialFormValues.category ||
      status !== initialFormValues.status ||
      note !== initialFormValues.note
    );
  }, [
    name,
    price,
    regularPrice,
    cycle,
    date,
    category,
    status,
    note,
    initialFormValues,
  ]);

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
      note: note.trim(),
    };

    // 🚀 Убрали enabled из payload
    const settingsPayload = {
      notifyTrials,
      notifyRegular,
      hour: reminderHour,
      minute: reminderMinute,
    };

    if (initialData) {
      updateSubscription(initialData.id, formData);
      await scheduleSubscriptionReminder(
        { ...initialData, ...formData },
        settingsPayload,
      );
    } else {
      const createdSub = addSubscriptionAndReturn(formData);
      if (createdSub)
        await scheduleSubscriptionReminder(createdSub, settingsPayload);
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
    note,
    setNote,
    isValid,
    hasChanges,
    save,
    isEditing: !!initialData,
  };
};
