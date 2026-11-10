import { useEffect } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { scheduleSubscriptionReminder } from '../services/notificationService'
import { format, addMonths, addYears } from 'date-fns'
import { Subscription } from '../types'
import * as Notifications from 'expo-notifications' // 🚀 Импортируем для очистки

export const useSubscriptionSync = () => {
  const { subscriptions, updateSubscription } = useSubscriptionStore()

  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore()

  useEffect(() => {
    const syncSubscriptions = async () => {
      // 🚀 1. Очищаем ВСЕ старые уведомления (чтобы не было дублей)
      await Notifications.cancelAllScheduledNotificationsAsync()

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const settingsPayload = {
        notifyTrials,
        notifyRegular,
        hour: reminderHour,
        minute: reminderMinute,
      }

      for (const sub of subscriptions) {
        let currentDate = new Date(sub.nextPaymentDate)
        let updated = false
        let newStatus = sub.status
        let newPrice = sub.price

        while (currentDate <= today) {
          updated = true
          if (newStatus === 'trial') {
            newStatus = 'active'
            if (sub.regularPrice !== undefined) {
              newPrice = sub.regularPrice
            }
          }
          if (sub.billingCycle === 'monthly') {
            currentDate = addMonths(currentDate, 1)
          } else {
            currentDate = addYears(currentDate, 1)
          }
        }

        if (updated) {
          const newDateStr = format(currentDate, 'yyyy-MM-dd')
          const updates: Partial<Subscription> = {
            nextPaymentDate: newDateStr,
            status: newStatus,
            price: newPrice,
          }
          updateSubscription(sub.id, updates)
        }

        // 🚀 2. Планируем уведомления ЗАНОВО для каждой подписки с новым временем
        const updatedSub: Subscription = {
          ...sub,
          nextPaymentDate: format(currentDate, 'yyyy-MM-dd'),
          status: newStatus,
          price: newPrice,
        } as Subscription

        await scheduleSubscriptionReminder(updatedSub, settingsPayload)
      }
    }

    if (subscriptions.length > 0) {
      syncSubscriptions()
    }
    // 🚀 Теперь эффект срабатывает при изменении времени или тумблеров
  }, [notifyTrials, notifyRegular, reminderHour, reminderMinute])
}
