import { useEffect } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { scheduleSubscriptionReminder } from "../services/notificationService";
import { format, addMonths, addYears } from "date-fns";
import { Subscription } from "../types";

export const useSubscriptionSync = () => {
  const { subscriptions, updateSubscription } = useSubscriptionStore();

  // 🚀 Берем только нужные настройки
  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore();

  useEffect(() => {
    const syncSubscriptions = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сравниваем только даты

      const settingsPayload = {
        notifyTrials,
        notifyRegular,
        hour: reminderHour,
        minute: reminderMinute,
      };

      for (const sub of subscriptions) {
        let currentDate = new Date(sub.nextPaymentDate);
        let updated = false;
        let newStatus = sub.status;
        let newPrice = sub.price;

        // Проверяем, не наступила ли дата списания
        while (currentDate <= today) {
          updated = true;

          // Если триал закончился - переносим цену и меняем статус
          if (newStatus === "trial") {
            newStatus = "active";
            if (sub.regularPrice !== undefined) {
              newPrice = sub.regularPrice;
            }
          }

          // Сдвигаем дату вперед
          if (sub.billingCycle === "monthly") {
            currentDate = addMonths(currentDate, 1);
          } else {
            currentDate = addYears(currentDate, 1);
          }
        }

        if (updated) {
          const newDateStr = format(currentDate, "yyyy-MM-dd");

          const updates: Partial<Subscription> = {
            nextPaymentDate: newDateStr,
            status: newStatus,
            price: newPrice,
          };

          // Обновляем стор
          updateSubscription(sub.id, updates);

          // Перепланируем уведомление
          const updatedSub: Subscription = {
            ...sub,
            ...updates,
          } as Subscription;

          await scheduleSubscriptionReminder(updatedSub, settingsPayload);

          console.log(
            `Автопродление: ${sub.name} обновлена до ${newDateStr}. Новая цена: ${newPrice} ₽`,
          );
        }
      }
    };

    if (subscriptions.length > 0) {
      syncSubscriptions();
    }
    // Зависимости: перезапускаем, если поменялись настройки
  }, [notifyTrials, notifyRegular, reminderHour, reminderMinute]);
};
