import { Form } from "antd";
import { useState } from "react";

import { usdToDisplay, useCurrencyRatesStore } from "@/entities/currency";
import type { Budget } from "@/entities/budget";
import { useAppearanceStore } from "@/features/settings/appearance";

import { buildBudgetVariables } from "./buildBudgetVariables";
import type { BudgetFormValues } from "./buildBudgetVariables";

type UseSetLimitParams = {
  createBudget: (categoryId: string, limitUsd: number) => Promise<unknown>;
  editBudget: (id: string, limitUsd: number) => Promise<unknown>;
  createLoading: boolean;
  editLoading: boolean;
};

export function useSetLimit({
  createBudget,
  editBudget,
  createLoading,
  editLoading,
}: UseSetLimitParams) {
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  const [form] = Form.useForm<BudgetFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setIsEdit(true);
    setEditingId(budget.id);
    form.setFieldsValue({
      categoryId: budget.category_id,
      limit: usdToDisplay(Number(budget.limit_usd), currency, rates),
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
    const { categoryId, limitUsd } = buildBudgetVariables(
      values,
      currency,
      rates,
    );

    if (isEdit) {
      if (!editingId) return;
      await editBudget(editingId, limitUsd);
    } else {
      await createBudget(categoryId, limitUsd);
    }

    closeModal();
  };

  return {
    isModalOpen,
    isEdit,
    editingId,
    confirmLoading: isEdit ? editLoading : createLoading,
    form,
    openCreate,
    openEdit,
    closeModal,
    submit,
  };
}
