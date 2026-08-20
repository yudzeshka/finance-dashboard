import type { Currency } from "@/entities/settings";
import type { CurrencyRates } from "./types";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  RUB: "₽",
  EUR: "€",
  BYN: "Br",
};

export function currencySymbol(code: Currency): string {
  return CURRENCY_SYMBOLS[code];
}

export function getRate(
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (!rates) return 1;
  return rates[currency] ?? 1;
}

export function usdToDisplay(
  usd: number,
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (currency === "USD") return usd;
  return usd * getRate(currency, rates);
}

export function displayToUsd(
  amount: number,
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (currency === "USD") return amount;
  const rate = getRate(currency, rates);
  if (!Number.isFinite(rate) || rate <= 0) return amount;
  return Math.round((amount / rate) * 100) / 100;
}
