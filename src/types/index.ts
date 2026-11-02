export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
  nextPaymentDate: string // ISO строка (YYYY-MM-DD)
  category: string
  color?: string // Цвет иконки (например, фиолетовый для Яндекс.Плюс)
}
