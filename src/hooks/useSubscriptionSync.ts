import { useEffect, useRef } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { scheduleSubscriptionReminder } from '../services/notificationService'
import { format, addMonths, addYears } from 'date-fns'
import { Subscription } from '../types'
import { parseDate } from '../utils/dateUtils'
import * as Notifications from 'expo-notifications'

export const useSubscriptionSync = () => {
  const { subscriptions, batchUpdateSubscriptions } = useSubscriptionStore()
  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore()

  // 🚀 Флаг, чтобы не запускать sync повторно при тех же данных
  const lastSyncedRef = useRef<string>('')

  useEffect(() => {
    if (subscriptions.length === 0) return

    // 🚀 Создаём "сигнатуру" состояния — sync запустится только если реально что-то изменилось
    const signature = subscriptions
      .map((s) => `${s.id}:${s.nextPaymentDate}:${s.status}:${s.price}`)
      .join('|')

    if (lastSyncedRef.current === signature) return
    lastSyncedRef.current = signature

    const syncSubscriptions = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const settingsPayload = {
        notifyTrials,
        notifyRegular,
        hour: reminderHour,
        minute: reminderMinute,
      }

      // 🚀 ФАЗА 1: Синхронно собираем все изменения
      const updates: Array<{ id: string; data: Partial<Subscription> }> = []
      const updatedSubsForNotifications: Subscription[] = []

      for (const sub of subscriptions) {
        let currentDate = parseDate(sub.nextPaymentDate)
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
          updates.push({
            id: sub.id,
            data: {
              nextPaymentDate: newDateStr,
              status: newStatus,
              price: newPrice,
            },
          })

          updatedSubsForNotifications.push({
            ...sub,
            nextPaymentDate: newDateStr,
            status: newStatus,
            price: newPrice,
          })
        } else {
          updatedSubsForNotifications.push(sub)
        }
      }

      // 🚀 Один батч-апдейт = ОДИН ререндер (вместо N)
      if (updates.length > 0) {
        batchUpdateSubscriptions(updates)
      }

      // 🚀 ФАЗА 2: Асинхронно планируем уведомления (не блокирует UI)
      await Notifications.cancelAllScheduledNotificationsAsync()

      for (const sub of updatedSubsForNotifications) {
        await scheduleSubscriptionReminder(sub, settingsPayload)
      }
    }

    syncSubscriptions()
  }, [
    subscriptions,
    notifyTrials,
    notifyRegular,
    reminderHour,
    reminderMinute,
    batchUpdateSubscriptions,
  ])
}
