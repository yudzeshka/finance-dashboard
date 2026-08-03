import { useApolloClient } from "@apollo/client/react";
import { message } from "antd";
import { useEffect, type ReactNode } from "react";

import { useOnlineStatus } from "@/shared/lib/useOnlineStatus";
import { syncOfflineQueue } from "@/shared/lib/syncOfflineQueue";
import { useOfflineQueue } from "@/shared/lib/offlineQueue";

type OfflineSyncProviderProps = {
  children: ReactNode;
};

/**
 * Listens for the browser "online" event and replays pending offline mutations.
 * Mount inside ApolloProvider to have access to the Apollo client.
 */
export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const client = useApolloClient();
  const isOnline = useOnlineStatus();
  const pendingCount = useOfflineQueue((s) => s.queue.length);

  // Sync offline queue when the browser comes back online
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;

    const key = "offline-sync";

    void message.loading({
      content: `Syncing ${pendingCount} offline change${pendingCount > 1 ? "s" : ""}...`,
      key,
      duration: 0,
    });

    void syncOfflineQueue(client).then(({ succeeded, failed }) => {
      if (failed === 0) {
        message.success({ content: "All changes synced", key });
      } else {
        message.warning({
          content: `${succeeded} synced, ${failed} failed — will retry later`,
          key,
        });
      }
    });
  }, [isOnline, pendingCount, client]);

  return <>{children}</>;
}
