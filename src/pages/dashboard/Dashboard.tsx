import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_CATEGORIES,
  GET_TRANSACTIONS,
} from "../../shared/api/graphql/queries";
import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
} from "../../shared/api/graphql/mutations";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Table,
} from "antd";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import { useState } from "react";
import type { Dayjs } from "dayjs";

type TransactionType = "INCOME" | "EXPENSE";

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date?: string | null;
  description?: string | null;
};

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

type AddTransactionVars = {
  amount: number;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  type: TransactionType;
};

type DeleteTransactionVars = {
  id: string;
};

type DeleteTransactionData = {
  deleteTransaction: Transaction;
};

type AddTransactionData = {
  addTransaction: Transaction;
};

type EditTransactionData = {
  editTransaction: Transaction;
};

type EditTransactionVars = {
  id: string;
  amount: number;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  type: TransactionType;
};

type TransactionRow = {
  key: string;
  id: string;
  amount: string;
  type: TransactionType;
  category: Category;
  date: string;
  description?: string | null;
};

type FormValues = {
  amount: number;
  description?: string;
  category: string;
  date: Dayjs;
  type: TransactionType;
};

export function Dashboard() {
  const { data, loading, error } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const [addTransaction, { loading: addTransactionLoading }] = useMutation<
    AddTransactionData,
    AddTransactionVars
  >(ADD_TRANSACTION, {
    update(cache, result) {
      const created = result.data?.addTransaction;
      if (!created) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (existing.some((t) => t.id === created.id)) return prev;
          return { transactions: [created, ...existing] };
        },
      );
    },
  });

  const [editTransaction, { loading: editTransactionLoading }] = useMutation<
    EditTransactionData,
    EditTransactionVars
  >(EDIT_TRANSACTION, {
    update(cache, result) {
      const edited = result.data?.editTransaction;
      if (!edited) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (existing.some((t) => t.id === edited.id)) return prev;
          return {
            transactions: existing.map((t) =>
              t.id === edited.id ? edited : t,
            ),
          };
        },
      );
    },
  });

  const [deleteTransaction, { loading: deleteTransactionLoading }] =
    useMutation<DeleteTransactionData, DeleteTransactionVars>(
      DELETE_TRANSACTION,
      {
        update(cache, result) {
          const deleted = result.data?.deleteTransaction;
          if (!deleted) return;

          cache.updateQuery<GetTransactionsData>(
            { query: GET_TRANSACTIONS },
            (prev) => {
              const existing = prev?.transactions ?? [];
              if (!existing.some((t) => t.id === deleted.id)) return prev;
              return {
                transactions: existing.filter((t) => t.id !== deleted.id),
              };
            },
          );
        },
      },
    );

  const [form] = Form.useForm<FormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await addTransaction({
      variables: {
        amount: values.amount,
        description: values.description ?? null,
        category: values.category ?? null,
        date: values.date ? values.date.toISOString() : null,
        type: values.type,
      },
    });

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await editTransaction({
      variables: {
        id: editingId,
        amount: Number(values.amount),
        description: values.description ?? null,
        category: values.category ?? null,
        date: values.date ? values.date.toISOString() : null,
        type: values.type,
      },
    });
    form.resetFields();
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingId(null);
  };

  const categories = categoriesData?.categories.map((category) => ({
    label: category.name,
    value: category.id,
    icon: category.icon,
  }));
  const columns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Transaction Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: Category) => (
        <div>
          <span style={{ marginRight: 8 }}>{category.icon}</span>
          <span>{category.name}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 1 }}>
          <Button
            type="link"
            danger
            onClick={() => deleteTransaction({ variables: { id: record.id } })}
            loading={deleteTransactionLoading}
          >
            🗑️
          </Button>
          <Button
            type="link"
            onClick={() => {
              setIsEdit(true);
              setEditingId(record.id);
              form.setFieldsValue({
                amount: Number(record.amount),
                description: record.description,
                category: record.category.id,
                date: dayjs(record.date),
                type: record.type,
              });
              setIsModalOpen(true);
            }}
          >
            ✏️
          </Button>
        </div>
      ),
    },
  ] satisfies TableProps<TransactionRow>["columns"];

  const dataSource: TransactionRow[] = (data?.transactions ?? []).map(
    (transaction) => ({
      key: transaction.id,
      ...transaction,
      date: dayjs(transaction.date).format("DD.MM.YYYY"),
      amount: transaction.amount.toFixed(2),
      category: transaction.category,
    }),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1>Transactions</h1>
      <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
        <Button type="default" onClick={() => setIsModalOpen(true)}>
          Add transaction
        </Button>

        <Table
          dataSource={dataSource}
          columns={columns}
          summary={() => (
            <Table.Summary.Cell index={0} colSpan={columns.length}>
              <span>
                Total: $
                {dataSource
                  .reduce(
                    (acc, record) =>
                      record.type === "INCOME"
                        ? acc + Number(record.amount)
                        : acc - Number(record.amount),
                    0,
                  )
                  .toFixed(2)}
              </span>
            </Table.Summary.Cell>
          )}
          rowClassName={(record) =>
            record.type === "INCOME"
              ? "transaction-row--income"
              : "transaction-row--expense"
          }
        />
      </div>

      <Modal
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        open={isModalOpen}
        onOk={isEdit ? handleEdit : handleSubmit}
        confirmLoading={isEdit ? editTransactionLoading : addTransactionLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setEditingId(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Amount is required" }]}
          >
            <InputNumber type="number" placeholder="0.00" prefix="$" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input type="text" placeholder="Description" />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select options={categories || []} />
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Date is required" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Type is required" }]}
          >
            <Radio.Group
              options={[
                { label: "INCOME", value: "INCOME" },
                { label: "EXPENSE", value: "EXPENSE" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
