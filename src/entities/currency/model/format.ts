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

/**
 * Rounds a display-currency value to at most 2 decimal places and returns a
 * plain string, dropping a trailing ".00" for whole numbers
 * (e.g. 1234.567 -> "1234.57", 85 -> "85").
 */
export function formatAmountNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}
