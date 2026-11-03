import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Subscription } from '../types'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Пользователь не дал разрешение на уведомления')
    return false
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('subscriptions', {
      name: 'Напоминания о подписках',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    })
  }

  return true
}

export const scheduleSubscriptionReminder = async (
  subscription: Subscription,
) => {
  const paymentDate = new Date(subscription.nextPaymentDate)
  const reminderDate = new Date(paymentDate)
  reminderDate.setDate(reminderDate.getDate() - 2)
  reminderDate.setHours(10, 0, 0, 0)

  if (reminderDate.getTime() <= Date.now()) {
    return
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Скоро списание! 💸',
      body: `Через 2 дня спишут ${subscription.price} ₽ за подписку «${subscription.name}»`,
      data: { subscriptionId: subscription.id },
    },
    trigger: {
      // В новых версиях Expo нужно явно указывать тип триггера
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: 'subscriptions',
    },
  })
}
