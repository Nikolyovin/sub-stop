import { useSettingsStore } from '../store/useSettingsStore'

export const fetchAndSaveRates = async (): Promise<boolean> => {
  // 1. Пробуем официальный API ЦБ РФ
  try {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js')
    if (response.ok) {
      const data = await response.json()
      if (data.Valute && data.Valute.USD && data.Valute.EUR) {
        useSettingsStore
          .getState()
          .setRates(data.Valute.USD.Value, data.Valute.EUR.Value)
        console.log('✅ Курсы обновлены с API ЦБ РФ')
        return true
      }
    }
  } catch (error) {
    console.warn('⚠️ API ЦБ РФ недоступен, пробуем запасной...')
  }

  // 2. Если ЦБ РФ упал, пробуем запасной API (cdn.jsdelivr.net)
  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    )
    if (response.ok) {
      const data = await response.json()
      if (data.usd && data.usd.rub && data.usd.eur) {
        const usdToRub = data.usd.rub
        // Вычисляем курс евро к рублю через доллар: (USD/RUB) / (USD/EUR) = EUR/RUB
        const eurToRub = usdToRub / data.usd.eur

        useSettingsStore.getState().setRates(usdToRub, eurToRub)
        console.log('✅ Курсы обновлены с запасного API (jsdelivr)')
        return true
      }
    }
  } catch (error) {
    console.error('❌ Оба API недоступны. Оставляем старые курсы.')
  }

  return false
}
