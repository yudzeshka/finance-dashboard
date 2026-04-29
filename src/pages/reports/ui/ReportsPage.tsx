import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { AppShell } from "../../../widgets/app-shell/ui/AppShell";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <AppShell
      title={t("reports")}
      subtitle={t("reportsSubtitle")}
    >
      <Card>
        <Typography.Title level={4}>Reports page</Typography.Title>
        <Typography.Text type="secondary">
          Here we will show financial reports.
        </Typography.Text>
      </Card>
    </AppShell>
  );
}