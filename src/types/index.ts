export type Category =
  | 'entertainment'
  | 'music'
  | 'software'
  | 'sport'
  | 'other'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
  nextPaymentDate: string
  category: Category // <-- Теперь это строгий тип
}

// Справочник категорий для UI
export const CATEGORIES: {
  id: Category
  label: string
  icon: string
  color: string
}[] = [
  {
    id: 'entertainment',
    label: 'Кино',
    icon: 'film-outline',
    color: '#EF4444',
  }, // Красный
  {
    id: 'music',
    label: 'Музыка',
    icon: 'musical-notes-outline',
    color: '#8B5CF6',
  }, // Фиолетовый
  { id: 'software', label: 'Софт', icon: 'laptop-outline', color: '#3B82F6' }, // Синий
  { id: 'sport', label: 'Спорт', icon: 'fitness-outline', color: '#10B981' }, // Зеленый
  { id: 'other', label: 'Другое', icon: 'apps-outline', color: '#64748B' }, // Серый
]
