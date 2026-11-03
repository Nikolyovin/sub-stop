import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { Category, Subscription } from '../types'
import {
  requestNotificationPermissions,
  scheduleSubscriptionReminder,
} from '../services/notificationService'

export const useSubscriptionForm = (
  onSuccess: () => void,
  initialData?: Subscription, // <-- Принимаем данные для редактирования
) => {
  const { addSubscriptionAndReturn, updateSubscription } =
    useSubscriptionStore()

  // Инициализируем стейт данными из initialData, если они есть
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price.toString() || '')
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>(
    initialData?.billingCycle || 'monthly',
  )
  const [date, setDate] = useState(
    initialData ? new Date(initialData.nextPaymentDate) : new Date(),
  )
  const [category, setCategory] = useState<Category>(
    initialData?.category || 'entertainment',
  )

  useEffect(() => {
    requestNotificationPermissions()
  }, [])

  const isValid = name.trim().length > 0 && Number(price) > 0

  const save = async () => {
    if (!isValid) return

    const formData = {
      name,
      price: Number(price),
      currency: 'RUB',
      billingCycle: cycle,
      nextPaymentDate: format(date, 'yyyy-MM-dd'),
      category,
    }

    if (initialData) {
      // Если редактируем — обновляем
      updateSubscription(initialData.id, formData)
      // Перепланируем уведомление (в реальном проекте старое нужно отменять, но для MVP сойдет)
      await scheduleSubscriptionReminder({ ...initialData, ...formData })
    } else {
      // Если создаем — добавляем
      const createdSub = addSubscriptionAndReturn(formData)
      if (createdSub) {
        await scheduleSubscriptionReminder(createdSub)
      }
    }

    onSuccess()
  }

  return {
    name,
    setName,
    price,
    setPrice,
    cycle,
    setCycle,
    date,
    setDate,
    category,
    setCategory,
    isValid,
    save,
    isEditing: !!initialData, // <-- Флаг, чтобы менять текст на кнопке
  }
}
