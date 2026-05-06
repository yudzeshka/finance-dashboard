import { useTranslation } from "react-i18next";
import { AppShell } from "../../../widgets/app-shell/ui/AppShell";
import { TransactionsFiltersWidget } from "@/features/transaction/filters";
import { ReportCardWidget } from "@/widgets/reportCard";
import { ExpenseChart } from "@/widgets/expenseChart";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("reports")} subtitle={t("reportsSubtitle")}>
      <TransactionsFiltersWidget />
      <ReportCardWidget />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          height: "300px",
        }}
      >
        <ExpenseChart.Widget />
        <ExpenseChart.Widget />
      </div>
    </AppShell>
  );
}
