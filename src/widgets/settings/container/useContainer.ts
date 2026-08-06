import { useTranslation } from "react-i18next";
import { useAppearanceStore } from "@/features/settings/appearance";
import { useSecurity } from "@/features/settings/security";
import { useDataManagement } from "@/features/settings/data";
import type { SettingsContainerProps } from "../ui";

export function useSettingsContainer(): SettingsContainerProps {
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } = useAppearanceStore();
  const { resettingPassword, passwordError, resetPassword } = useSecurity();
  const { exporting, clearing, exportToCsv, clearAllData } = useDataManagement();

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
    t,
  };
}
