import { Form, InputNumber, Modal, Select } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import { currencySymbol } from "@/entities/currency";
import type { Currency } from "@/entities/settings";
import type { BudgetFormValues } from "@/features/budget";

export type BudgetCategoryOption = {
  label: string;
  value: string;
};

export type BudgetFormModalProps = {
  open: boolean;
  title: string;
  confirmLoading?: boolean;
  form: FormInstance<BudgetFormValues>;
  isEdit: boolean;
  categoryOptions: BudgetCategoryOption[];
  currency: Currency;
  onOk: () => void;
  onCancel: () => void;
};

export function BudgetFormModal({
  open,
  title,
  confirmLoading,
  form,
  isEdit,
  categoryOptions,
  currency,
  onOk,
  onCancel,
}: BudgetFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={t("save")}
      cancelText={t("cancel")}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("budgetCategory")}
          name="categoryId"
          rules={[{ required: true, message: t("budgetCategoryRequired") }]}
        >
          <Select
            options={categoryOptions}
            disabled={isEdit}
            placeholder={t("budgetCategory")}
          />
        </Form.Item>

        <Form.Item
          label={t("budgetLimit")}
          name="limit"
          rules={[
            { required: true, message: t("budgetLimitRequired") },
            { type: "number", min: 0.01, message: t("budgetLimitRequired") },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            suffix={currencySymbol(currency)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
