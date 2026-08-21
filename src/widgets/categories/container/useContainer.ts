import { Form } from "antd";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DELETE_CATEGORY,
  GET_CATEGORIES,
  INSERT_CATEGORY,
  UPDATE_CATEGORY,
} from "@/entities/category";
import type { Category } from "@/entities/category";
import { GET_TRANSACTIONS } from "@/entities/transaction";
import type { Transaction } from "@/entities/transaction";
import { useMutation, useQuery } from "@apollo/client/react";

import { countTransactionsByCategory, mapCategoryToRow } from "../model/lib";
import type {
  CategoryFormValues,
  CategoryModalMode,
  CategoryRowViewModel,
} from "../model/types";

type GetCategoriesData = {
  categories: Category[];
};

type GetTransactionsData = {
  transactions: Transaction[];
};

type InsertCategoryData = {
  insert_categories_one: Category | null;
};

type UpdateCategoryData = {
  update_categories_by_pk: Category | null;
};

type DeleteCategoryData = {
  delete_categories_by_pk: { id: string } | null;
};

const DEFAULT_ICON_KEY = "other";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function useContainer() {
  const { t } = useTranslation();
  const [form] = Form.useForm<CategoryFormValues>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CategoryModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON_KEY);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<GetCategoriesData>(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
  });

  const { data: transactionsData, loading: transactionsLoading } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);

  const [insertCategory, { loading: insertLoading }] = useMutation<
    InsertCategoryData,
    CategoryFormValues
  >(INSERT_CATEGORY);

  const [updateCategory, { loading: updateLoading }] = useMutation<
    UpdateCategoryData,
    CategoryFormValues & { id: string }
  >(UPDATE_CATEGORY);

  const [deleteCategory, { loading: deleteLoading }] = useMutation<
    DeleteCategoryData,
    { id: string }
  >(DELETE_CATEGORY);

  const transactionCounts = useMemo(
    () => countTransactionsByCategory(transactionsData?.transactions ?? []),
    [transactionsData?.transactions],
  );

  const categories = useMemo(() => {
    return (categoriesData?.categories ?? [])
      .map((category) =>
        mapCategoryToRow(category, transactionCounts.get(category.id) ?? 0),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesData?.categories, transactionCounts]);

  const resetModalState = useCallback(() => {
    setIsModalOpen(false);
    setModalMode("create");
    setEditingId(null);
    setIsIconPickerOpen(false);
    setSelectedIcon(DEFAULT_ICON_KEY);
    form.resetFields();
  }, [form]);

  const openCreate = useCallback(() => {
    setActionError(null);
    setModalMode("create");
    setEditingId(null);
    setSelectedIcon(DEFAULT_ICON_KEY);
    form.setFieldsValue({
      name: "",
      type: "EXPENSE",
      icon: DEFAULT_ICON_KEY,
    });
    setIsModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (category: CategoryRowViewModel) => {
      if (category.isSystem) return;

      setActionError(null);
      setModalMode("edit");
      setEditingId(category.id);
      setSelectedIcon(category.icon);
      form.setFieldsValue({
        name: category.name,
        type: category.type,
        icon: category.icon,
      });
      setIsModalOpen(true);
    },
    [form],
  );

  const handleIconSelect = useCallback(
    (key: string) => {
      setSelectedIcon(key);
      form.setFieldValue("icon", key);
      setIsIconPickerOpen(false);
    },
    [form],
  );

  const submit = useCallback(async () => {
    const values = await form.validateFields();
    setActionError(null);

    try {
      if (modalMode === "create") {
        await insertCategory({
          variables: {
            name: values.name.trim(),
            icon: values.icon,
            type: values.type,
          },
        });
      } else if (editingId) {
        await updateCategory({
          variables: {
            id: editingId,
            name: values.name.trim(),
            icon: values.icon,
            type: values.type,
          },
        });
      }

      await refetchCategories();
      resetModalState();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }, [
    editingId,
    form,
    insertCategory,
    modalMode,
    refetchCategories,
    resetModalState,
    updateCategory,
  ]);

  const remove = useCallback(
    async (id: string) => {
      setActionError(null);

      try {
        await deleteCategory({ variables: { id } });
        await refetchCategories();
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    },
    [deleteCategory, refetchCategories],
  );

  const modalTitle =
    modalMode === "create" ? t("addCategory") : t("editCategory");

  return {
    categories,
    loading: categoriesLoading || transactionsLoading,
    errorMessage: categoriesError?.message ?? actionError,
    deleteLoading,
    isModalOpen,
    modalTitle,
    confirmLoading: insertLoading || updateLoading,
    form,
    isIconPickerOpen,
    selectedIcon,
    onAddClick: openCreate,
    onEdit: openEdit,
    onDelete: remove,
    onModalOk: submit,
    onModalCancel: resetModalState,
    onIconPickerOpenChange: setIsIconPickerOpen,
    onIconSelect: handleIconSelect,
    refetch: refetchCategories,
  };
}
