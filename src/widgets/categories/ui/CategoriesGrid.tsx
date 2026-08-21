import { Popconfirm } from "antd";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CategoryIcon, resolveIconKey } from "@/shared/ui/CategoryIcon";
import { useMotionConfig } from "@/shared/lib/motion";
import { getCategoryLabel } from "@/entities/category";
import type { CategoryRowViewModel } from "../model/types";
import styles from "./CategoriesGrid.module.scss";

type Props = {
  rows: CategoryRowViewModel[];
  onEdit: (row: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function CategoriesGrid({ rows, onEdit, onDelete, deleteLoading }: Props) {
  const { t } = useTranslation();
  const { prefersReduced } = useMotionConfig();

  const variants = prefersReduced ? undefined : containerVariants;
  const itemVars = prefersReduced ? undefined : itemVariants;

  return (
    <motion.div
      className={styles.grid}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {rows.map((row) => (
        <motion.div
          key={row.id}
          className={`${styles.card} aurora-row-hover aurora-card`}
          variants={itemVars}
        >
          {/* Actions — hidden until hover (desktop), always visible on mobile */}
          {!row.isSystem && (
            <div className={`${styles.actions} aurora-row-actions`}>
              <button
                type="button"
                className={styles.actionButton}
                aria-label={t("editCategory")}
                onClick={() => onEdit(row)}
              >
                <CategoryIcon icon="edit" size={16} />
              </button>
              <Popconfirm
                title={t("deleteCategoryConfirm")}
                onConfirm={() => onDelete(row.id)}
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
          )}

          <div className={styles.iconCircle}>
            <CategoryIcon icon={resolveIconKey(row.icon)} size={22} />
          </div>

          <div className={styles.name}>{getCategoryLabel(row, t)}</div>

          <div className={styles.meta}>
            <span
              className={`${styles.typeTag} ${
                row.type === "INCOME" ? styles.typeTagIncome : styles.typeTagExpense
              }`}
            >
              {t(row.type === "INCOME" ? "income" : "expense")}
            </span>
            <span className={styles.count}>
              {row.transactionsCount} {t("categoryTransactionsCount")}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
