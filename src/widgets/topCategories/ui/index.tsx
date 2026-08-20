import styles from "./styles.module.scss";
import dayjs from "dayjs";
import { DatePicker, Slider } from "antd";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import { TopCategoriesSkeleton } from "./TopCategoriesSkeleton";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

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
  loading: boolean;
};

export const UI = ({
  targetDate,
  onTargetDateChange,
  rows,
  loading,
}: UIPropertyType) => {
  const { t } = useTranslation();
  return (
    <>
      {loading ? (
        <div className={styles.chartContainer}>
          <TopCategoriesSkeleton />
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <div className={styles.chartTitleContainer}>
            <h4 className={styles.chartTitle}>{t("topCategories")}</h4>
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
                  <CategoryIcon icon={row.icon} size={22} />
                </div>
                <div className={styles.categoryMain}>
                  <div className={styles.categoryRowTop}>
                    <span className={styles.categoryName} title={row.name}>
                      {row.name}
                    </span>
                    <span className={styles.categoryAmount}>
                      {row.amountLabel}
                    </span>
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
      )}
    </>
  );
};
