export interface Brand {
  id: string
  name: string
  icon: string
  color: string
  iconFamily?: 'ionicons' | 'material'
  aliases?: string[]
}

export const KNOWN_BRANDS: Brand[] = [
  // --- БАНКИ / ЭКОСИСТЕМЫ ---
  {
    id: 'yandex',
    name: 'Яндекс.Плюс',
    icon: 'alpha-y-box',
    color: '#FC3F1D',
    iconFamily: 'material',
    aliases: ['яндекс', 'плюс', 'яндекс плюс'],
  },
  {
    id: 'sberprime',
    name: 'СберПрайм',
    icon: 'credit-card-outline',
    color: '#21A038',
    iconFamily: 'material',
    aliases: ['сбер', 'сбербанк', 'прайм'],
  },
  {
    id: 'mts',
    name: 'МТС Premium',
    icon: 'cellphone',
    color: '#E30611',
    iconFamily: 'material',
    aliases: ['мтс', 'мтс премиум'],
  },
  {
    id: 'tbank',
    name: 'Т-Банк Pro',
    icon: 'card-outline',
    color: '#FFDD2D',
    iconFamily: 'ionicons',
    aliases: ['тбанк', 'т-банк', 'тинькофф', 'тинек'],
  },
  {
    id: 't2',
    name: 'Т2',
    icon: 'sim-outline',
    color: '#000000',
    iconFamily: 'material',
    aliases: ['теле2', 'т2', 'tele2'],
  },
  {
    id: 'vtb',
    name: 'ВТБ Плюс',
    icon: 'bank',
    color: '#0033A0',
    iconFamily: 'material',
    aliases: ['втб', 'втб плюс'],
  },
  {
    id: 'alfa',
    name: 'Альфа-Смарт',
    icon: 'bank-outline',
    color: '#EF3124',
    iconFamily: 'material',
    aliases: ['альфа', 'альфабанк', 'альфа смарт'],
  },
  {
    id: 'gazprom',
    name: 'Газпромбанк Прайм',
    icon: 'credit-card',
    color: '#0055A5',
    iconFamily: 'material',
    aliases: ['газпром', 'гпб', 'газпромбанк'],
  },

  // --- МАРКЕТПЛЕЙСЫ / ДОСТАВКА ---
  {
    id: 'x5',
    name: 'X5 Пакет',
    icon: 'cart-outline',
    color: '#5CB85C',
    iconFamily: 'ionicons',
    aliases: ['х5', 'пятерочка', 'перекресток', 'x5 пакет'],
  },
  {
    id: 'wildberries',
    name: 'Wildberries',
    icon: 'shopping',
    color: '#CB11AB',
    iconFamily: 'material',
    aliases: ['вайлдберриз', 'вб', 'wb'],
  },
  {
    id: 'ozon',
    name: 'Ozon Premium',
    icon: 'cart',
    color: '#005BFF',
    iconFamily: 'material',
    aliases: ['озон', 'озон премиум'],
  },
  {
    id: 'samokat',
    name: 'Самокат',
    icon: 'bike',
    color: '#FF3300',
    iconFamily: 'material',
    aliases: ['самокат', 'доставка самокат'],
  },
  {
    id: 'yandexlavka',
    name: 'Яндекс Лавка',
    icon: 'basket-outline',
    color: '#FFCC00',
    iconFamily: 'ionicons',
    aliases: ['лавка', 'яндекс лавка', 'яндекс еда'],
  },
  {
    id: 'kupera',
    name: 'Купер',
    icon: 'basket',
    color: '#FF3E64',
    iconFamily: 'material',
    aliases: ['купер', 'сбермаркет', 'kupera'],
  },
  {
    id: 'magnit',
    name: 'Магнит',
    icon: 'store',
    color: '#009148',
    iconFamily: 'material',
    aliases: ['магнит', 'магазин магнит'],
  },
  {
    id: 'vkusno',
    name: 'Вкусно — и точка',
    icon: 'food',
    color: '#E4002B',
    iconFamily: 'material',
    aliases: ['вкусно и точка', 'макдональдс', 'мак'],
  },
  {
    id: 'yandexgo',
    name: 'Яндекс Go Plus',
    icon: 'taxi',
    color: '#FFCC00',
    iconFamily: 'material',
    aliases: ['яндекс го', 'яндекс такси', 'такси', 'yandex go'],
  },

  // --- КИНО / СТРИМИНГ ---
  {
    id: 'kinopoisk',
    name: 'Кинопоиск',
    icon: 'movie-open',
    color: '#FF5500',
    iconFamily: 'material',
    aliases: ['кино', 'кинопоиск', 'кп'],
  },
  {
    id: 'okko',
    name: 'Okko',
    icon: 'alpha-o-box',
    color: '#EA3E8E',
    iconFamily: 'material',
    aliases: ['окко'],
  },
  {
    id: 'ivi',
    name: 'IVI',
    icon: 'alpha-i-box',
    color: '#EA1D2C',
    iconFamily: 'material',
    aliases: ['иви'],
  },
  {
    id: 'wink',
    name: 'Wink',
    icon: 'alpha-w-box',
    color: '#FF4F12',
    iconFamily: 'material',
    aliases: ['винк', 'ростелеком тв'],
  },
  {
    id: 'kion',
    name: 'KION',
    icon: 'alpha-k-box',
    color: '#FFCC00',
    iconFamily: 'material',
    aliases: ['кион', 'мтс кино'],
  },
  {
    id: 'premier',
    name: 'Premier',
    icon: 'alpha-p-box',
    color: '#FF0000',
    iconFamily: 'material',
    aliases: ['премьер'],
  },
  {
    id: 'start',
    name: 'START',
    icon: 'alpha-s-box',
    color: '#1E90FF',
    iconFamily: 'material',
    aliases: ['старт'],
  },
  {
    id: 'amediateka',
    name: 'Amediateka',
    icon: 'television-box',
    color: '#8A2BE2',
    iconFamily: 'material',
    aliases: ['амедиатека'],
  },
  {
    id: 'more',
    name: 'more.tv',
    icon: 'television-play',
    color: '#00B2E3',
    iconFamily: 'material',
    aliases: ['мор тв', 'more', 'more.tv'],
  },
  {
    id: 'match',
    name: 'Матч! Игра / Матч ТВ',
    icon: 'soccer',
    color: '#009B48',
    iconFamily: 'material',
    aliases: ['матч', 'матч тв', 'матч футбол', 'футбол'],
  },
  {
    id: 'tricolor',
    name: 'Триколор',
    icon: 'satellite-variant',
    color: '#00A651',
    iconFamily: 'material',
    aliases: ['триколор', 'телевидение триколор'],
  },
  {
    id: 'mtstv',
    name: 'МТС ТВ',
    icon: 'television',
    color: '#E30611',
    iconFamily: 'material',
    aliases: ['мтс тв', 'мтс телевидение'],
  },
  {
    id: 'wifire',
    name: 'Wifire / Ростелеком',
    icon: 'wifi',
    color: '#FF7E00',
    iconFamily: 'material',
    aliases: ['вайфайр', 'ростелеком', 'wifire'],
  },
  {
    id: 'rutube',
    name: 'RuTube',
    icon: 'play-box-multiple',
    color: '#000000',
    iconFamily: 'material',
    aliases: ['рутуб', 'ру тьюб'],
  },
  {
    id: 'vkvideo',
    name: 'VK Видео',
    icon: 'video-box',
    color: '#0077FF',
    iconFamily: 'material',
    aliases: ['вк видео'],
  },
  {
    id: 'disney',
    name: 'Disney+',
    icon: 'movie-open-star',
    color: '#113CCF',
    iconFamily: 'material',
    aliases: ['дисней', 'disney', 'дисней плюс'],
  },
  {
    id: 'hbo',
    name: 'HBO Max',
    icon: 'television-classic',
    color: '#5B0E8A',
    iconFamily: 'material',
    aliases: ['хбо', 'hbo', 'хбо макс'],
  },
  {
    id: 'amazon',
    name: 'Amazon Prime',
    icon: 'package-variant',
    color: '#FF9900',
    iconFamily: 'material',
    aliases: ['амазон', 'amazon', 'амазон прайм', 'прайм'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    icon: 'netflix',
    color: '#E50914',
    iconFamily: 'material',
    aliases: ['нетфликс'],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'twitch',
    color: '#9146FF',
    iconFamily: 'material',
    aliases: ['твич', 'твитч', 'twitch'],
  },

  // --- МУЗЫКА / КНИГИ ---
  {
    id: 'yandexmusic',
    name: 'Яндекс Музыка',
    icon: 'music-circle-outline',
    color: '#FFCC00',
    iconFamily: 'material',
    aliases: ['яндекс музыка', 'яндексмузыка', 'ямузыка', 'yandex music'],
  },
  {
    id: 'vk',
    name: 'VK Музыка',
    icon: 'logo-vk',
    color: '#0077FF',
    iconFamily: 'ionicons',
    aliases: ['вк', 'вконтакте', 'вк музыка', 'vk'],
  },
  {
    id: 'zvuk',
    name: 'Zvuk',
    icon: 'music',
    color: '#FF007F',
    iconFamily: 'material',
    aliases: ['звук', 'zvuk'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'spotify',
    color: '#1DB954',
    iconFamily: 'material',
    aliases: ['спотифай', 'спотифаи'],
  },
  {
    id: 'applemusic',
    name: 'Apple Music',
    icon: 'apple',
    color: '#FA243C',
    iconFamily: 'material',
    aliases: ['эпл мьюзик', 'apple music', 'музыка эпл'],
  },
  {
    id: 'litres',
    name: 'Литрес',
    icon: 'book-open-variant',
    color: '#FF6B00',
    iconFamily: 'material',
    aliases: ['литрес', 'litres'],
  },
  {
    id: 'mybook',
    name: 'MyBook',
    icon: 'book-open-page-variant',
    color: '#00AEEF',
    iconFamily: 'material',
    aliases: ['майбук', 'mybook'],
  },
  {
    id: 'bookmate',
    name: 'Bookmate',
    icon: 'book-open',
    color: '#EF3E42',
    iconFamily: 'material',
    aliases: ['букмейт', 'bookmate'],
  },

  // --- ИИ / СОФТ / ОБЛАКО ---
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    icon: 'robot-outline',
    color: '#10A37F',
    iconFamily: 'material',
    aliases: ['чатгпт', 'чат жпт', 'openai', 'gpt'],
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: 'alpha-c-box',
    color: '#D97757',
    iconFamily: 'material',
    aliases: ['клауд', 'claude', 'клайд', 'антропик'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'sparkles',
    color: '#4285F4',
    iconFamily: 'ionicons',
    aliases: ['джимини', 'gemini', 'гугл ии'],
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    icon: 'microsoft',
    color: '#2D7FF9',
    iconFamily: 'material',
    aliases: ['копайлот', 'copilot', 'майс', 'бинг'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity Pro',
    icon: 'web',
    color: '#20808D',
    iconFamily: 'material',
    aliases: ['перплексити', 'perplexity'],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: 'alpha-j-box',
    color: '#FFD700',
    iconFamily: 'material',
    aliases: ['миджорни', 'midjourney', 'джорни'],
  },
  {
    id: 'suno',
    name: 'Suno',
    icon: 'music-box-multiple',
    color: '#FF5500',
    iconFamily: 'material',
    aliases: ['суно', 'suno'],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    icon: 'microphone',
    color: '#000000',
    iconFamily: 'material',
    aliases: ['элевенлабс', 'elevenlabs', 'озвучка ии'],
  },
  {
    id: 'gigachat',
    name: 'GigaChat',
    icon: 'alpha-g-box',
    color: '#00FF9D',
    iconFamily: 'material',
    aliases: ['гигачат', 'gigachat', 'сбер гпт'],
  },
  {
    id: 'kandinsky',
    name: 'Kandinsky',
    icon: 'brush',
    color: '#FC3F1D',
    iconFamily: 'material',
    aliases: ['кандинский', 'kandinsky', 'яндекс ии картинки'],
  },
  {
    id: 'yandex360',
    name: 'Яндекс 360',
    icon: 'cloud-outline',
    color: '#FC3F1D',
    iconFamily: 'ionicons',
    aliases: ['яндекс диск', 'яндекс 360', 'диск', 'яндекс почта'],
  },
  {
    id: 'googleone',
    name: 'Google One',
    icon: 'google-drive',
    color: '#4285F4',
    iconFamily: 'material',
    aliases: ['гугл ван', 'гугл диск', 'google'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: 'dropbox',
    color: '#0061FF',
    iconFamily: 'material',
    aliases: ['дропбокс', 'dropbox'],
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: 'microsoft-onedrive',
    color: '#0078D4',
    iconFamily: 'material',
    aliases: ['вандрайв', 'onedrive', 'майл диск'],
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    icon: 'apple-icloud',
    color: '#3693F3',
    iconFamily: 'material',
    aliases: ['иклоуд', 'icloud', 'apple диск'],
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    icon: 'microsoft-office',
    color: '#D83B01',
    iconFamily: 'material',
    aliases: ['майкрософт', 'офис', 'microsoft', 'office'],
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'notebook-outline',
    color: '#000000',
    iconFamily: 'material',
    aliases: ['ноушен', 'notion', 'нотион'],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'slack',
    color: '#4A154B',
    iconFamily: 'material',
    aliases: ['слак', 'slack'],
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: 'view-column',
    color: '#0079BF',
    iconFamily: 'material',
    aliases: ['трелло'],
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: 'vector-square',
    color: '#F24E1E',
    iconFamily: 'material',
    aliases: ['фигма', 'figma'],
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    icon: 'palette-outline',
    color: '#00C4CC',
    iconFamily: 'material',
    aliases: ['канва', 'canva', 'канва про'],
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    icon: 'alpha-a-box',
    color: '#FF0000',
    iconFamily: 'material',
    aliases: ['адоб', 'adobe', 'фотошоп', 'photoshop', 'иллюстратор'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: 'video',
    color: '#2D8CFF',
    iconFamily: 'material',
    aliases: ['зум'],
  },

  // --- ИГРЫ ---
  {
    id: 'steam',
    name: 'Steam',
    icon: 'steam',
    color: '#171A21',
    iconFamily: 'material',
    aliases: ['стим'],
  },
  {
    id: 'xbox',
    name: 'Xbox Game Pass',
    icon: 'microsoft-xbox',
    color: '#107C10',
    iconFamily: 'material',
    aliases: ['иксбокс', 'геймпасс', 'xbox'],
  },
  {
    id: 'playstation',
    name: 'PlayStation Plus',
    icon: 'sony-playstation',
    color: '#003791',
    iconFamily: 'material',
    aliases: ['плейстейшн', 'пс плюс', 'ps plus', 'ps'],
  },
  {
    id: 'vkplay',
    name: 'VK Play',
    icon: 'gamepad-variant',
    color: '#0077FF',
    iconFamily: 'material',
    aliases: ['вк плей', 'вк игры'],
  },

  // --- ОБУЧЕНИЕ / ПРОЧЕЕ ---
  {
    id: 'skysmart',
    name: 'Skysmart',
    icon: 'school',
    color: '#FF4F12',
    iconFamily: 'material',
    aliases: ['скайсмарт', 'скулмарт', 'skysmart'],
  },
  {
    id: 'skyeng',
    name: 'Skyeng',
    icon: 'translate',
    color: '#4A90E2',
    iconFamily: 'material',
    aliases: ['скайенг', 'skyeng', 'английский'],
  },
  {
    id: 'foxford',
    name: 'Фоксфорд',
    icon: 'book-education',
    color: '#F5A623',
    iconFamily: 'material',
    aliases: ['фоксфорд', 'foxford'],
  },
  {
    id: 'netology',
    name: 'Нетология',
    icon: 'code-tags',
    color: '#E41E8A',
    iconFamily: 'material',
    aliases: ['нетология', 'netology'],
  },
  {
    id: 'skillbox',
    name: 'Skillbox',
    icon: 'toolbox',
    color: '#FF6E17',
    iconFamily: 'material',
    aliases: ['скиллбокс', 'skillbox'],
  },
  {
    id: 'uchi',
    name: 'Учи.ру',
    icon: 'pencil-box',
    color: '#8A2BE2',
    iconFamily: 'material',
    aliases: ['учи ру', 'учи.ру'],
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    icon: 'owl',
    color: '#58CC02',
    iconFamily: 'material',
    aliases: ['дуолинго', 'дуо'],
  },
  {
    id: 'yandexkids',
    name: 'Яндекс Дети',
    icon: 'teddy-bear',
    color: '#FFCC00',
    iconFamily: 'material',
    aliases: ['яндекс детям', 'яндекс дети', 'детям'],
  },
  {
    id: 'telegram',
    name: 'Telegram Premium',
    icon: 'paper-plane',
    color: '#229ED9',
    iconFamily: 'ionicons',
    aliases: ['телеграм', 'телега', 'тг', 'tg'],
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    icon: 'youtube',
    color: '#FF0000',
    iconFamily: 'material',
    aliases: ['ютуб', 'ютюб', 'youtube', 'премиум ютуб'],
  },
  {
    id: 'tinder',
    name: 'Tinder',
    icon: 'fire',
    color: '#FD5068',
    iconFamily: 'material',
    aliases: ['тиндер'],
  },
  {
    id: 'boosty',
    name: 'Boosty',
    icon: 'coffee',
    color: '#FF5500',
    iconFamily: 'material',
    aliases: ['бусти', 'boosty', 'донат'],
  },
  {
    id: 'apple',
    name: 'Apple One',
    icon: 'logo-apple',
    color: '#000000',
    iconFamily: 'ionicons',
    aliases: ['эпл', 'apple one', 'apple tv', 'айклауд'],
  },
  {
    id: 'vkcombo',
    name: 'VK Combo',
    icon: 'account-star-outline',
    color: '#0077FF',
    iconFamily: 'material',
    aliases: ['вк комбо', 'vk combo'],
  },
  {
    id: 'other',
    name: 'Другое',
    icon: 'apps',
    color: '#64748B',
    iconFamily: 'material',
    aliases: ['other', 'custom'],
  },
]

// 🚀 ИСПРАВЛЕННАЯ ФУНКЦИЯ: Приоритетный поиск
export const getBrandData = (name: string): Brand => {
  const lower = name.toLowerCase().trim()

  // 1. Приоритет 1: Точное совпадение имени или ID (самый высокий приоритет)
  const exactMatch = KNOWN_BRANDS.find(
    (b) => b.name.toLowerCase() === lower || b.id === lower,
  )
  if (exactMatch) return exactMatch

  // 2. Приоритет 2: Точное совпадение с любым алиасом
  const exactAliasMatch = KNOWN_BRANDS.find((b) =>
    b.aliases?.some((alias) => alias.toLowerCase() === lower),
  )
  if (exactAliasMatch) return exactAliasMatch

  // 3. Приоритет 3: Частичное совпадение (если пользователь ввел "Яндекс плюс", а в базе "Яндекс.Плюс")
  // Теперь мы проверяем вхождение полного имени, а не только первого слова!
  const partialMatch = KNOWN_BRANDS.find(
    (b) =>
      lower.includes(b.name.toLowerCase()) ||
      lower.includes(b.id) ||
      b.aliases?.some((alias) => lower.includes(alias)),
  )
  if (partialMatch) return partialMatch

  // 4. Фоллбэк
  return {
    id: 'other',
    name: 'Другое',
    icon: 'apps',
    color: '#64748B',
    iconFamily: 'material',
  }
}

export const isDarkBrandColor = (hex: string): boolean => {
  const c = hex.replace('#', '')
  if (c.length !== 6) return false
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.35
}

export const getBrandIconColor = (
  brand: Brand,
  isDarkTheme: boolean,
): string => {
  if (isDarkTheme && isDarkBrandColor(brand.color)) return '#E2E8F0'
  return brand.color
}

export const getBrandBackground = (
  brand: Brand,
  isDarkTheme: boolean,
): string => {
  if (isDarkTheme && isDarkBrandColor(brand.color))
    return 'rgba(255,255,255,0.1)'
  return `${brand.color}15`
}
