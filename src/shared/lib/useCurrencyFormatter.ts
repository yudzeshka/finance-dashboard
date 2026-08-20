import { useAppearanceStore } from "@/features/settings/appearance";

export function useCurrencyFormatter(): (value: number) => string {
  const currency = useAppearanceStore((s) => s.currency);
  return (value: number) => {
    const locale = currency === "RUB" ? "ru-RU" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "RUB" ? 0 : 2,
      maximumFractionDigits: currency === "RUB" ? 0 : 2,
    }).format(value);
  };
}
