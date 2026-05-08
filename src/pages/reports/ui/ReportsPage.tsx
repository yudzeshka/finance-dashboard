import { useTranslation } from "react-i18next";
import { AppShell } from "../../../widgets/app-shell/ui/AppShell";
import { TransactionsFiltersWidget } from "@/features/transaction/filters";
import { ReportCardWidget } from "@/widgets/reportCard";
import { ExpenseChart } from "@/widgets/expenseChart";
import { IncomeVsExpenceChart } from "@/widgets/incomeVsExpenceChart";
import { MountlyExpenseChart } from "@/widgets/mountlyExpenseChart";
import styles from "./ReportsPage.module.scss";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("reports")} subtitle={t("reportsSubtitle")}>
      <div className={styles.page}>
        <TransactionsFiltersWidget />
        <ReportCardWidget />

        <div className={styles.chartsArea}>
          <div className={styles.chartsRow}>
            <IncomeVsExpenceChart.Widget />
            <ExpenseChart.Widget />
          </div>

          <div className={styles.monthlyGridRow}>
            <MountlyExpenseChart.Widget />
            <div className={`dashboard-card ${styles.quarterBlock}`} />
            <div className={`dashboard-card ${styles.quarterBlock}`} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
