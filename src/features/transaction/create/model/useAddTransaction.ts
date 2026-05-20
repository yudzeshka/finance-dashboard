import { useMutation } from "@apollo/client/react";
import type { Transaction, TransactionType } from "../../../../entities/transaction";
import {
  ADD_TRANSACTION,
  GET_TRANSACTIONS,
} from "../../../../entities/transaction";

type AddTransactionVars = {
  amount: number;
  description?: string | null;
  categoryId: string;
  date: string;
  type: TransactionType;
};

type AddTransactionData = {
  insert_transactions_one: Transaction | null;
};

type GetTransactionsData = {
  transactions: Transaction[];
};

export function useAddTransaction() {
  return useMutation<AddTransactionData, AddTransactionVars>(ADD_TRANSACTION, {
    update(cache, result) {
      const created = result.data?.insert_transactions_one;
      if (!created) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (existing.some((t) => t.id === created.id)) return prev;
          return { transactions: [created, ...existing] };
        },
      );
    },
  });
}

