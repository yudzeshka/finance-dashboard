import { Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

import { getCategoryLabel } from "@/entities/category";
import type { Budget, BudgetProgress } from "@/entities/budget";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

import styles from "./BudgetsView.module.scss";

type BudgetsViewProps = {
  progress: BudgetProgress[];
  format: (usd: number) => string;
  deleteLoading: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
};

function barClass(status: BudgetProgress["status"]): string {
  if (status === "danger") return styles.barFillDanger;
  if (status === "warning") return styles.barFillWarning;
  return styles.barFillOk;
}

function pillClass(status: BudgetProgress["status"]): string {
  if (status === "danger") return styles.pillDanger;
  if (status === "warning") return styles.pillWarning;
  return styles.pillOk;
}

export function BudgetsView({
  progress,
  format,
  deleteLoading,
  onEdit,
  onDelete,
}: BudgetsViewProps) {
  const { t, i18n } = useTranslation();

  const totalSpent = progress.reduce((sum, p) => sum + p.spent, 0);
  const totalLimit = progress.reduce((sum, p) => sum + p.limit, 0);
  const totalPercent =
    totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
  const monthLabel = new Intl.DateTimeFormat(
    i18n.language?.toLowerCase().startsWith("ru") ? "ru-RU" : "en-US",
    { month: "long", year: "numeric" },
  ).format(new Date());

  return (
    <div className={styles.list}>
      <div className={styles.summary}>
        <div className={styles.summaryMonth}>{monthLabel}</div>
        <div className={`${styles.bar} ${styles.summaryBar}`}>
          <div
            className={`${styles.barFill} ${styles.barFillOk}`}
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        <div className={styles.summaryAmount}>
          <div className={styles.summaryAmountValue}>{format(totalSpent)}</div>
          <span className={styles.summaryAmountSub}>
            {t("budgetSpent")} {format(totalLimit)} · {totalPercent}%
          </span>
        </div>
      </div>

      {progress.map(({ budget, spent, limit, ratio, remaining, status }) => {
        const percent = Math.min(Math.round(ratio * 100), 100);
        const pillLabel =
          status === "danger"
            ? t("budgetOverBy", { amount: format(Math.abs(remaining)) })
            : status === "warning"
              ? t("budgetAlmostOver")
              : t("budgetRemaining", { amount: format(remaining) });

        return (
          <div key={budget.id} className={`${styles.row} aurora-row-hover`}>
            <div className={styles.rowLeft}>
              <div className={styles.catIcon}>
                <CategoryIcon icon={budget.category.icon} size={22} />
              </div>
              <div className={styles.catMeta}>
                <div className={styles.catName}>
                  {getCategoryLabel(budget.category, t)}
                </div>
                <div className={styles.catType}>{t("expense")}</div>
              </div>
            </div>

            <div className={styles.rowBar}>
              <div className={styles.bar}>
                <div
                  className={`${styles.barFill} ${barClass(status)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className={styles.rowRight}>
              <div className={styles.nums}>
                <div className={styles.numsValue}>{format(spent)}</div>
                <span className={styles.numsSub}>
                  {t("budgetSpent")} {format(limit)} · {percent}%
                </span>
              </div>
              <span className={`${styles.pill} ${pillClass(status)}`}>
                <span className={styles.dot} />
                {pillLabel}
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  aria-label={t("editBudget")}
                  onClick={() => onEdit(budget)}
                >
                  <CategoryIcon icon="edit" size={16} />
                </button>
                <Popconfirm
                  title={t("deleteBudgetConfirm")}
                  onConfirm={() => onDelete(budget.id)}
                  okText={t("delete")}
                  cancelText={t("cancel")}
                >
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    aria-label={t("delete")}
                    disabled={deleteLoading}
                  >
                    <CategoryIcon icon="delete" size={16} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
