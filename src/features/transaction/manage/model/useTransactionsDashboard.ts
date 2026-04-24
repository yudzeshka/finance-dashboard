import { useQuery } from "@apollo/client/react";
import { Form } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import type { Category } from "../../../../entities/category";
import { GET_CATEGORIES } from "../../../../entities/category";
import type {
  Transaction,
  TransactionType,
} from "../../../../entities/transaction";
import { GET_TRANSACTIONS } from "../../../../entities/transaction";
import { useAddTransaction } from "../../create/model/useAddTransaction";
import { useDeleteTransaction } from "../../delete/model/useDeleteTransaction";
import { useEditTransaction } from "../../edit/model/useEditTransaction";
import { useFilters } from "../../filters/model/selectors";
import { filterTransactions } from "./filterTransactions";
import {
  useSetAllTransactions,
  useSetTransactions,
} from "../../../../entities/transaction/model/selectors";
import { useDebounce } from "../../../../shared/hooks/UseDebounce";
import { useTranslation } from "react-i18next";

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

export type TransactionFormValues = {
  amount: number;
  description?: string;
  category: string;
  date: Dayjs;
  type: TransactionType;
};

export function useTransactionsDashboard() {
  const { t } = useTranslation();
  const {
    data: transactionsData,
    loading,
    error,
  } = useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const [addTransaction, { loading: addTransactionLoading }] =
    useAddTransaction();
  const [editTransaction, { loading: editTransactionLoading }] =
    useEditTransaction();
  const [deleteTransaction, { loading: deleteTransactionLoading }] =
    useDeleteTransaction();

  const [form] = Form.useForm<TransactionFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const filters = useFilters();
  const setTransactions = useSetTransactions();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(
    filters.search ?? "",
    250,
  );

  const categoryOptions = useMemo(() => {
    return (
      categoriesData?.categories.map((c) => ({
        label: c.name,
        value: c.id,
        icon: c.icon,
      })) ?? []
    );
  }, [categoriesData]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactionsData?.transactions ?? [], {
      ...filters,
      search: debouncedSearch,
    });
  }, [transactionsData, filters, debouncedSearch]);

  useEffect(() => {
    setTransactions(filteredTransactions);
  }, [filteredTransactions, setTransactions]);

  useEffect(() => {
    setAllTransactions(transactionsData?.transactions ?? []);
  }, [transactionsData, setAllTransactions]);

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
      amount: Number(tx.amount),
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
    } else {
      await addTransaction({
        variables: {
          amount: values.amount,
          description: values.description ?? null,
          category: values.category ?? null,
          date: values.date ? values.date.toISOString() : null,
          type: values.type,
        },
      });
    }

    closeModal();
  };

  const remove = (id: string) => {
    void deleteTransaction({ variables: { id } });
  };

  return {
    // data
    transactions: filteredTransactions,
    categoryOptions,

    // query state
    loading,
    error,

    // modal state
    isModalOpen,
    modalTitle: isEdit ? t("editTransaction") : t("addTransaction"),
    confirmLoading: isEdit ? editTransactionLoading : addTransactionLoading,

    // form
    form,

    // actions
    openCreate,
    openEdit,
    closeModal,
    submit,
    remove,

    // table state
    deleteLoading: deleteTransactionLoading,
  };
}
