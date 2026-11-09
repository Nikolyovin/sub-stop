import { useEffect } from 'react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { scheduleSubscriptionReminder } from '../services/notificationService'
import { format, addMonths, addYears } from 'date-fns'
import { Subscription } from '../types'

export const useSubscriptionSync = () => {
  const { subscriptions, updateSubscription } = useSubscriptionStore()
  const {
    notificationsEnabled,
    notifyTrials,
    notifyRegular,
    reminderHour,
    reminderMinute,
  } = useSettingsStore()

  useEffect(() => {
    const syncSubscriptions = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const settingsPayload = {
        enabled: notificationsEnabled,
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
            if (sub.regularPrice !== undefined) newPrice = sub.regularPrice
          }
          if (sub.billingCycle === 'monthly')
            currentDate = addMonths(currentDate, 1)
          else currentDate = addYears(currentDate, 1)
        }

        if (updated) {
          const newDateStr = format(currentDate, 'yyyy-MM-dd')
          const updates: Partial<Subscription> = {
            nextPaymentDate: newDateStr,
            status: newStatus,
            price: newPrice,
          }
          updateSubscription(sub.id, updates)
          const updatedSub: Subscription = {
            ...sub,
            ...updates,
          } as Subscription
          await scheduleSubscriptionReminder(updatedSub, settingsPayload)
        }
      }
    }

    if (subscriptions.length > 0) syncSubscriptions()
  }, [
    notificationsEnabled,
    notifyTrials,
    notifyRegular,
    reminderHour,
    reminderMinute,
  ])
}
