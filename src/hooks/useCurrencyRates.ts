import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

export const useCurrencyRates = () => {
  const { lastRateUpdate, setRates } = useSettingsStore();

  useEffect(() => {
    const fetchRates = async () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Если обновляли меньше суток назад, ничего не делаем
      if (now - lastRateUpdate < oneDay) return;

      try {
        console.log("🔄 Запрашиваем курсы валют...");
        const response = await fetch(
          "https://www.cbr-xml-daily.ru/daily_json.js",
        );
        const data = await response.json();

        const usd = data.Valute.USD.Value;
        const eur = data.Valute.EUR.Value;

        setRates(usd, eur);
        console.log("✅ Курсы обновлены:", { USD: usd, EUR: eur });
      } catch (error) {
        console.error("❌ Ошибка загрузки курсов валют:", error);
      }
    };

    fetchRates();
  }, [lastRateUpdate, setRates]);
};
