import type { Currency } from "@/entities/settings";

/** Курс «1 USD в валюте X» (USD = 1). */
export type CurrencyRates = Record<Currency, number>;
