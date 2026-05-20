import { useMutation } from "@apollo/client/react";
import type { Transaction } from "../../../../entities/transaction";
import {
  DELETE_TRANSACTION,
  GET_TRANSACTIONS,
} from "../../../../entities/transaction";

type DeleteTransactionVars = {
  id: string;
};

type DeleteTransactionData = {
  delete_transactions_by_pk: Transaction | null;
};

type GetTransactionsData = {
  transactions: Transaction[];
};

export function useDeleteTransaction() {
  return useMutation<DeleteTransactionData, DeleteTransactionVars>(
    DELETE_TRANSACTION,
    {
      update(cache, result) {
        const deleted = result.data?.delete_transactions_by_pk;
        if (!deleted) return;

        cache.updateQuery<GetTransactionsData>(
          { query: GET_TRANSACTIONS },
          (prev) => {
            const existing = prev?.transactions ?? [];
            if (!existing.some((t) => t.id === deleted.id)) return prev;
            return {
              transactions: existing.filter((t) => t.id !== deleted.id),
            };
          },
        );
      },
    },
  );
}

