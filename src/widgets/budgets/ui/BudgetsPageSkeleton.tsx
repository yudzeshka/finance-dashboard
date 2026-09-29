import { useTranslation } from "react-i18next";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";

import styles from "./BudgetsPageSkeleton.module.scss";

export function BudgetsPageSkeleton() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("budgets")} subtitle={t("budgetsSubtitle")}>
      <div className={styles.list}>
        <div className={styles.summary}>
          <div className={styles.summaryLeft}>
            <div className={styles.shimmerLine} style={{ width: 120, height: 12 }} />
            <div className={styles.shimmerLine} style={{ width: 180, height: 28 }} />
            <div className={styles.shimmerLine} style={{ width: 100, height: 12 }} />
          </div>
          <div className={styles.summaryBody}>
            <div className={styles.shimmerLine} style={{ width: "100%", height: 8, borderRadius: 999 }} />
            <div className={styles.shimmerLine} style={{ width: 160, height: 24, borderRadius: 8 }} />
          </div>
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.row}>
            <div
              className={styles.shimmerLine}
              style={{ width: 40, height: 40, borderRadius: 12 }}
            />
            <div className={styles.rowMain}>
              <div className={styles.shimmerLine} style={{ width: "40%", height: 14 }} />
              <div
                className={styles.shimmerLine}
                style={{ width: "100%", height: 8, borderRadius: 999 }}
              />
            </div>
            <div className={styles.shimmerLine} style={{ width: 90, height: 16 }} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
