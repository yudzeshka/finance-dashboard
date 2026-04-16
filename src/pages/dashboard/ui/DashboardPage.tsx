import { useQuery } from "@apollo/client/react";
import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useState } from "react";

import type { Category } from "../../../entities/category";
import { GET_CATEGORIES } from "../../../entities/category";
import type { Transaction, TransactionType } from "../../../entities/transaction";
import { GET_TRANSACTIONS } from "../../../entities/transaction";
import { useAddTransaction } from "../../../features/transaction/create/model/useAddTransaction";
import { useDeleteTransaction } from "../../../features/transaction/delete/model/useDeleteTransaction";
import { useEditTransaction } from "../../../features/transaction/edit/model/useEditTransaction";
import { AppShell } from "../../../widgets/app-shell/ui/AppShell";
import { TransactionsTable } from "../../../widgets/transactions-table/ui/TransactionsTable";

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

type FormValues = {
  amount: number;
  description?: string;
  category: string;
  date: Dayjs;
  type: TransactionType;
};

export function DashboardPage() {
  const { data, loading, error } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const [addTransaction, { loading: addTransactionLoading }] =
    useAddTransaction();
  const [editTransaction, { loading: editTransactionLoading }] =
    useEditTransaction();
  const [deleteTransaction, { loading: deleteTransactionLoading }] =
    useDeleteTransaction();

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

  const handleDelete = (id: string) => {
    void deleteTransaction({ variables: { id } });
  };

  const handleOpenEdit = (record: Transaction) => {
    setIsEdit(true);
    setEditingId(record.id);
    form.setFieldsValue({
      amount: Number(record.amount),
      description: record.description ?? undefined,
      category: record.category.id,
      date: dayjs(record.date ?? new Date().toISOString()),
      type: record.type,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <AppShell
        title="Transactions"
        subtitle="Track income and expenses"
        primaryAction={
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add transaction
          </Button>
        }
      >
        <div className="dashboard-card">
          <TransactionsTable
            transactions={data?.transactions ?? []}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            deleteLoading={deleteTransactionLoading}
          />
        </div>
      </AppShell>

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
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              placeholder="0.00"
              prefix="$"
            />
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
            <DatePicker style={{ width: "100%" }} />
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
    </>
  );
}

