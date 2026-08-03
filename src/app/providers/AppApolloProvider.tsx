import type { ApolloClient } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Flex, Spin } from "antd";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "./AuthProvider";
import { createApolloClient } from "./apollo";
import { OfflineSyncProvider } from "./OfflineSyncProvider";

type AppApolloProviderProps = {
  children: ReactNode;
};

export function AppApolloProvider({ children }: AppApolloProviderProps) {
  const { nhost } = useAuth();
  const [client, setClient] = useState<ApolloClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    void createApolloClient(async () => {
      const refreshedSession = await nhost.refreshSession(60);
      return refreshedSession?.accessToken ?? nhost.getUserSession()?.accessToken;
    }).then((apollo) => {
      if (!cancelled) {
        setClient(apollo);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [nhost]);

  if (!client) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100svh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <ApolloProvider client={client}>
      <OfflineSyncProvider>{children}</OfflineSyncProvider>
    </ApolloProvider>
  );
}
