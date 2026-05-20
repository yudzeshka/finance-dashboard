import { ApolloProvider } from "@apollo/client/react";
import { useMemo, type ReactNode } from "react";

import { useAuth } from "./AuthProvider";
import { apolloClient } from "./apollo";

type AppApolloProviderProps = {
  children: ReactNode;
};

export function AppApolloProvider({ children }: AppApolloProviderProps) {
  const { nhost } = useAuth();
  const client = useMemo(() => {
    return apolloClient(async () => {
      const refreshedSession = await nhost.refreshSession(60);
      return refreshedSession?.accessToken ?? nhost.getUserSession()?.accessToken;
    });
  }, [nhost]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
