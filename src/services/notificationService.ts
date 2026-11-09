import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Subscription } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Тестовое уведомление 🔔",
      body: "Ура! Уведомления работают. Скоро я напомню тебе о списании.",
    },
    trigger: null,
  });
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("subscriptions", {
        name: "Напоминания о подписках",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
      });
    } catch (e) {
      console.warn("Канал уведомлений не создан:", e);
    }
  }
  return true;
};

export const scheduleSubscriptionReminder = async (
  subscription: Subscription,
  settings: {
    notifyTrials: boolean;
    notifyRegular: boolean;
    hour: number;
    minute: number;
  },
) => {
  const isTrial = subscription.status === "trial";
  // Проверяем только конкретные настройки
  if (isTrial && !settings.notifyTrials) return;
  if (!isTrial && !settings.notifyRegular) return;

  const paymentDate = new Date(subscription.nextPaymentDate);

  // 1. За 1 день утром (время из настроек)
  const reminderDate = new Date(paymentDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(settings.hour, settings.minute, 0, 0);

  if (reminderDate.getTime() > Date.now()) {
    let title = "";
    let body = "";
    if (isTrial) {
      const nextPrice = subscription.regularPrice || subscription.price;
      title = "Заканчивается пробный период ⏳";
      body = `Завтра закончится промо-период на «${subscription.name}». Далее спишут ${nextPrice} ₽.`;
    } else {
      title = "Скоро списание! 💸";
      body = `Завтра спишут ${subscription.price} ₽ за подписку «${subscription.name}».`;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { subscriptionId: subscription.id } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        channelId: "subscriptions",
      },
    });
  }

  // 2. Для триала вечером накануне (+6 часов от утреннего времени)
  if (isTrial) {
    const lastDayDate = new Date(paymentDate);
    lastDayDate.setDate(lastDayDate.getDate() - 1);
    const eveningHour = (settings.hour + 6) % 24;
    lastDayDate.setHours(eveningHour, settings.minute, 0, 0);

    if (lastDayDate.getTime() > Date.now()) {
      const nextPrice = subscription.regularPrice || subscription.price;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Последний шанс отменить ⏳",
          body: `Завтра с «${subscription.name}» спишут ${nextPrice} ₽. Если подписка не нужна, отмените её сегодня.`,
          data: { subscriptionId: subscription.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: lastDayDate,
          channelId: "subscriptions",
        },
      });
    }
  }
};
