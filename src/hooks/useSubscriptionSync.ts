import { useEffect, useRef } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { scheduleSubscriptionReminder } from '../services/notificationService'
import { format, addMonths, addYears } from 'date-fns'
import { Subscription } from '../types'
import { parseDate } from '../utils/dateUtils'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage' // 🚀 Импорт AsyncStorage

export const useSubscriptionSync = () => {
  const { subscriptions, batchUpdateSubscriptions } = useSubscriptionStore()
  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore()

  const lastSyncedRef = useRef<string>('')

  useEffect(() => {
    if (subscriptions.length === 0) return

    // 🚀 Сигнатура включает время напоминаний, чтобы sync запускался при его изменении
    const signature =
      subscriptions
        .map((s) => `${s.id}:${s.nextPaymentDate}:${s.status}:${s.price}`)
        .join('|') + `|${reminderHour}:${reminderMinute}`

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

      const updates: Array<{ id: string; data: Partial<Subscription> }> = []
      const updatedSubsForNotifications: Subscription[] = []

      for (const sub of subscriptions) {
        let currentDate = parseDate(sub.nextPaymentDate)
        let updated = false
        let newStatus = sub.status
        let newPrice = sub.price

        while (currentDate < today) {
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

      if (updates.length > 0) {
        batchUpdateSubscriptions(updates)
      }

      // 🚀 ФАЗА 2: Очищаем старые ключи, отменяем уведомления и планируем новые
      try {
        // 1. Находим и удаляем все ключи уведомлений из AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys()
        const notifKeys = allKeys.filter((k) => k.startsWith('@notif_planned_'))
        if (notifKeys.length > 0) {
          await AsyncStorage.multiRemove(notifKeys)
        }

        // 2. Отменяем все запланированные уведомления
        await Notifications.cancelAllScheduledNotificationsAsync()

        // 3. Планируем новые для каждой подписки
        for (const sub of updatedSubsForNotifications) {
          await scheduleSubscriptionReminder(sub, settingsPayload)
        }
      } catch (error) {
        console.error('❌ Ошибка синхронизации уведомлений:', error)
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
