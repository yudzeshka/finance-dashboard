import { motion } from "framer-motion";
import type { TFunction } from "i18next";
import { IncomeVsExpenceChart } from "@/widgets/incomeVsExpenceChart";
import { CountUpValue } from "@/shared/ui/CountUpValue";
import { useMotionConfig } from "@/shared/lib/motion";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
import styles from "./ReportsHero.module.scss";

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  t: TFunction;
};

export function ReportsHeroView({ totalIncome, totalExpense, balance, t }: Props) {
  const config = useMotionConfig();
  const formatCurrency = useCurrencyFormatter();

  return (
    <motion.div
      className={`aurora-card--elevated ${styles.hero}`}
      initial={{ opacity: 0, y: config.heroEnterY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: config.heroEnterDuration,
        delay: config.heroEnterDelay,
        ease: config.easeOut as [number, number, number, number],
      }}
    >
      {/* Aurora orbs */}
      <motion.div
        className={`${styles.orb} ${styles.orb1}`}
        animate={
          config.prefersReduced
            ? {}
            : { x: [0, 20, -10, 0], y: [0, -15, 10, 0], opacity: [0.3, 0.5, 0.3] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className={`${styles.orb} ${styles.orb2}`}
        animate={
          config.prefersReduced
            ? {}
            : { x: [0, -15, 10, 0], y: [0, 10, -10, 0], opacity: [0.2, 0.4, 0.2] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration * 1.3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <h1
            className="aurora-font-display"
            style={{ fontSize: 32, fontWeight: 700, color: "var(--aurora-text)", margin: 0 }}
          >
            {t("reports")}
          </h1>
          <p
            className="aurora-font-body aurora-text-secondary"
            style={{ fontSize: 15, margin: "4px 0 24px" }}
          >
            {t("reportsOnYourTransactions")}
          </p>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("totalIncome")}</span>
              <CountUpValue
                value={totalIncome}
                format={formatCurrency}
                className={`aurora-font-display aurora-tabular aurora-text-success ${styles.summaryValue}`}
              />
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("totalExpense")}</span>
              <CountUpValue
                value={totalExpense}
                format={formatCurrency}
                className={`aurora-font-display aurora-tabular aurora-text-danger ${styles.summaryValue}`}
              />
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("balance")}</span>
              <span
                style={{
                  color: balance >= 0 ? "var(--aurora-accent)" : "var(--aurora-danger)",
                }}
              >
                <CountUpValue
                  value={balance}
                  format={formatCurrency}
                  className={`aurora-font-display aurora-tabular ${styles.summaryValue}`}
                />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className="aurora-card">
            <IncomeVsExpenceChart.Widget />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
