import { parse } from 'date-fns'

// 🚀 Единственный правильный способ парсить наши 'yyyy-MM-dd' строки.
// new Date('2024-02-29') = UTC-полночь (сдвиг на 3 часа в МСК и на день назад
// в западных зонах). parse() с явным форматом всегда даёт ЛОКАЛЬНУЮ полночь.
export const parseDate = (dateStr: string): Date => {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
  // На случай битых данных в AsyncStorage — возвращаем сегодня, а не Invalid Date
  return isNaN(parsed.getTime()) ? new Date() : parsed
}
