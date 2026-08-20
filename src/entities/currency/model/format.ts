import type { Currency } from "@/entities/settings";
import type { CurrencyRates } from "./types";
import { usdToDisplay } from "./convert";

export function formatAmount(
  valueUsd: number,
  currency: Currency,
  rates: CurrencyRates | null,
): string {
  const display = usdToDisplay(valueUsd, currency, rates);
  const locale = currency === "RUB" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "RUB" ? 0 : 2,
    maximumFractionDigits: currency === "RUB" ? 0 : 2,
  }).format(display);
}
