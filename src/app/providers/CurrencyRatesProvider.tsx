import { useEffect, type ReactNode } from "react";
import { useCurrencyRatesStore } from "@/entities/currency";

export function CurrencyRatesProvider({ children }: { children: ReactNode }) {
  const ensureRates = useCurrencyRatesStore((s) => s.ensureRates);

  useEffect(() => {
    ensureRates();
    window.addEventListener("online", ensureRates);
    return () => window.removeEventListener("online", ensureRates);
  }, [ensureRates]);

  return <>{children}</>;
}
