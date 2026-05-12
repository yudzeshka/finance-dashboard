import { useTranslation } from "react-i18next";
import { AppShell } from "../../../widgets/app-shell/ui/AppShell";
import { TransactionsFiltersWidget } from "@/features/transaction/filters";
import { ReportCardWidget } from "@/widgets/reportCard";
import { ExpenseChart } from "@/widgets/expenseChart";
import { IncomeVsExpenceChart } from "@/widgets/incomeVsExpenceChart";
import { MountlyExpenseChart } from "@/widgets/mountlyExpenseChart";
import styles from "./ReportsPage.module.scss";
import { TopCategories } from "@/widgets/topCategories";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("reports")} subtitle={t("reportsSubtitle")}>
      <div className={styles.page}>
        <TransactionsFiltersWidget />
        <ReportCardWidget />

        <div className={styles.chartsArea}>
          <div className={styles.chartsGrid}>
            <div className={styles.cellSpan2}>
              <IncomeVsExpenceChart.Widget />
            </div>
            <div className={styles.cellSpan2}>
              <ExpenseChart.Widget />
            </div>
            <div className={styles.cellSpan2}>
              <MountlyExpenseChart.Widget />
            </div>
            <div className={styles.cellSpan1}>
              <TopCategories.Widget />
            </div>
            <div
              className={`${styles.cellSpan1} dashboard-card ${styles.quarterBlock}`}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
