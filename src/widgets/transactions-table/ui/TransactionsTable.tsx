import { Button, Input, Popconfirm, Table } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Transaction } from "../../../entities/transaction";
import type { Category } from "../../../entities/category";
import { useTranslation } from "react-i18next";
import { useMotionConfig } from "@/shared/lib/motion";

type TransactionRow = {
  key: string;
  id: string;
  transaction: Transaction;
  amount: number;
  type: Transaction["type"];
  category: Category;
  date: string; // ISO
  description?: string | null;
};

export type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
  onAddClick?: () => void;
};

function formatTableAmount(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted.replace(",", ".").replace(/\s/g, " ");
}

// motion.tr wrapper — Ant Table components.body.row passes
// React.HTMLAttributes<HTMLTableRowElement> which is incompatible
// with framer-motion's HTMLMotionProps<"tr"> (onDrag signature differs).
// Casting is safe: only className/style/children are actually forwarded.
function MotionRow(props: React.HTMLAttributes<HTMLTableRowElement> & { "data-row-key"?: string }) {
  const config = useMotionConfig();
  return (
    <motion.tr
      {...(props as React.ComponentPropsWithoutRef<typeof motion.tr>)}
      initial={config.prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        config.prefersReduced
          ? { duration: 0 }
          : {
              duration: 0.2,
              ease: config.easeOut as [number, number, number, number],
            }
      }
    />
  );
}

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  deleteLoading,
  onAddClick,
}: TransactionsTableProps) {
  const { t } = useTranslation();
  const [descriptionFilter, setDescriptionFilter] = useState("");

  // Track mount for row animation keys
  const [mountKey, setMountKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setMountKey((prev) => prev + 1);
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: t("description"),
        dataIndex: "description",
        key: "description",
        filterDropdown: () => (
          <div style={{ padding: 8, width: 240 }}>
            <Input
              placeholder={t("searchDescription")}
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              allowClear
            />
          </div>
        ),
        filteredValue: descriptionFilter ? [descriptionFilter] : null,
        onFilter: (value: unknown, record: TransactionRow) =>
          (record.description ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase()),
      },
      {
        title: t("amount"),
        dataIndex: "amount",
        key: "amount",
        sorter: (a: TransactionRow, b: TransactionRow) => a.amount - b.amount,
        render: (amount: number, record: TransactionRow) => {
          const sign = record.type === "INCOME" ? "+" : "−";
          const color =
            record.type === "INCOME"
              ? "var(--aurora-success)"
              : "var(--aurora-danger)";
          const ariaType = record.type === "INCOME" ? "Income" : "Expense";
          return (
            <span
              className="aurora-tabular"
              style={{ color, fontWeight: 500 }}
              aria-label={`${ariaType}: ${sign}${formatTableAmount(amount)} RUB`}
            >
              {sign}
              {formatTableAmount(amount)} ₽
            </span>
          );
        },
      },
      {
        title: t("category"),
        dataIndex: "category",
        key: "category",
        sorter: (a: TransactionRow, b: TransactionRow) =>
          a.category.name.localeCompare(b.category.name),
        render: (category: Category) => (
          <div>
            <span style={{ marginRight: 8 }}>{category.icon}</span>
            <span>{category.name}</span>
          </div>
        ),
      },
      {
        title: t("date"),
        dataIndex: "date",
        key: "date",
        sorter: (a: TransactionRow, b: TransactionRow) =>
          dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
        render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      },
      {
        title: t("actions"),
        dataIndex: "actions",
        key: "actions",
        render: (_: unknown, record: TransactionRow) => (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Popconfirm
              title={t("deleteTransactionConfirm")}
              onConfirm={() => onDelete(record.id)}
              okText={t("delete")}
              cancelText={t("cancel")}
            >
              <Button
                type="link"
                danger
                icon={<span role="img" aria-label={t("delete")}>🗑️</span>}
                loading={deleteLoading}
                aria-label={t("delete")}
                style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              />
            </Popconfirm>
            <Button
              type="link"
              icon={<span role="img" aria-label={t("editTransaction")}>✏️</span>}
              onClick={() => onEdit(record.transaction)}
              aria-label={t("editTransaction")}
              style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            />
          </div>
        ),
      },
    ] satisfies TableProps<TransactionRow>["columns"];
  }, [deleteLoading, descriptionFilter, onDelete, onEdit, t]);

  const dataSource: TransactionRow[] = useMemo(
    () =>
      (transactions ?? []).map((t) => ({
        key: t.id,
        transaction: t,
        ...t,
        date: t.date ?? new Date().toISOString(),
        amount: t.amount,
        category: t.category,
      })),
    [transactions],
  );

  const total = useMemo(() => {
    return dataSource.reduce(
      (acc, record) =>
        record.type === "INCOME" ? acc + record.amount : acc - record.amount,
      0,
    );
  }, [dataSource]);

  const totalFormatted = useMemo(() => {
    const sign = total >= 0 ? "+" : "−";
    return `${sign}${formatTableAmount(total)} ₽`;
  }, [total]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      key={mountKey}
      scroll={{ x: "max-content" }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        current: currentPage,
        onChange: handlePageChange,
      }}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={columns.length}>
            <span
              className="aurora-font-display"
              style={{
                fontSize: 16,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: "var(--aurora-text)",
              }}
            >
              {t("total")}: {totalFormatted}
            </span>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
      onRow={() => ({
        className: "aurora-row-hover",
      })}
      components={{
        body: {
          row: MotionRow,
        },
      }}
      locale={{
        emptyText: dataSource.length === 0 ? (
          <div className="aurora-empty-state">
            <div className="aurora-empty-state__icon">📋</div>
            <div className="aurora-empty-state__title">
              {t("noTransactionsYet")}
            </div>
            {onAddClick ? (
              <Button type="primary" onClick={onAddClick}>
                {t("addFirstTransaction")}
              </Button>
            ) : null}
          </div>
        ) : (
          " "
        ),
      }}
    />
  );
}
