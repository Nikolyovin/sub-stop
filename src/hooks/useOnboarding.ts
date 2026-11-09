import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = '@sub_stop_onboarding_seen'

export const ONBOARDING_DATA = [
  {
    id: '1',
    icon: 'pie-chart-outline' as const,
    title: 'Все траты под контролем',
    description:
      'Добавляйте подписки и смотрите, сколько денег уходит на сервисы каждый месяц. Наглядная статистика по категориям и общий бюджет.',
    color: '#2563EB', // Фирменный синий
  },
  {
    id: '2',
    icon: 'notifications-outline' as const,
    title: 'Умные уведомления',
    description:
      'Приложение напомнит о списании заранее. Настройте удобное время для пушей, чтобы успеть отменить ненужные подписки.',
    color: '#F59E0B', // Оранжевый
  },
  {
    id: '3',
    icon: 'wallet-outline' as const, // 🚀 Новая иконка кошелька
    title: 'Не платите лишнего',
    description:
      'Мы подсветим окончание пробных периодов красным и пришлем двойное напоминание. Вы точно успеете отменить триал до списания денег.',
    color: '#F97316', // 🚀 Насыщенный оранжевый (внимание/деньги)
  },
  {
    id: '4',
    icon: 'shield-checkmark-outline' as const,
    title: 'Безопасность данных',
    description:
      'Защитите свои финансовые данные с помощью Face ID или отпечатка пальца. Ваши подписки доступны только вам.',
    color: '#10B981', // Зеленый (Accent)
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
      onFinishCallback()
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
