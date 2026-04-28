import type { TransactionFormValues } from "@/entities/transaction";
import { useAddTransaction } from "../../create/model/useAddTransaction";
import { useDeleteTransaction } from "../../delete/model/useDeleteTransaction";
import { useEditTransaction } from "../../edit/model/useEditTransaction";

function toTransactionVariables(values: TransactionFormValues) {
  return {
    amount: Number(values.amount),
    description: values.description ?? null,
    category: values.category ?? null,
    date: values.date ? values.date.toISOString() : null,
    type: values.type,
  };
}

export function useTransactionMutations() {
  const [addTransaction, { loading: addTransactionLoading }] =
    useAddTransaction();
  const [editTransaction, { loading: editTransactionLoading }] =
    useEditTransaction();
  const [deleteTransaction, { loading: deleteTransactionLoading }] =
    useDeleteTransaction();

  const createTransaction = (values: TransactionFormValues) => {
    return addTransaction({
      variables: toTransactionVariables(values),
    });
  };

  const updateTransaction = (id: string, values: TransactionFormValues) => {
    return editTransaction({
      variables: {
        id,
        ...toTransactionVariables(values),
      },
    });
  };

  const removeTransaction = (id: string) => {
    void deleteTransaction({ variables: { id } });
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
