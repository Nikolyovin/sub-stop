import { useEffect, useRef } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { scheduleSubscriptionReminder } from '../services/notificationService'
import { format, addMonths, addYears } from 'date-fns'
import { Subscription } from '../types'
import { parseDate } from '../utils/dateUtils'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useSubscriptionSync = () => {
  const { subscriptions, batchUpdateSubscriptions } = useSubscriptionStore()
  const { notifyTrials, notifyRegular, reminderHour, reminderMinute } =
    useSettingsStore()

  const lastSyncedRef = useRef<string>('')
  const prevTimeRef = useRef<string>('')

  useEffect(() => {
    if (subscriptions.length === 0) return

    const currentTime = `${reminderHour}:${reminderMinute}`
    const timeChanged =
      prevTimeRef.current !== '' && prevTimeRef.current !== currentTime
    prevTimeRef.current = currentTime

    // 🚀 Сигнатура только для проверки дат (автопродления)
    const dateSignature = subscriptions
      .map((s) => `${s.id}:${s.nextPaymentDate}:${s.status}:${s.price}`)
      .join('|')

    const fullSignature = `${dateSignature}|${currentTime}`

    // 🚀 Если время не менялось и даты не менялись — ничего не делаем
    if (lastSyncedRef.current === fullSignature && !timeChanged) return
    lastSyncedRef.current = fullSignature

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
      const subsToUpdateNotifications: Subscription[] = []

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

          subsToUpdateNotifications.push({
            ...sub,
            nextPaymentDate: newDateStr,
            status: newStatus,
            price: newPrice,
          })
        } else if (timeChanged) {
          // 🚀 Если время изменилось, добавляем ВСЕ подписки для пересоздания уведомлений
          subsToUpdateNotifications.push(sub)
        }
      }

      if (updates.length > 0) {
        batchUpdateSubscriptions(updates)
      }

      // 🚀 Если время не менялось и даты не обновлялись — ничего не трогаем
      if (subsToUpdateNotifications.length === 0) return

      try {
        // 🚀 Если время изменилось — полная очистка и пересоздание ВСЕХ уведомлений
        if (timeChanged) {
          const allKeys = await AsyncStorage.getAllKeys()
          const notifKeys = allKeys.filter((k) =>
            k.startsWith('@notif_planned_'),
          )
          if (notifKeys.length > 0) {
            await AsyncStorage.multiRemove(notifKeys)
          }
          await Notifications.cancelAllScheduledNotificationsAsync()

          for (const sub of subsToUpdateNotifications) {
            await scheduleSubscriptionReminder(sub, settingsPayload)
          }
        } else {
          // 🚀 Если просто обновились даты (автопродление) — пересоздаем уведомления только для них
          for (const sub of subsToUpdateNotifications) {
            const storageKey = `@notif_planned_${sub.id}`
            await AsyncStorage.removeItem(storageKey)
            await scheduleSubscriptionReminder(sub, settingsPayload)
          }
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
