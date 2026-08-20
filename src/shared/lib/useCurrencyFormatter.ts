import { useAppearanceStore } from "@/features/settings/appearance";
import { formatAmount, useCurrencyRatesStore } from "@/entities/currency";

export function useCurrencyFormatter(): (value: number) => string {
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  return (value: number) => formatAmount(value, currency, rates);
}
