import { motion } from "framer-motion";
import {
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { CountUpValue } from "@/shared/ui/CountUpValue";
import { useMotionConfig } from "@/shared/lib/motion";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
import type { ReportCardViewModel } from "../model/types";
import styles from "./styles.module.scss";

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function ReportCard({
  title,
  value,
  percentage,
  positive,
  description,
  Icon,
  tone,
  id,
}: ReportCardViewModel) {
  const { springSnappy, prefersReduced } = useMotionConfig();
  const formatCurrency = useCurrencyFormatter();

  const isPercentage = id === "savingsRate";
  const formatFn = isPercentage ? formatPercent : formatCurrency;

  const valueColorClass =
    tone === "green" ? "aurora-text-success" :
    tone === "red" ? "aurora-text-danger" :
    tone === "purple" ? "" : // default accent
    "aurora-text-secondary"; // neutral

  return (
    <motion.div
      className={`aurora-card--insight ${styles.card}`}
      whileHover={prefersReduced ? {} : { y: -2 }}
      transition={springSnappy}
    >
      <div className={styles.cardInner}>
        <div className={`${styles.iconWrapper} ${styles[tone]}`}>
          <Icon className={styles.icon} />
        </div>

        <div className={styles.label}>{title}</div>

        <CountUpValue
          value={value}
          format={formatFn}
          className={`aurora-font-display aurora-tabular ${styles.value} ${
            valueColorClass !== "" ? valueColorClass : ""
          }`}
        />

        <div className={styles.footer}>
          {percentage !== undefined && positive !== undefined ? (
            <span className={positive ? styles.deltaPositive : styles.deltaNegative}>
              {positive ? <CaretUpOutlined /> : <CaretDownOutlined />}{" "}
              {percentage}%
            </span>
          ) : null}
          <span className={styles.description}>
            {percentage !== undefined && positive !== undefined ? " " : ""}
            {description}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
