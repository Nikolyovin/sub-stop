export type Category =
  | "entertainment"
  | "music"
  | "software"
  | "sport"
  | "education"
  | "health"
  | "food"
  | "games"
  | "other";

export type SubscriptionStatus = "active" | "trial";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  nextPaymentDate: string;
  category: Category;
  status: SubscriptionStatus;
  note?: string; // <-- ДОБАВИЛИ
}

// Справочник категорий для UI
export const CATEGORIES = [
  {
    id: "entertainment",
    label: "Кино",
    icon: "film-outline",
    color: "#EF4444",
  },
  {
    id: "music",
    label: "Музыка",
    icon: "musical-notes-outline",
    color: "#8B5CF6",
  },
  { id: "software", label: "Софт", icon: "laptop-outline", color: "#3B82F6" },
  { id: "sport", label: "Спорт", icon: "fitness-outline", color: "#10B981" },
  {
    id: "education",
    label: "Обучение",
    icon: "school-outline",
    color: "#F59E0B",
  }, // <-- Новое
  { id: "health", label: "Здоровье", icon: "heart-outline", color: "#EC4899" }, // <-- Новое
  {
    id: "food",
    label: "Доставка",
    icon: "fast-food-outline",
    color: "#F97316",
  }, // <-- Новое
  {
    id: "games",
    label: "Игры",
    icon: "game-controller-outline",
    color: "#6366F1",
  }, // <-- Новое
  { id: "other", label: "Другое", icon: "apps-outline", color: "#64748B" },
] as const;
