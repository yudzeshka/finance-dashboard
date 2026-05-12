import styles from "./styles.module.scss";

import dayjs from "dayjs";

import { DatePicker, Slider } from "antd";

import type { Dayjs } from "dayjs";

export type TopCategoryRowView = {
  id: string;
  name: string;
  icon: string;
  amountLabel: string;
  percent: number;
};

export type UIPropertyType = {
  targetDate: Date;
  onTargetDateChange: (date: Date | null) => void;
  rows: TopCategoryRowView[];
};

export const UI = ({
  targetDate,
  onTargetDateChange,
  rows,
}: UIPropertyType) => {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartTitleContainer}>
        <h4 className={styles.chartTitle}>Top Categories</h4>
        <DatePicker
          value={dayjs(targetDate)}
          onChange={(value: Dayjs | null) =>
            onTargetDateChange(value ? value.toDate() : null)
          }
          picker="month"
          variant="filled"
        />
      </div>
      <div className={styles.categoriesContainer}>
        {rows.map((row) => (
          <div key={row.id} className={styles.categoryItem}>
            <div className={styles.iconCircle} aria-hidden>
              <span className={styles.iconEmoji}>{row.icon}</span>
            </div>
            <div className={styles.categoryMain}>
              <div className={styles.categoryRowTop}>
                <span className={styles.categoryName} title={row.name}>
                  {row.name}
                </span>
                <span className={styles.categoryAmount}>{row.amountLabel}</span>
              </div>
              <div className={styles.categoryRowBar}>
                <Slider
                  className={styles.percentSlider}
                  min={0}
                  max={100}
                  value={row.percent}
                  disabled
                  tooltip={{ formatter: (v) => (v != null ? `${v}%` : "") }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
