import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = '@sub_stop_onboarding_seen'

// Данные для слайдов вынесем сюда, чтобы легко было менять
export const ONBOARDING_DATA = [
  {
    id: '1',
    icon: 'wallet-outline' as const,
    title: 'Контролируйте расходы',
    description:
      'Добавляйте все свои подписки в одном месте и всегда знайте, сколько тратите в месяц.',
    color: '#2563EB', // Наш синий
  },
  {
    id: '2',
    icon: 'eye-off-outline' as const,
    title: 'Никаких скрытых списаний',
    description:
      'Приложение посчитает общую сумму и покажет, сколько денег уходит на подписки за год.',
    color: '#8B5CF6', // Фиолетовый
  },
  {
    id: '3',
    icon: 'notifications-outline' as const,
    title: 'Уведомления о платежах',
    description:
      'Получайте напоминания за пару дней до списания, чтобы успеть отменить ненужную подписку.',
    color: '#10B981', // Зеленый
  },
]

export const useOnboarding = (onFinishCallback: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      onFinishCallback()
    } catch (e) {
      console.error('Ошибка сохранения онбординга', e)
      onFinishCallback() // Все равно пускаем в приложение
    }
  }, [onFinishCallback])

  const nextSlide = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      finishOnboarding()
    }
  }, [currentIndex, finishOnboarding])

  return {
    currentIndex,
    setCurrentIndex,
    nextSlide,
    finishOnboarding,
    isLastSlide: currentIndex === ONBOARDING_DATA.length - 1,
  }
}
