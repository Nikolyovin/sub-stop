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

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("subscriptions", {
        name: "Напоминания о подписках",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
      });
    } catch (e) {
      console.warn(
        "Канал уведомлений не создан (это нормально для Expo Go):",
        e,
      );
    }
  }

  return true;
};

export const scheduleSubscriptionReminder = async (
  subscription: Subscription,
  daysBefore: number = 2,
) => {
  const paymentDate = new Date(subscription.nextPaymentDate);
  const reminderDate = new Date(paymentDate);

  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  reminderDate.setHours(10, 0, 0, 0);

  if (reminderDate.getTime() <= Date.now()) {
    return;
  }

  // Правильное склонение
  let daysText = "дней";
  if (daysBefore === 1) daysText = "день";
  if (daysBefore >= 2 && daysBefore <= 4) daysText = "дня";

  // Разные уведомления для триала и обычной подписки
  let title = "";
  let body = "";

  if (subscription.status === "trial") {
    const nextPrice = subscription.regularPrice || subscription.price;
    title = "Заканчивается пробный период ⏳";
    body = `Через ${daysBefore} ${daysText} закончится промо-период на «${subscription.name}». Далее спишут ${nextPrice} ₽.`;
  } else {
    title = "Скоро списание! 💸";
    body = `Через ${daysBefore} ${daysText} спишут ${subscription.price} ₽ за подписку «${subscription.name}».`;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { subscriptionId: subscription.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: "subscriptions",
    },
  });
};
