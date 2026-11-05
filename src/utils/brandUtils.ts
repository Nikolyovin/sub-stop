export interface Brand {
  id: string
  name: string
  icon: string
  color: string
}

export const KNOWN_BRANDS: Brand[] = [
  { id: 'yandex', name: 'Яндекс.Плюс', icon: 'alpha-y-box', color: '#FC3F1D' }, // Безопасная замена логотипа Яндекса
  { id: 'netflix', name: 'Netflix', icon: 'netflix', color: '#E50914' },
  { id: 'spotify', name: 'Spotify', icon: 'spotify', color: '#1DB954' },
  { id: 'telegram', name: 'Telegram', icon: 'telegram', color: '#229ED9' },
  { id: 'vk', name: 'VK Музыка', icon: 'vk', color: '#0077FF' },
  { id: 'okko', name: 'Okko', icon: 'movie-open', color: '#EA3E8E' },
  { id: 'more', name: 'More.tv', icon: 'television', color: '#F97316' },
  { id: 'ivi', name: 'IVI', icon: 'play', color: '#EA1D2C' },
]

export const getBrandData = (name: string): Brand => {
  const lower = name.toLowerCase()
  const found = KNOWN_BRANDS.find(
    (b) =>
      lower.includes(b.id) ||
      lower.includes(b.name.toLowerCase().split(' ')[0]),
  )
  if (found) return found
  return { id: 'other', name: 'Другое', icon: 'apps', color: '#64748B' }
}
