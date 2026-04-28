import { Button, Input, Table } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type { Transaction } from "../../../entities/transaction";
import type { Category } from "../../../entities/category";
import { useTranslation } from "react-i18next";

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
};

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  deleteLoading,
}: TransactionsTableProps) {
  const { t } = useTranslation();
  const [descriptionFilter, setDescriptionFilter] = useState("");

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
        title: t("transactionType"),
        dataIndex: "type",
        key: "type",
        sorter: (a: TransactionRow, b: TransactionRow) =>
          a.type.localeCompare(b.type),
      },
      {
        title: t("amount"),
        dataIndex: "amount",
        key: "amount",
        sorter: (a: TransactionRow, b: TransactionRow) => a.amount - b.amount,
        render: (amount: number) => amount.toFixed(2),
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
          <div style={{ display: "flex", gap: 1 }}>
            <Button
              type="link"
              danger
              onClick={() => onDelete(record.id)}
              loading={deleteLoading}
            >
              🗑️
            </Button>
            <Button
              type="link"
              onClick={() => onEdit(record.transaction)}
            >
              ✏️
            </Button>
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
    return dataSource
      .reduce(
        (acc, record) =>
          record.type === "INCOME" ? acc + record.amount : acc - record.amount,
        0,
      )
      .toFixed(2);
  }, [dataSource]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      summary={() => (
        <Table.Summary.Cell index={0} colSpan={columns.length}>
          <span>
            {t("total")}: ${total}
          </span>
        </Table.Summary.Cell>
      )}
      rowClassName={(record) =>
        record.type === "INCOME"
          ? "transaction-row--income"
          : "transaction-row--expense"
      }
    />
  );
}
