import { useApolloClient } from "@apollo/client/react";
import { message } from "antd";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // Sync offline queue when the browser comes back online
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;

    const key = "offline-sync";

    void message.loading({
      content: t("syncingOffline", { count: pendingCount }),
      key,
      duration: 0,
    });

    void syncOfflineQueue(client).then(({ succeeded, failed }) => {
      if (failed === 0) {
        message.success({ content: t("offlineSyncSuccess"), key });
      } else {
        message.warning({
          content: t("offlineSyncPartial", { succeeded, failed }),
          key,
        });
      }
    });
  }, [isOnline, pendingCount, client, t]);

  return <>{children}</>;
}
