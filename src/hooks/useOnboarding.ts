import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = '@sub_stop_onboarding_seen'

export const ONBOARDING_DATA = [
  {
    id: '1',
    icon: 'wallet-outline' as const,
    title: 'Все траты под контролем',
    description:
      'Добавляйте платные и пробные подписки, чтобы всегда знать, сколько денег уходит на сервисы.',
    color: '#2563EB',
  },
  {
    id: '2',
    icon: 'notifications-outline' as const,
    title: 'Не забудьте отменить триал',
    description:
      'Приложение пришлет уведомление за пару дней до списания, чтобы вы успели отменить ненужную подписку.',
    color: '#F59E0B', // Желтый цвет для акцента на уведомлениях
  },
  {
    id: '3',
    icon: 'sparkles-outline' as const,
    title: 'Управляйте одним свайпом',
    description:
      'Легко удаляйте ненужные сервисы или восстанавливайте их, если ошиблись. Интуитивный интерфейс, в котором всё на своих местах.',
    color: '#8B5CF6', // Фиолетовый (премиум)
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
