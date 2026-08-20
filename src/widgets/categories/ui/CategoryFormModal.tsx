import { Form, Input, Modal, Popover, Radio } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import { CategoryIcon, CategoryIconPicker } from "@/shared/ui/CategoryIcon";
import type { CategoryFormValues } from "../model/types";
import styles from "./CategoriesView.module.scss";

export type CategoryFormModalProps = {
  open: boolean;
  title: string;
  confirmLoading?: boolean;
  form: FormInstance<CategoryFormValues>;
  isIconPickerOpen: boolean;
  onIconPickerOpenChange: (open: boolean) => void;
  onIconSelect: (key: string) => void;
  selectedIcon: string;
  onOk: () => void;
  onCancel: () => void;
};

export function CategoryFormModal({
  open,
  title,
  confirmLoading,
  form,
  isIconPickerOpen,
  onIconPickerOpenChange,
  onIconSelect,
  selectedIcon,
  onOk,
  onCancel,
}: CategoryFormModalProps) {
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
          label={t("categoryName")}
          name="name"
          rules={[{ required: true, message: t("categoryNameIsRequired") }]}
        >
          <Input placeholder={t("categoryNamePlaceholder")} />
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

        <Form.Item
          label={t("categoryIcon")}
          name="icon"
          rules={[{ required: true, message: t("categoryIconIsRequired") }]}
        >
          <Popover
            content={<CategoryIconPicker value={selectedIcon} onChange={onIconSelect} />}
            title={t("chooseIcon")}
            trigger="click"
            open={isIconPickerOpen}
            onOpenChange={onIconPickerOpenChange}
          >
            <button
              type="button"
              className={styles.iconPickerTrigger}
              aria-label={t("chooseIcon")}
              aria-haspopup="listbox"
              aria-expanded={isIconPickerOpen}
            >
              <CategoryIcon icon={selectedIcon} size={24} />
            </button>
          </Popover>
        </Form.Item>
      </Form>
    </Modal>
  );
}
