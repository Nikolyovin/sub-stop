import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Subscription } from '../types'
import { parseDate } from '../utils/dateUtils'
import { formatCurrency } from '../utils/formatUtils'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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

  if (finalStatus !== 'granted') return false

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('subscriptions', {
        name: 'Напоминания о подписках',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      })
    } catch (e) {
      console.warn('Канал уведомлений не создан:', e)
    }
  }
  return true
}

export const scheduleSubscriptionReminder = async (
  subscription: Subscription,
  settings: {
    notifyTrials: boolean
    notifyRegular: boolean
    hour: number
    minute: number
  },
) => {
  const isTrial = subscription.status === 'trial'
  if (isTrial && !settings.notifyTrials) return
  if (!isTrial && !settings.notifyRegular) return

  const paymentDate = parseDate(subscription.nextPaymentDate)

  // 1. Вычисляем идеальное время: за 1 день до оплаты, в заданное время
  const reminderDate = new Date(paymentDate)
  reminderDate.setDate(reminderDate.getDate() - 1)
  reminderDate.setHours(settings.hour, settings.minute, 0, 0)

  let finalTriggerDate = reminderDate
  let isFallbackTrigger = false

  // 🚀 Проверяем, не планировали ли мы уже уведомление для этой подписки
  const storageKey = `@notif_planned_${subscription.id}`
  const previouslyPlannedTime = await AsyncStorage.getItem(storageKey)
  const now = Date.now()

  // 2. Если идеальное время уже прошло, но оплата еще в будущем
  if (reminderDate.getTime() <= now) {
    if (paymentDate.getTime() > now) {
      // Если мы УЖЕ планировали уведомление и оно еще не сработало — не сдвигаем
      if (previouslyPlannedTime && parseInt(previouslyPlannedTime) > now) {
        console.log('⏭️ Уведомление уже запланировано, не сдвигаем.')
        return
      }

      // Иначе ставим на сейчас + 1 минута (только первый раз)
      console.log('⚠️ Время уведомления прошло. Планируем на 1 минуту вперед.')
      finalTriggerDate = new Date(now + 60 * 1000)
      isFallbackTrigger = true
    } else {
      console.log('⏭️ Оплата уже прошла, уведомление не планируем.')
      return
    }
  }

  console.log(
    '⏰ Уведомление запланировано на:',
    finalTriggerDate.toLocaleString(),
  )

  let title = ''
  let body = ''

  if (isTrial) {
    const nextPrice = subscription.regularPrice || subscription.price
    title = 'Заканчивается пробный период ⏳'
    body = `Завтра закончится промо-период на «${subscription.name}». Далее спишут ${formatCurrency(nextPrice, subscription.currency)}.`
  } else {
    title = 'Скоро списание! 💸'
    body = `Завтра спишут ${formatCurrency(subscription.price, subscription.currency)} за подписку «${subscription.name}».`
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { subscriptionId: subscription.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: finalTriggerDate,
        channelId: 'subscriptions',
      },
    })

    // 🚀 Запоминаем, на какое время мы запланировали уведомление
    await AsyncStorage.setItem(storageKey, String(finalTriggerDate.getTime()))

    console.log(
      '✅ Уведомление запланировано с ID:',
      notificationId,
      'на',
      finalTriggerDate.toLocaleString(),
    )
  } catch (error) {
    console.error('❌ Ошибка планирования уведомления:', error)
  }
}
