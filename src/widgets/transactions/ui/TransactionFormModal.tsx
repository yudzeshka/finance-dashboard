import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from "antd";
import type { FormInstance } from "antd";
import type { TransactionCategoryOption } from "@/entities/transaction";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

export type TransactionFormModalProps = {
  isModalOpen: boolean;
  modalTitle: string;
  confirmLoading?: boolean;
  onModalOk: () => void;
  onModalCancel: () => void;
  form: FormInstance;
  categoryOptions: TransactionCategoryOption[];
};

export function TransactionFormModal({
  isModalOpen,
  modalTitle,
  confirmLoading,
  onModalOk,
  onModalCancel,
  form,
  categoryOptions,
}: TransactionFormModalProps) {
  const { t } = useTranslation();

  return (
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
          <Select
            options={categoryOptions}
            optionRender={(option) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <CategoryIcon icon={option.data?.icon} size={16} />
                {option.label}
              </span>
            )}
            labelRender={(props) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <CategoryIcon icon={props.data?.icon} size={16} />
                {props.label}
              </span>
            )}
          />
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
  );
}
