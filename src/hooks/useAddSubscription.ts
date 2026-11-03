import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { Category } from '../types'
import {
  requestNotificationPermissions,
  scheduleSubscriptionReminder,
} from '../services/notificationService'

export const useAddSubscription = (onSuccess: () => void) => {
  const { addSubscription } = useSubscriptionStore()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [date, setDate] = useState(new Date())
  const [category, setCategory] = useState<Category>('entertainment')

  // Запрашиваем разрешения при открытии экрана добавления
  useEffect(() => {
    requestNotificationPermissions()
  }, [])

  const isValid = name.trim().length > 0 && Number(price) > 0

  const save = async () => {
    if (!isValid) return

    const newSub = {
      name,
      price: Number(price),
      currency: 'RUB',
      billingCycle: cycle,
      nextPaymentDate: format(date, 'yyyy-MM-dd'),
      category,
    }

    // Добавляем в стейт (функция вернет созданный объект с id)
    // Для этого нам нужно немного поправить стор, чтобы он возвращал добавленный объект
    const createdSub = useSubscriptionStore
      .getState()
      .addSubscriptionAndReturn(newSub)

    // Планируем уведомление
    if (createdSub) {
      await scheduleSubscriptionReminder(createdSub)
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
  }
}
