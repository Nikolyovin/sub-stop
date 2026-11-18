export const formatPrice = (amount: number): string => {
  // 🚀 Округляем до целых, чтобы не было копеек
  const rounded = Math.round(amount);
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      rounded,
    ) + " ₽"
  );
};
