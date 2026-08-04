import { Button, Popconfirm, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { CategoryRowViewModel } from "../model/types";
import styles from "./CategoriesView.module.scss";

export type CategoriesTableProps = {
  categories: CategoryRowViewModel[];
  loading?: boolean;
  deleteLoading?: boolean;
  onEdit: (category: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
};

export function CategoriesTable({
  categories,
  loading,
  deleteLoading,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t } = useTranslation();

  const columns = useMemo(() => {
    return [
      {
        title: t("categoryName"),
        dataIndex: "name",
        key: "name",
        sorter: (a: CategoryRowViewModel, b: CategoryRowViewModel) =>
          a.name.localeCompare(b.name),
      },
      {
        title: t("type"),
        dataIndex: "type",
        key: "type",
        render: (type: CategoryRowViewModel["type"]) => (
          <Tag
            className={
              type === "INCOME" ? styles.typeTagIncome : styles.typeTagExpense
            }
            color={type === "INCOME" ? "green" : "default"}
          >
            {type === "INCOME" ? t("income") : t("expense")}
          </Tag>
        ),
      },
      {
        title: t("categoryEmoji"),
        dataIndex: "icon",
        key: "icon",
        width: 120,
        render: (icon: string) => (
          <div className={styles.emojiCell}>
            <span className={styles.emojiCircle} aria-hidden>
              {icon}
            </span>
          </div>
        ),
      },
      {
        title: t("categoryTransactionsCount"),
        dataIndex: "transactionsCount",
        key: "transactionsCount",
        width: 140,
        sorter: (a: CategoryRowViewModel, b: CategoryRowViewModel) =>
          a.transactionsCount - b.transactionsCount,
      },
      {
        title: t("actions"),
        key: "actions",
        width: 120,
        render: (_: unknown, record: CategoryRowViewModel) => {
          if (record.isSystem) {
            return null;
          }

          return (
            <div className={styles.actionsCell}>
              <Button type="link" onClick={() => onEdit(record)}>
                ✏️
              </Button>
              <Popconfirm
                title={t("deleteCategoryConfirm")}
                okText={t("delete")}
                cancelText={t("cancel")}
                onConfirm={() => onDelete(record.id)}
              >
                <Button type="link" danger loading={deleteLoading}>
                  🗑️
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ] satisfies TableProps<CategoryRowViewModel>["columns"];
  }, [deleteLoading, onDelete, onEdit, t]);

  return (
    <Table
      dataSource={categories}
      columns={columns}
      rowKey="id"
      loading={loading}
      scroll={{ x: "max-content" }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
}
