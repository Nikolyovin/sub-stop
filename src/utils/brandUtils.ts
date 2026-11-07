export interface Brand {
  id: string;
  name: string;
  icon: string;
  color: string;
  iconFamily?: "ionicons" | "material";
  aliases?: string[]; // 🚀 Новое поле для поиска
}

export const KNOWN_BRANDS: Brand[] = [
  {
    id: "yandex",
    name: "Яндекс.Плюс",
    icon: "alpha-y-box",
    color: "#FC3F1D",
    iconFamily: "material",
    aliases: ["яндекс", "плюс", "яндекс плюс"],
  },
  {
    id: "sberprime",
    name: "СберПрайм",
    icon: "credit-card-outline",
    color: "#21A038",
    iconFamily: "material",
    aliases: ["сбер", "сбербанк", "прайм"],
  },
  {
    id: "mts",
    name: "МТС Premium",
    icon: "cellphone",
    color: "#E30611",
    iconFamily: "material",
    aliases: ["мтс", "мтс премиум"],
  },
  {
    id: "tbank",
    name: "Т-Банк Pro",
    icon: "card-outline",
    color: "#FFDD2D",
    iconFamily: "ionicons",
    aliases: ["тбанк", "т-банк", "тинькофф", "тинек"],
  },
  {
    id: "t2",
    name: "Т2",
    icon: "cellphone",
    color: "#000000",
    iconFamily: "material",
    aliases: ["теле2", "т2", "tele2"],
  },
  {
    id: "vtb",
    name: "ВТБ Плюс",
    icon: "credit-card-outline",
    color: "#0033A0",
    iconFamily: "material",
    aliases: ["втб", "втб плюс"],
  },
  {
    id: "alfa",
    name: "Альфа-Смарт",
    icon: "credit-card-outline",
    color: "#EF3124",
    iconFamily: "material",
    aliases: ["альфа", "альфабанк", "альфа смарт"],
  },
  {
    id: "gazprom",
    name: "Газпромбанк Прайм",
    icon: "credit-card-outline",
    color: "#0055A5",
    iconFamily: "material",
    aliases: ["газпром", "гпб", "газпромбанк"],
  },
  {
    id: "x5",
    name: "X5 Пакет",
    icon: "cart-outline",
    color: "#5CB85C",
    iconFamily: "ionicons",
    aliases: ["х5", "пятерочка", "перекресток", "x5 пакет"],
  },
  {
    id: "wildberries",
    name: "Wildberries",
    icon: "cart-outline",
    color: "#CB11AB",
    iconFamily: "ionicons",
    aliases: ["вайлдберриз", "вб", "wb"],
  },
  {
    id: "kinopoisk",
    name: "Кинопоиск",
    icon: "movie-open",
    color: "#FF5500",
    iconFamily: "material",
    aliases: ["кино", "кинопоиск", "кп"],
  },
  {
    id: "okko",
    name: "Okko",
    icon: "movie-open",
    color: "#EA3E8E",
    iconFamily: "material",
    aliases: ["окко"],
  },
  {
    id: "ivi",
    name: "IVI",
    icon: "play-circle",
    color: "#EA1D2C",
    iconFamily: "material",
    aliases: ["иви"],
  },
  {
    id: "wink",
    name: "Wink",
    icon: "play-circle",
    color: "#FF4F12",
    iconFamily: "material",
    aliases: ["винк", "ростелеком"],
  },
  {
    id: "kion",
    name: "KION",
    icon: "play-circle",
    color: "#FFCC00",
    iconFamily: "material",
    aliases: ["кион", "мтс кино"],
  },
  {
    id: "premier",
    name: "Premier",
    icon: "play-circle",
    color: "#FF0000",
    iconFamily: "material",
    aliases: ["премьер"],
  },
  {
    id: "start",
    name: "START",
    icon: "play-circle",
    color: "#1E90FF",
    iconFamily: "material",
    aliases: ["старт"],
  },
  {
    id: "amediateka",
    name: "Amediateka",
    icon: "play-circle",
    color: "#8A2BE2",
    iconFamily: "material",
    aliases: ["амедиатека"],
  },
  {
    id: "vk",
    name: "VK Музыка",
    icon: "logo-vk",
    color: "#0077FF",
    iconFamily: "ionicons",
    aliases: ["вк", "вконтакте", "вк музыка", "vk"],
  },
  {
    id: "zvuk",
    name: "Zvuk",
    icon: "music",
    color: "#FF007F",
    iconFamily: "material",
    aliases: ["звук", "zvuk"],
  },
  {
    id: "litres",
    name: "Литрес",
    icon: "book-open-variant",
    color: "#FF6B00",
    iconFamily: "material",
    aliases: ["литрес", "litres"],
  },
  {
    id: "mybook",
    name: "MyBook",
    icon: "book-open-page-variant",
    color: "#00AEEF",
    iconFamily: "material",
    aliases: ["майбук", "mybook"],
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "paper-plane",
    color: "#229ED9",
    iconFamily: "ionicons",
    aliases: ["телеграм", "телега", "тг", "tg", "premium"],
  },
  {
    id: "netflix",
    name: "Netflix",
    icon: "netflix",
    color: "#E50914",
    iconFamily: "material",
    aliases: ["нетфликс"],
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "spotify",
    color: "#1DB954",
    iconFamily: "material",
    aliases: ["спотифай", "спотифаи"],
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    icon: "youtube",
    color: "#FF0000",
    iconFamily: "material",
    aliases: ["ютуб", "ютюб", "youtube", "премиум"],
  },
  {
    id: "steam",
    name: "Steam",
    icon: "steam",
    color: "#171A21",
    iconFamily: "material",
    aliases: ["стим"],
  },
  {
    id: "zoom",
    name: "Zoom",
    icon: "video",
    color: "#2D8CFF",
    iconFamily: "material",
    aliases: ["зум"],
  },
  {
    id: "trello",
    name: "Trello",
    icon: "view-column",
    color: "#0079BF",
    iconFamily: "material",
    aliases: ["трелло"],
  },
  {
    id: "tinder",
    name: "Tinder",
    icon: "fire",
    color: "#FD5068",
    iconFamily: "material",
    aliases: ["тиндер"],
  },
  {
    id: "apple",
    name: "Apple",
    icon: "logo-apple",
    color: "#000000",
    iconFamily: "ionicons",
    aliases: ["эпл", "apple music", "apple tv", "icloud", "айклауд"],
  },
  {
    id: "other",
    name: "Другое",
    icon: "apps",
    color: "#64748B",
    iconFamily: "material",
    aliases: ["other", "custom"],
  },
  {
    id: "rutube",
    name: "RuTube",
    icon: "play-box-multiple",
    color: "#000000",
    iconFamily: "material",
    aliases: ["рутуб", "ру тьюб"],
  },
  {
    id: "vkvideo",
    name: "VK Видео",
    icon: "video",
    color: "#0077FF",
    iconFamily: "material",
    aliases: ["вк видео", "вк видео"],
  },
  {
    id: "yandexkids",
    name: "Яндекс Дети",
    icon: "teddy-bear",
    color: "#FFCC00",
    iconFamily: "material",
    aliases: ["яндекс детям", "яндекс дети", "детям"],
  },

  // --- ОБЛАКА И СОФТ ---
  {
    id: "yandex360",
    name: "Яндекс 360",
    icon: "cloud-outline",
    color: "#FC3F1D",
    iconFamily: "ionicons",
    aliases: ["яндекс диск", "яндекс 360", "диск", "яндекс почта"],
  },
  {
    id: "googleone",
    name: "Google One",
    icon: "google-drive",
    color: "#4285F4",
    iconFamily: "material",
    aliases: ["гугл ван", "гугл диск", "google"],
  },
  {
    id: "microsoft365",
    name: "Microsoft 365",
    icon: "microsoft-office",
    color: "#D83B01",
    iconFamily: "material",
    aliases: ["майкрософт", "офис", "microsoft", "office"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    icon: "robot-outline",
    color: "#10A37F",
    iconFamily: "material",
    aliases: ["чатгпт", "чат жпт", "openai", "gpt"],
  },

  // --- ИГРЫ ---
  {
    id: "xbox",
    name: "Xbox Game Pass",
    icon: "microsoft-xbox",
    color: "#107C10",
    iconFamily: "material",
    aliases: ["иксбокс", "геймпасс", "xbox"],
  },
  {
    id: "playstation",
    name: "PlayStation Plus",
    icon: "sony-playstation",
    color: "#003791",
    iconFamily: "material",
    aliases: ["плейстейшн", "пс плюс", "ps plus", "ps"],
  },
  {
    id: "vkplay",
    name: "VK Play",
    icon: "gamepad-variant",
    color: "#0077FF",
    iconFamily: "material",
    aliases: ["вк плей", "вк игры"],
  },

  // --- ДОСТАВКА И МАРКЕТПЛЕЙСЫ ---
  {
    id: "ozon",
    name: "Ozon Premium",
    icon: "shopping-outline",
    color: "#005BFF",
    iconFamily: "material",
    aliases: ["озон", "озон премиум"],
  },
  {
    id: "samokat",
    name: "Самокат",
    icon: "bike",
    color: "#FF3300",
    iconFamily: "material",
    aliases: ["самокат", "доставка самокат"],
  },
  {
    id: "yandexlavka",
    name: "Яндекс Лавка",
    icon: "basket-outline",
    color: "#FFCC00",
    iconFamily: "ionicons",
    aliases: ["лавка", "яндекс лавка", "яндекс еда"],
  },

  // --- ОБУЧЕНИЕ И КНИГИ ---
  {
    id: "skysmart",
    name: "Skysmart",
    icon: "school",
    color: "#FF4F12",
    iconFamily: "material",
    aliases: ["скайсмарт", "скулмарт", "skysmart"],
  },
  {
    id: "uchi",
    name: "Учи.ру",
    icon: "pencil-box",
    color: "#8A2BE2",
    iconFamily: "material",
    aliases: ["учи ру", "учи.ру"],
  },
  {
    id: "duolingo",
    name: "Duolingo",
    icon: "owl",
    color: "#58CC02",
    iconFamily: "material",
    aliases: ["дуолинго", "дуо"],
  },
  {
    id: "yandexmusic",
    name: "Яндекс Музыка",
    icon: "music-circle-outline",
    color: "#FFCC00",
    iconFamily: "ionicons",
    aliases: ["яндекс музыка", "яндексмузыка", "ямузыка", "yandex music"],
  },
  {
    id: "applemusic",
    name: "Apple Music",
    icon: "logo-apple",
    color: "#FA243C",
    iconFamily: "ionicons",
    aliases: ["эпл мьюзик", "apple music", "музыка эпл"],
  },
  {
    id: "vkcombo",
    name: "VK Combo",
    icon: "account-star-outline",
    color: "#0077FF",
    iconFamily: "material",
    aliases: ["вк комбо", "vk combo", "вк комбо подписка"],
  },

  // --- КИНО И СТРИМИНГ ---
  {
    id: "disney",
    name: "Disney+",
    icon: "movie-open-star",
    color: "#113CCF",
    iconFamily: "material",
    aliases: ["дисней", "disney", "дисней плюс"],
  },
  {
    id: "hbo",
    name: "HBO Max",
    icon: "television-classic",
    color: "#5B0E8A",
    iconFamily: "material",
    aliases: ["хбо", "hbo", "хбо макс"],
  },
  {
    id: "amazon",
    name: "Amazon Prime",
    icon: "amazon",
    color: "#FF9900",
    iconFamily: "material",
    aliases: ["амазон", "amazon", "амазон прайм"],
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "twitch",
    color: "#9146FF",
    iconFamily: "material",
    aliases: ["твич", "твитч", "twitch"],
  },

  // --- РАБОТА И ПРОДУКТИВНОСТЬ ---
  {
    id: "notion",
    name: "Notion",
    icon: "notebook-outline",
    color: "#000000",
    iconFamily: "material",
    aliases: ["ноушен", "notion", "нотион"],
  },
  {
    id: "slack",
    name: "Slack",
    icon: "slack",
    color: "#4A154B",
    iconFamily: "material",
    aliases: ["слак", "slack"],
  },

  // --- ДИЗАЙН ---
  {
    id: "figma",
    name: "Figma",
    icon: "vector-square",
    color: "#F24E1E",
    iconFamily: "material",
    aliases: ["фигма", "figma"],
  },
  {
    id: "canva",
    name: "Canva Pro",
    icon: "palette-outline",
    color: "#00C4CC",
    iconFamily: "material",
    aliases: ["канва", "canva", "канва про"],
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    icon: "alpha-a-box",
    color: "#FF0000",
    iconFamily: "material",
    aliases: ["адоб", "adobe", "фотошоп", "photoshop", "иллюстратор"],
  },

  // --- ТАКСИ И ДОСТАВКА ---
  {
    id: "yandexgo",
    name: "Яндекс Go Plus",
    icon: "taxi",
    color: "#FFCC00",
    iconFamily: "material",
    aliases: ["яндекс го", "яндекс такси", "такси", "yandex go"],
  },

  // --- КНИГИ ---
  {
    id: "bookmate",
    name: "Bookmate",
    icon: "book-open-variant",
    color: "#EF3E42",
    iconFamily: "material",
    aliases: ["букмейт", "bookmate"],
  },
];

export const getBrandData = (name: string): Brand => {
  const lower = name.toLowerCase();
  const found = KNOWN_BRANDS.find(
    (b) =>
      lower.includes(b.id) ||
      lower.includes(b.name.toLowerCase().split(" ")[0]) ||
      // 🚀 Ищем совпадения по синонимам
      b.aliases?.some((alias) => lower.includes(alias)),
  );
  if (found) return found;
  return {
    id: "other",
    name: "Другое",
    icon: "apps",
    color: "#64748B",
    iconFamily: "material",
  };
};

export const isDarkBrandColor = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.35;
};

export const getBrandIconColor = (
  brand: Brand,
  isDarkTheme: boolean,
): string => {
  if (isDarkTheme && isDarkBrandColor(brand.color)) {
    return "#E2E8F0";
  }
  return brand.color;
};

export const getBrandBackground = (
  brand: Brand,
  isDarkTheme: boolean,
): string => {
  if (isDarkTheme && isDarkBrandColor(brand.color)) {
    return "rgba(255,255,255,0.1)";
  }
  return `${brand.color}15`;
};
