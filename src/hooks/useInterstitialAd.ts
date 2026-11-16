import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { InterstitialAd } from 'yandex-mobile-ads'
import { usePremiumStore } from '../store/usePremiumStore'

const AD_KEY = '@sub_stop_last_ad_shown'
const ACTION_COOLDOWN_MS = 10 * 60 * 1000 // 10 минут для добавления/удаления
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 часа для входа в приложение

// 🚀 ЗАМЕНИ НА СВОЙ ID МЕЖСТРАНИЧНОЙ РЕКЛАМЫ
const INTERSTITIAL_AD_UNIT_ID = 'R-M-20431707-2'

export const useInterstitialAd = () => {
  const { isPremium } = usePremiumStore()

  // Создаем объект рекламы
  const interstitial = useRef(
    InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID),
  ).current

  // Загружаем рекламу в фоне
  useEffect(() => {
    if (!isPremium) {
      interstitial.load()
    }
  }, [isPremium, interstitial])

  // Функция показа рекламы с проверкой времени
  const showAd = async (type: 'action' | 'daily') => {
    if (isPremium || !interstitial.loaded) return

    try {
      const lastShownStr = await AsyncStorage.getItem(AD_KEY)
      const lastShown = lastShownStr ? parseInt(lastShownStr) : 0
      const now = Date.now()
      const timePassed = now - lastShown

      const cooldown =
        type === 'action' ? ACTION_COOLDOWN_MS : DAILY_COOLDOWN_MS

      if (timePassed > cooldown) {
        interstitial.show()
        await AsyncStorage.setItem(AD_KEY, now.toString())

        // Сразу начинаем грузить следующую рекламу
        setTimeout(() => interstitial.load(), 2000)
      }
    } catch (error) {
      console.error('Ошибка показа рекламы:', error)
    }
  }

  // 🚀 Следим за открытием приложения (раз в сутки)
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        showAd('daily')
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    // Проверяем при первом запуске
    showAd('daily')

    return () => subscription.remove()
  }, [isPremium, interstitial])

  // Возвращаем функцию для вызова при добавлении/удалении
  return {
    showActionAd: () => showAd('action'),
  }
}
