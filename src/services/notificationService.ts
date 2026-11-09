import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Subscription } from '../types'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Тестовое уведомление 🔔',
      body: 'Ура! Уведомления работают. Скоро я напомню тебе о списании.',
    },
    trigger: null,
  })
}

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return false
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('subscriptions', {
        name: 'Напоминания о подписках',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      })
    } catch (e) {
      console.warn(
        'Канал уведомлений не создан (это нормально для Expo Go):',
        e,
      )
    }
  }

  return true
}

export const scheduleSubscriptionReminder = async (
  subscription: Subscription,
  settings: { enabled: boolean; notifyTrials: boolean; notifyRegular: boolean },
) => {
  // 🚀 Если уведомления выключены полностью — выходим
  if (!settings.enabled) return

  const isTrial = subscription.status === 'trial'

  // 🚀 Проверяем, разрешил ли пользователь такие уведомления
  if (isTrial && !settings.notifyTrials) return
  if (!isTrial && !settings.notifyRegular) return

  const paymentDate = new Date(subscription.nextPaymentDate)

  // --- 1. ОСНОВНОЕ НАПОМИНАНИЕ (ВСЕГДА ЗА 1 ДЕНЬ В 10:00) ---
  const reminderDate = new Date(paymentDate)
  reminderDate.setDate(reminderDate.getDate() - 1) // За 1 день
  reminderDate.setHours(10, 0, 0, 0) // 10 утра

  if (reminderDate.getTime() > Date.now()) {
    let title = ''
    let body = ''

    if (isTrial) {
      const nextPrice = subscription.regularPrice || subscription.price
      title = 'Заканчивается пробный период ⏳'
      body = `Завтра закончится промо-период на «${subscription.name}». Далее спишут ${nextPrice} ₽.`
    } else {
      title = 'Скоро списание! 💸'
      body = `Завтра спишут ${subscription.price} ₽ за подписку «${subscription.name}».`
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
        channelId: 'subscriptions',
      },
    })
  }

  // --- 2. ДОПОЛНИТЕЛЬНОЕ НАПОМИНАНИЕ ДЛЯ ТРИАЛА (ВЕЧЕРОМ НАКАНУНЕ) ---
  if (isTrial) {
    const lastDayDate = new Date(paymentDate)
    lastDayDate.setDate(lastDayDate.getDate() - 1) // Тот же день (за 1 день)
    lastDayDate.setHours(18, 0, 0, 0) // Но в 18:00 вечера

    if (lastDayDate.getTime() > Date.now()) {
      const nextPrice = subscription.regularPrice || subscription.price

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Последний шанс отменить ⏳',
          body: `Завтра с «${subscription.name}» спишут ${nextPrice} ₽. Если подписка не нужна, отмените её сегодня.`,
          data: { subscriptionId: subscription.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: lastDayDate,
          channelId: 'subscriptions',
        },
      })
    }
  }
}
