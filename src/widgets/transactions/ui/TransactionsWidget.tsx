import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from "antd";
import type { FormInstance } from "antd";
import type { Transaction } from "../../../entities/transaction";
import { AppShell } from "../../app-shell/ui/AppShell";
import { TransactionsTable } from "../../transactions-table/ui/TransactionsTable";
import type { TransactionFormValues } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsFiltersWidget } from "../../../features/transaction/filters";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <>
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
        primaryAction={
          <Button type="primary" onClick={onAddClick}>
            {t("addTransaction")}
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
        okText={t("save")}
        cancelText={t("cancel")}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("amount")}
            name="amount"
            rules={[{ required: true, message: t("amountIsRequired") }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              placeholder="0.00"
              prefix="$"
            />
          </Form.Item>
          <Form.Item label={t("description")} name="description">
            <Input type="text" placeholder={t("description")} />
          </Form.Item>
          <Form.Item
            label={t("category")}
            name="category"
            rules={[{ required: true, message: t("categoryIsRequired") }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item
            label={t("date")}
            name="date"
            rules={[{ required: true, message: t("dateIsRequired") }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label={t("type")}
            name="type"
            rules={[{ required: true, message: t("typeIsRequired") }]}
          >
            <Radio.Group
              options={[
                { label: t("income"), value: "INCOME" },
                { label: t("expense"), value: "EXPENSE" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
