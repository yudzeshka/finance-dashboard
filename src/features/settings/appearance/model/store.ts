import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";
import type { Language, Currency } from "@/entities/settings/model/types";

interface AppearanceState {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      language: (i18n.language as Language) ?? "en",
      currency: "USD",
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "appearance-settings",
    },
  ),
);
