import { useMutation } from "@apollo/client/react";
import type { Transaction, TransactionType } from "../../../../entities/transaction";
import {
  EDIT_TRANSACTION,
  GET_TRANSACTIONS,
} from "../../../../entities/transaction";

type EditTransactionVars = {
  id: string;
  amount: number;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  type: TransactionType;
};

type EditTransactionData = {
  editTransaction: Transaction;
};

type GetTransactionsData = {
  transactions: Transaction[];
};

export function useEditTransaction() {
  return useMutation<EditTransactionData, EditTransactionVars>(EDIT_TRANSACTION, {
    update(cache, result) {
      const edited = result.data?.editTransaction;
      if (!edited) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (!existing.some((t) => t.id === edited.id)) return prev;
          return {
            transactions: existing.map((t) => (t.id === edited.id ? edited : t)),
          };
        },
      );
    },
  });
}

