import { Card, Typography } from "antd";
import styles from "./styles.module.scss";
import type { ReportCardViewModel } from "../model/types";

export function ReportCard({
  title,
  value,
  percentage,
  positive,
  description,
  Icon,
  tone,
}: ReportCardViewModel) {
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  return (
    <Card className={styles.card}>
      <div className={styles.cardWrapper}>
        <div className={`${styles.iconWrapper} ${styles[tone]}`}>
          <Icon className={styles.icon} />
        </div>
        <div className={styles.cardTextWrapper}>
          <Typography.Text className={styles.cardText}>{title}</Typography.Text>
          <Typography.Text className={styles.cardTextValue}>
            {formattedValue}
          </Typography.Text>
          <Typography.Text className={styles.cardTextPercentage}>
            {percentage !== undefined && positive !== undefined ? (
              <span className={positive ? styles.positive : styles.negative}>
                {positive ? "↑" : "↓"} {percentage}%
              </span>
            ) : null}{" "}
            <span className={styles.cardTextStartDate}>{description}</span>
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
}
