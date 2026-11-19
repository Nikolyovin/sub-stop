export const formatPrice = (amount: number): string => {
  // 🚀 Округляем до целых, чтобы не было копеек
  const rounded = Math.round(amount)
  return (
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(
      rounded,
    ) + ' ₽'
  )
}

// 🚀 Форматирование суммы в конкретной валюте.
// Для рублей — 0 знаков (как раньше), для USD/EUR — 2 знака.
// Убирает "хвосты" вида 4.2491666666666665 и ставит запятую + пробелы тысяч.
export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₽'
  const decimals = currency === 'RUB' ? 0 : 2
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  return `${formatted} ${symbol}`
}
