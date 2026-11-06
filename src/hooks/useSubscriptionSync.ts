import { useEffect } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { scheduleSubscriptionReminder } from "../services/notificationService";
import { format, addMonths, addYears, isPast, isToday } from "date-fns";
import { Subscription } from "../types";

export const useSubscriptionSync = () => {
  const { subscriptions, updateSubscription } = useSubscriptionStore();
  const { notificationDaysBefore } = useSettingsStore();

  useEffect(() => {
    const syncSubscriptions = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сравниваем только даты, без времени

      for (const sub of subscriptions) {
        let currentDate = new Date(sub.nextPaymentDate);
        let updated = false;
        let newStatus = sub.status;

        // Если дата списания прошла или наступила сегодня
        while (currentDate <= today) {
          updated = true;

          // Автоматически меняем статус с Триала на Платно
          if (newStatus === "trial") {
            newStatus = "active";
          }

          // Прибавляем месяц или год
          if (sub.billingCycle === "monthly") {
            currentDate = addMonths(currentDate, 1);
          } else {
            currentDate = addYears(currentDate, 1);
          }
        }

        if (updated) {
          const newDateStr = format(currentDate, "yyyy-MM-dd");

          // Обновляем в базе
          updateSubscription(sub.id, {
            nextPaymentDate: newDateStr,
            status: newStatus,
          });

          // Перепланируем уведомление на новую дату
          const updatedSub: Subscription = {
            ...sub,
            nextPaymentDate: newDateStr,
            status: newStatus,
          };
          await scheduleSubscriptionReminder(
            updatedSub,
            notificationDaysBefore,
          );

          console.log(`Автопродление: ${sub.name} обновлена до ${newDateStr}`);
        }
      }
    };

    // Запускаем только если есть подписки
    if (subscriptions.length > 0) {
      syncSubscriptions();
    }
  }, []); // Пустой массив, чтобы срабатывало 1 раз при монтировании App
};
