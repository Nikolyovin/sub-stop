// Форматирует число в красивую строку с пробелами и знаком рубля
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
};
