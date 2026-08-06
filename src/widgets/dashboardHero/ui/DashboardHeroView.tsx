import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, type FC } from "react";
import { Sparkline } from "./Sparkline";
import { useMotionConfig } from "@/shared/lib/motion";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
import styles from "./DashboardHero.module.scss";

type DashboardHeroViewProps = {
  balance: number;
  deltaPercent: number | null;
  sparklineData: number[];
  isPositive: boolean;
  t: (key: string) => string;
};

const CountUpBalance: FC<{
  value: number;
  duration: number;
  format: (v: number) => string;
}> = ({ value, duration, format }) => {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const display = useTransform(rounded, (v) => format(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, motionVal]);

  return <motion.span>{display}</motion.span>;
};

export function DashboardHeroView({
  balance,
  deltaPercent,
  sparklineData,
  isPositive,
  t,
}: DashboardHeroViewProps) {
  const config = useMotionConfig();
  const formatCurrency = useCurrencyFormatter();

  const sparklineColor =
    sparklineData.length >= 2
      ? sparklineData[sparklineData.length - 1] >= sparklineData[0]
        ? "#0E9F6E"
        : "#E0457B"
      : "#7C3AED";

  const sparklineAriaLabel =
    sparklineData.length >= 2
      ? sparklineData[sparklineData.length - 1] >= sparklineData[0]
        ? `Balance trend: up over last 30 days`
        : `Balance trend: down over last 30 days`
      : "Balance trend: no data";

  const deltaLabel =
    deltaPercent !== null
      ? deltaPercent >= 0
        ? `↑ ${deltaPercent.toFixed(1)}% ${t("vsPreviousPeriod")}`
        : `↓ ${Math.abs(deltaPercent).toFixed(1)}% ${t("vsPreviousPeriod")}`
      : null;

  const deltaClass =
    deltaPercent === null
      ? styles["heroDelta--neutral"]
      : deltaPercent >= 0
        ? styles["heroDelta--positive"]
        : styles["heroDelta--negative"];

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
            : { x: [-10, 10, -10], y: [-10, 10, -10], opacity: [0.5, 0.7, 0.5] }
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
            : { x: [10, -10, 10], y: [10, -10, 10], opacity: [0.4, 0.6, 0.4] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration * 1.3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className={styles.heroContent}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroEyebrow}>
              {t("currentBalance")}
            </div>
            <div className={styles.heroBalance}>
              <span className={styles.heroBalanceSymbol}>
                {isPositive ? "+" : "−"}
              </span>
              <CountUpBalance
                value={Math.abs(balance)}
                duration={config.countUpDuration}
                format={formatCurrency}
              />
            </div>
            {deltaLabel && (
              <motion.div
                className={`${styles.heroDelta} ${deltaClass}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: config.deltaDelay, duration: config.prefersReduced ? 0 : 0.3 }}
                aria-label={`${deltaPercent! >= 0 ? t("trendUp") : t("trendDown")}: ${Math.abs(deltaPercent!).toFixed(1)}%`}
              >
                {deltaPercent! >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(deltaPercent!).toFixed(1)}%{" "}
                {t("last30Days")}
              </motion.div>
            )}
          </div>
          <div className={styles.heroSparkline}>
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              width={200}
              height={64}
              ariaLabel={sparklineAriaLabel}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
