import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import type { FormInstance } from "antd";
import type { Transaction } from "../../../entities/transaction";
import { AppShell } from "../../app-shell/ui/AppShell";
import { TransactionsTable } from "../../transactions-table/ui/TransactionsTable";
import type { TransactionFormValues } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsFiltersWidget } from "../../../features/transaction/filters";

type CategoryOption = {
  label: string;
  value: string;
  icon: string;
};

export type TransactionsWidgetProps = {
  transactions: Transaction[];
  deleteLoading?: boolean;
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;

  onAddClick: () => void;

  // modal
  isModalOpen: boolean;
  modalTitle: string;
  confirmLoading?: boolean;
  onModalOk: () => void;
  onModalCancel: () => void;

  // form
  form: FormInstance<TransactionFormValues>;
  categoryOptions: CategoryOption[];
};

export function TransactionsWidget({
  transactions,
  deleteLoading,
  onDelete,
  onEdit,
  onAddClick,
  isModalOpen,
  modalTitle,
  confirmLoading,
  onModalOk,
  onModalCancel,
  form,
  categoryOptions,
}: TransactionsWidgetProps) {
  return (
    <>
      <AppShell
        title="Transactions"
        subtitle="Track income and expenses"
        primaryAction={
          <Button type="primary" onClick={onAddClick}>
            Add transaction
          </Button>
        }
      >
        <TransactionsFiltersWidget />
        <div className="dashboard-card">
          <TransactionsTable
            transactions={transactions}
            onEdit={onEdit}
            onDelete={onDelete}
            deleteLoading={deleteLoading}
          />
        </div>
      </AppShell>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onOk={onModalOk}
        confirmLoading={confirmLoading}
        onCancel={onModalCancel}
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
            <Select options={categoryOptions} />
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

