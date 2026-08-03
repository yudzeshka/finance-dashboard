import type { ApolloClient } from "@apollo/client";

import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  GET_TRANSACTIONS,
} from "@/entities/transaction";
import type { Transaction } from "@/entities/transaction";
import { useOfflineQueue } from "./offlineQueue";

type GetTransactionsData = { transactions: Transaction[] };
type AddData = { insert_transactions_one: Transaction | null };
type EditData = { update_transactions_by_pk: Transaction | null };
type DeleteData = { delete_transactions_by_pk: Transaction | null };

function optimisticRemove(
  client: ApolloClient<unknown>,
  transactionId: string,
) {
  client.cache.updateQuery<GetTransactionsData>(
    { query: GET_TRANSACTIONS },
    (prev) => {
      if (!prev) return prev;
      if (!prev.transactions.some((t) => t.id === transactionId)) return prev;
      return {
        transactions: prev.transactions.filter((t) => t.id !== transactionId),
      };
    },
  );
}

/**
 * Replays all pending offline mutations against the server.
 *
 * - Executes each mutation in order
 * - On success: removes the mutation from the queue
 * - On failure: skips (keeps in queue for next attempt, avoids infinite retry loops)
 *
 * Call this when the browser fires the "online" event.
 */
export async function syncOfflineQueue(
  client: ApolloClient<unknown>,
): Promise<{ succeeded: number; failed: number }> {
  const queue = useOfflineQueue.getState().queue;
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;

  for (const mutation of queue) {
    try {
      switch (mutation.type) {
        case "delete": {
          await client.mutate<DeleteData>({
            mutation: DELETE_TRANSACTION,
            variables: mutation.variables,
          });
          break;
        }
        case "add": {
          await client.mutate<AddData>({
            mutation: ADD_TRANSACTION,
            variables: mutation.variables,
          });
          break;
        }
        case "edit": {
          await client.mutate<EditData>({
            mutation: EDIT_TRANSACTION,
            variables: mutation.variables,
          });
          break;
        }
      }

      useOfflineQueue.getState().remove(mutation.id);
      succeeded++;
    } catch (error) {
      console.warn(
        `Offline sync: ${mutation.type} mutation failed, will retry later:`,
        error,
      );
      failed++;
    }
  }

  // Refetch to replace any temporary offline-* IDs with real server data
  if (succeeded > 0) {
    await client.refetchQueries({ include: [GET_TRANSACTIONS] });
  }

  return { succeeded, failed };
}

/**
 * Apply pending delete mutations to an Apollo cache that was just restored
 * from persistence. This prevents showing transactions the user already deleted
 * while offline.
 */
export function applyQueueToRestoredCache(
  client: ApolloClient<unknown>,
): void {
  const queue = useOfflineQueue.getState().queue;

  for (const mutation of queue) {
    if (mutation.type === "delete") {
      optimisticRemove(client, mutation.variables.id as string);
    }
  }
}
