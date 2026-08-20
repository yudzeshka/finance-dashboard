import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useAppearanceStore } from "@/features/settings/appearance";
import { useSecurity } from "@/features/settings/security";
import { useDataManagement } from "@/features/settings/data";
import { useCurrencyRatesStore } from "@/entities/currency";
import type { SettingsContainerProps } from "../ui";

export function useSettingsContainer(): SettingsContainerProps {
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } = useAppearanceStore();
  const { resettingPassword, passwordError, resetPassword } = useSecurity();
  const { exporting, clearing, exportToCsv, clearAllData } = useDataManagement();
  const rates = useCurrencyRatesStore((s) => s.rates);
  const ratesFetchedAt = useCurrencyRatesStore((s) => s.fetchedAt);
  const ratesHint =
    currency !== "USD" && rates && ratesFetchedAt
      ? t("ratesUpdatedOn", { date: dayjs(ratesFetchedAt).format("DD.MM.YYYY") })
      : null;

  return {
    language,
    currency,
    onLanguageChange: setLanguage,
    onCurrencyChange: setCurrency,
    resettingPassword,
    passwordError,
    onResetPassword: resetPassword,
    exporting,
    clearing,
    onExportCsv: exportToCsv,
    onClearAllData: clearAllData,
    ratesHint,
    t,
  };
}
