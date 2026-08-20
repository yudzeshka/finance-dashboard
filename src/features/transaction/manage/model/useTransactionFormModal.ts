import { Form } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { usdToDisplay, useCurrencyRatesStore } from "@/entities/currency";
import type { Transaction, TransactionFormValues } from "@/entities/transaction";
import { useAppearanceStore } from "@/features/settings/appearance";

type UseTransactionFormModalParams = {
  createTransaction: (values: TransactionFormValues) => Promise<unknown>;
  updateTransaction: (
    id: string,
    values: TransactionFormValues,
  ) => Promise<unknown>;
  addTransactionLoading: boolean;
  editTransactionLoading: boolean;
};

export function useTransactionFormModal({
  createTransaction,
  updateTransaction,
  addTransactionLoading,
  editTransactionLoading,
}: UseTransactionFormModalParams) {
  const { t } = useTranslation();
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  const [form] = Form.useForm<TransactionFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setIsEdit(true);
    setEditingId(tx.id);
    form.setFieldsValue({
      amount: usdToDisplay(Number(tx.amount), currency, rates),
      description: tx.description ?? undefined,
      category: tx.category.id,
      date: dayjs(tx.date ?? new Date().toISOString()),
      type: tx.type,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
  };

  const submit = async () => {
    const values = await form.validateFields();

    if (isEdit) {
      if (!editingId) return;
      await updateTransaction(editingId, values);
    } else {
      await createTransaction(values);
    }

    closeModal();
  };

  return {
    isModalOpen,
    modalTitle: isEdit ? t("editTransaction") : t("addTransaction"),
    confirmLoading: isEdit ? editTransactionLoading : addTransactionLoading,
    form,
    openCreate,
    openEdit,
    closeModal,
    submit,
  };
}
