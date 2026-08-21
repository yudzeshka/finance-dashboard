import { useApolloClient } from "@apollo/client/react";
import { message } from "antd";

import type { Category } from "@/entities/category";
import { GET_CATEGORIES } from "@/entities/category";
import { displayToUsd, useCurrencyRatesStore } from "@/entities/currency";
import type { Transaction, TransactionFormValues } from "@/entities/transaction";
import { GET_TRANSACTIONS } from "@/entities/transaction";
import { useAppearanceStore } from "@/features/settings/appearance";
import { useOfflineQueue } from "@/shared/lib/offlineQueue";

import { useAddTransaction } from "../../create/model/useAddTransaction";
import { useDeleteTransaction } from "../../delete/model/useDeleteTransaction";
import { useEditTransaction } from "../../edit/model/useEditTransaction";

type GetTransactionsData = { transactions: Transaction[] };
type GetCategoriesData = { categories: Category[] };

function toTransactionVariables(
  values: TransactionFormValues,
  amountUsd: number,
) {
  return {
    amount: amountUsd,
    description: values.description ?? null,
    categoryId: values.category,
    date: values.date ? values.date.toISOString() : new Date().toISOString(),
    type: values.type,
  };
}

/**
 * Build a temporary Transaction object for optimistic UI update while offline.
 * Uses the category from Apollo cache; falls back to a placeholder if not found.
 */
function buildTempTransaction(
  formValues: TransactionFormValues,
  existingCategories: Category[],
  amountUsd: number,
): Transaction {
  const category = existingCategories.find(
    (c) => c.id === formValues.category,
  ) ?? {
    id: formValues.category,
    name: formValues.category,
    icon: "other",
    type: formValues.type,
    user_id: null,
    key: null,
  };

  return {
    id: `offline-${crypto.randomUUID()}`,
    amount: amountUsd,
    type: formValues.type,
    category,
    date: formValues.date ? formValues.date.toISOString() : new Date().toISOString(),
    description: formValues.description ?? null,
  };
}

export function useTransactionMutations() {
  const client = useApolloClient();

  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  const toUsd = (amount: number) => displayToUsd(Number(amount), currency, rates);

  const [addMutation, { loading: addTransactionLoading }] =
    useAddTransaction();
  const [editMutation, { loading: editTransactionLoading }] =
    useEditTransaction();
  const [deleteMutation, { loading: deleteTransactionLoading }] =
    useDeleteTransaction();

  /** Read categories from Apollo cache for building temp transactions. */
  function getCachedCategories(): Category[] {
    try {
      const data = client.cache.readQuery<GetCategoriesData>({
        query: GET_CATEGORIES,
      });
      return data?.categories ?? [];
    } catch {
      return [];
    }
  }

  const createTransaction = async (values: TransactionFormValues) => {
    const amountUsd = toUsd(values.amount);
    try {
      await addMutation({
        variables: toTransactionVariables(values, amountUsd),
      });
    } catch (error) {
      if (!navigator.onLine) {
        const tempTransaction = buildTempTransaction(
          values,
          getCachedCategories(),
          amountUsd,
        );

        // Optimistically insert into cache so the transaction appears immediately
        client.cache.updateQuery<GetTransactionsData>(
          { query: GET_TRANSACTIONS },
          (prev) => {
            const existing = prev?.transactions ?? [];
            if (existing.some((t) => t.id === tempTransaction.id)) return prev;
            return { transactions: [tempTransaction, ...existing] };
          },
        );

        useOfflineQueue.getState().push({
          type: "add",
          variables: toTransactionVariables(values, amountUsd),
        });
        message.info("Saved offline. Will sync when online.");
        return;
      }
      throw error;
    }
  };

  const updateTransaction = async (
    id: string,
    values: TransactionFormValues,
  ) => {
    const amountUsd = toUsd(values.amount);
    try {
      await editMutation({
        variables: {
          id,
          ...toTransactionVariables(values, amountUsd),
        },
      });
    } catch (error) {
      if (!navigator.onLine) {
        const tempTransaction = buildTempTransaction(
          values,
          getCachedCategories(),
          amountUsd,
        );

        // Optimistically update in cache so the edit is visible immediately
        client.cache.updateQuery<GetTransactionsData>(
          { query: GET_TRANSACTIONS },
          (prev) => {
            const existing = prev?.transactions ?? [];
            if (!existing.some((t) => t.id === id)) return prev;
            return {
              transactions: existing.map((t) =>
                t.id === id ? { ...tempTransaction, id } : t,
              ),
            };
          },
        );

        useOfflineQueue.getState().push({
          type: "edit",
          variables: { id, ...toTransactionVariables(values, amountUsd) },
        });
        message.info("Saved offline. Will sync when online.");
        return;
      }
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteMutation({ variables: { id } });
    } catch (error) {
      if (!navigator.onLine) {
        // Optimistically remove from cache so the UI updates immediately
        client.cache.updateQuery<GetTransactionsData>(
          { query: GET_TRANSACTIONS },
          (prev) => {
            if (!prev) return prev;
            return {
              transactions: prev.transactions.filter((t) => t.id !== id),
            };
          },
        );

        useOfflineQueue.getState().push({
          type: "delete",
          variables: { id },
        });
        message.info("Saved offline. Will sync when online.");
        return;
      }

      const message_text =
        error instanceof Error ? error.message : "Failed to delete transaction";
      console.error("Delete transaction failed:", message_text);
      throw error;
    }
  };

  return {
    createTransaction,
    updateTransaction,
    removeTransaction,
    addTransactionLoading,
    editTransactionLoading,
    deleteTransactionLoading,
  };
}
