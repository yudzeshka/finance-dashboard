import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import {
  type CachePersistor,
  LocalStorageWrapper,
  persistCache,
} from "cache-persist-4-apollo";

import { applyQueueToRestoredCache } from "@/shared/lib/syncOfflineQueue";

function getGraphqlUrl() {
  const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN;
  const region = import.meta.env.VITE_NHOST_REGION;

  if (subdomain && region) {
    return `https://${subdomain}.graphql.${region}.nhost.run/v1`;
  }

  return import.meta.env.VITE_GRAPHQL_URL ?? "/graphql";
}

type AccessTokenGetter = () => Promise<string | undefined> | string | undefined;

let cachePersistor: CachePersistor | null = null;

export async function createApolloClient(getAccessToken?: AccessTokenGetter) {
  const uri = getGraphqlUrl();
  const cache = new InMemoryCache();

  try {
    cachePersistor = await persistCache({
      cache,
      storage: new LocalStorageWrapper(window.localStorage),
    });
  } catch (error) {
    console.warn("Apollo cache persistence unavailable:", error);
  }

  const authLink = new SetContextLink(async ({ headers = {} }) => {
    const accessToken = await getAccessToken?.();

    return {
      headers: {
        ...headers,
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache,
  });

  // Apply pending offline mutations to the restored cache so the UI
  // doesn't show transactions the user already deleted while offline.
  applyQueueToRestoredCache(client);

  return client;
}

export async function purgeApolloCache() {
  await cachePersistor?.purge();
}
