import { Button, Form, Input, Modal, Popover, Radio } from "antd";
import type { FormInstance } from "antd";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { useTranslation } from "react-i18next";

import type { CategoryFormValues } from "../model/types";
import styles from "./CategoriesView.module.scss";

export type CategoryFormModalProps = {
  open: boolean;
  title: string;
  confirmLoading?: boolean;
  form: FormInstance<CategoryFormValues>;
  isEmojiPickerOpen: boolean;
  onEmojiPickerOpenChange: (open: boolean) => void;
  onEmojiClick: (emoji: EmojiClickData) => void;
  selectedEmoji: string;
  onOk: () => void;
  onCancel: () => void;
};

export function CategoryFormModal({
  open,
  title,
  confirmLoading,
  form,
  isEmojiPickerOpen,
  onEmojiPickerOpenChange,
  onEmojiClick,
  selectedEmoji,
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
          label={t("categoryEmoji")}
          name="icon"
          rules={[{ required: true, message: t("categoryEmojiIsRequired") }]}
        >
          <div className={styles.emojiField}>
            <Popover
              open={isEmojiPickerOpen}
              onOpenChange={onEmojiPickerOpenChange}
              trigger="click"
              placement="bottomLeft"
              overlayClassName={styles.emojiPickerPopover}
              content={
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={Theme.AUTO}
                  width="100%"
                  searchPlaceholder={t("search")}
                />
              }
            >
              <Button className={styles.emojiPickerTrigger}>
                {selectedEmoji || "🙂"}
              </Button>
            </Popover>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
