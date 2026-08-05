import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { ExclamationCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { TransactionsFiltersWidget } from "@/features/transaction/filters";
import { ReportCardWidget } from "@/widgets/reportCard";
import { ExpenseChart } from "@/widgets/expenseChart";
import { MountlyExpenseChart } from "@/widgets/mountlyExpenseChart";
import { ReportsHero } from "@/widgets/reportsHero";
import { ReportsLists } from "@/widgets/reportsLists";
import { useReportsData } from "@/features/transaction/manage/model/useReportsData";
import { useMotionConfig } from "@/shared/lib/motion";
import { ReportsPageSkeleton } from "./ReportsPageSkeleton";
import styles from "./ReportsPage.module.scss";

export function ReportsPage() {
  const { t } = useTranslation();
  const { loading, error, refetch, isEmpty } = useReportsData();
  const config = useMotionConfig();

  if (loading) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <ReportsPageSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <div className="aurora-surface" style={{ padding: 0 }}>
          <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
            <ExclamationCircleOutlined
              style={{
                fontSize: 48,
                color: "var(--aurora-text-secondary)",
                opacity: 0.6,
                marginBottom: 16,
              }}
            />
            <div
              className="aurora-font-body"
              style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginBottom: 8 }}
            >
              {t("loadingError")}
            </div>
            <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
              {String(error)}
            </div>
            <Button type="primary" onClick={() => refetch()}>
              {t("retry")}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (isEmpty) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <div className="aurora-surface" style={{ padding: 0 }}>
          <div className="aurora-card">
            <div className="aurora-empty-state">
              <InboxOutlined className="aurora-empty-state__icon" />
              <div className="aurora-empty-state__title">{t("reportsNoData")}</div>
              <p className="aurora-text-secondary" style={{ fontSize: 14 }}>
                {t("reportsNoDataHint")}
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
      <motion.div
        className="aurora-surface"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: config.staggerChildren, delayChildren: config.delayChildren } },
        }}
      >
        {/* Filters */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <div className="aurora-card" style={{ padding: "12px 16px" }}>
            <TransactionsFiltersWidget />
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportsHero.Widget />
        </motion.div>

        {/* KPI */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportCardWidget />
        </motion.div>

        {/* Bento 2×2 */}
        <motion.div
          className={styles.bentoGrid}
          variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}
        >
          <motion.div
            initial={config.scrollRevealHidden}
            whileInView={config.scrollRevealVisible}
            viewport={config.scrollRevealViewport}
            transition={{ duration: config.scrollRevealDuration, ease: config.easeOut as [number, number, number, number] }}
          >
            <ExpenseChart.Widget />
          </motion.div>
          <motion.div
            initial={config.scrollRevealHidden}
            whileInView={config.scrollRevealVisible}
            viewport={config.scrollRevealViewport}
            transition={{ duration: config.scrollRevealDuration, ease: config.easeOut as [number, number, number, number] }}
          >
            <MountlyExpenseChart.Widget />
          </motion.div>
        </motion.div>

        {/* Lists */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportsLists.Widget />
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
