import { Form } from "antd";
import type { EmojiClickData } from "emoji-picker-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { GET_CATEGORIES } from "@/entities/category";
import type { Category } from "@/entities/category";
import { GET_TRANSACTIONS } from "@/entities/transaction";
import type { Transaction } from "@/entities/transaction";
import { useQuery } from "@apollo/client/react";

import {
  countTransactionsByCategory,
  mapCategoryToRow,
} from "../model/lib";
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

const DEFAULT_EMOJI = "🙂";

export function useContainer() {
  const { t } = useTranslation();
  const [form] = Form.useForm<CategoryFormValues>();

  const [customCategories, setCustomCategories] = useState<CategoryRowViewModel[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CategoryModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const { data: transactionsData, loading: transactionsLoading } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);

  const transactionCounts = useMemo(
    () => countTransactionsByCategory(transactionsData?.transactions ?? []),
    [transactionsData?.transactions],
  );

  const systemCategories = useMemo(() => {
    return (categoriesData?.categories ?? []).map((category) =>
      mapCategoryToRow(
        { ...category, isSystem: true },
        transactionCounts.get(category.id) ?? 0,
      ),
    );
  }, [categoriesData?.categories, transactionCounts]);

  const categories = useMemo(() => {
    const customWithCounts = customCategories.map((category) => ({
      ...category,
      transactionsCount: transactionCounts.get(category.id) ?? 0,
    }));

    return [...systemCategories, ...customWithCounts].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [customCategories, systemCategories, transactionCounts]);

  const resetModalState = useCallback(() => {
    setIsModalOpen(false);
    setModalMode("create");
    setEditingId(null);
    setIsEmojiPickerOpen(false);
    setSelectedEmoji(DEFAULT_EMOJI);
    form.resetFields();
  }, [form]);

  const openCreate = useCallback(() => {
    setModalMode("create");
    setEditingId(null);
    setSelectedEmoji(DEFAULT_EMOJI);
    form.setFieldsValue({
      name: "",
      type: "EXPENSE",
      icon: DEFAULT_EMOJI,
    });
    setIsModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (category: CategoryRowViewModel) => {
      if (category.isSystem) return;

      setModalMode("edit");
      setEditingId(category.id);
      setSelectedEmoji(category.icon);
      form.setFieldsValue({
        name: category.name,
        type: category.type,
        icon: category.icon,
      });
      setIsModalOpen(true);
    },
    [form],
  );

  const handleEmojiClick = useCallback(
    (emoji: EmojiClickData) => {
      setSelectedEmoji(emoji.emoji);
      form.setFieldValue("icon", emoji.emoji);
      setIsEmojiPickerOpen(false);
    },
    [form],
  );

  const submit = useCallback(async () => {
    const values = await form.validateFields();
    setIsSubmitting(true);

    try {
      if (modalMode === "create") {
        setCustomCategories((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: values.name.trim(),
            type: values.type,
            icon: values.icon,
            transactionsCount: 0,
            isSystem: false,
          },
        ]);
      } else if (editingId) {
        setCustomCategories((prev) =>
          prev.map((category) =>
            category.id === editingId
              ? {
                  ...category,
                  name: values.name.trim(),
                  type: values.type,
                  icon: values.icon,
                }
              : category,
          ),
        );
      }

      resetModalState();
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, form, modalMode, resetModalState]);

  const remove = useCallback(
    async (id: string) => {
      setIsDeleting(true);

      try {
        setCustomCategories((prev) => prev.filter((category) => category.id !== id));
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  const modalTitle =
    modalMode === "create" ? t("addCategory") : t("editCategory");

  return {
    categories,
    loading: categoriesLoading || transactionsLoading,
    errorMessage: categoriesError?.message ?? null,
    deleteLoading: isDeleting,
    isModalOpen,
    modalTitle,
    confirmLoading: isSubmitting,
    form,
    isEmojiPickerOpen,
    selectedEmoji,
    onAddClick: openCreate,
    onEdit: openEdit,
    onDelete: remove,
    onModalOk: submit,
    onModalCancel: resetModalState,
    onEmojiPickerOpenChange: setIsEmojiPickerOpen,
    onEmojiClick: handleEmojiClick,
  };
}
