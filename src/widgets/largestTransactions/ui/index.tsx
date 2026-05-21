import type { Transaction } from "@/entities/transaction";
import styles from "./styles.module.scss";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { LargestTransactionsSkeleton } from "./LargestTransactionsSkeleton";

export type UIPropertyType = {
  rows: Transaction[];
  loading: boolean;
};

export const UI = ({ rows, loading }: UIPropertyType) => {
  const { t } = useTranslation();
  return (
    <>
      {loading ? (
        <div className={styles.chartContainer}>
          <LargestTransactionsSkeleton />
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <div className={styles.chartTitleContainer}>
            <h4 className={styles.chartTitle}>{t("largestTransactions")}</h4>
          </div>
          <div className={styles.categoriesContainer}>
            {rows.map((row) => (
              <div key={row.id} className={styles.categoryItem}>
                <div className={styles.iconCircle} aria-hidden>
                  <span className={styles.iconEmoji}>{row.category.icon}</span>
                </div>
                <div className={styles.categoryMain}>
                  <div className={styles.categoryRowTop}>
                    <div className={styles.transactionInfo}>
                      <span
                        className={styles.categoryName}
                        title={row.description}
                      >
                        {row.description}
                      </span>
                      <span
                        className={styles.transactionDate}
                        title={dayjs(row.date).format("MMMM DD, YYYY")}
                      >
                        {dayjs(row.date).format("MMMM DD, YYYY")}
                      </span>
                    </div>

                    <span
                      style={{
                        color: row.type === "EXPENSE" ? "red" : "green",
                      }}
                      className={styles.categoryAmount}
                    >
                      ${row.amount}
                    </span>
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
