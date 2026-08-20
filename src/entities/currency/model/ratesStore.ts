import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyRates } from "./types";

const MAX_RATE_AGE_MS = 12 * 60 * 60 * 1000; // 12h

type RatesState = {
  rates: CurrencyRates | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
  ensureRates: () => Promise<void>;
};

export const useCurrencyRatesStore = create<RatesState>()(
  persist(
    (set, get) => ({
      rates: null,
      fetchedAt: null,
      loading: false,
      error: null,

      fetchRates: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as {
            rates?: Record<string, number>;
          };
          const r = data.rates ?? {};
          set({
            rates: { USD: 1, RUB: r.RUB ?? 1, EUR: r.EUR ?? 1, BYN: r.BYN ?? 1 },
            fetchedAt: Date.now(),
            loading: false,
          });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      },

      ensureRates: async () => {
        const { rates, fetchedAt, loading } = get();
        const stale =
          !rates || !fetchedAt || Date.now() - fetchedAt > MAX_RATE_AGE_MS;
        if (stale && !loading) await get().fetchRates();
      },
    }),
    {
      name: "currency-rates",
      partialize: (s) => ({ rates: s.rates, fetchedAt: s.fetchedAt }),
    },
  ),
);
