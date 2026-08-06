import { useTranslation } from "react-i18next";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { SettingsWidget } from "@/widgets/settings";

export function SettingsPageView() {
  const { t } = useTranslation();
  return (
    <AppShell title={t("settingsTitle")} subtitle={t("settingsSubtitle")}>
      <SettingsWidget.Widget />
    </AppShell>
  );
}
