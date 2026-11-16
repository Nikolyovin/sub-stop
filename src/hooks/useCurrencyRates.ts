import { useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { fetchAndSaveRates } from '../services/currencyService'

export const useCurrencyRates = () => {
  const { lastRateUpdate } = useSettingsStore()

  useEffect(() => {
    const checkAndUpdate = async () => {
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000

      // Если обновляли меньше суток назад, ничего не делаем
      if (now - lastRateUpdate < oneDay) return

      await fetchAndSaveRates()
    }

    checkAndUpdate()
  }, [lastRateUpdate])
}
