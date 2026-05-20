import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

function getGraphqlUrl() {
  const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN;
  const region = import.meta.env.VITE_NHOST_REGION;

  if (subdomain && region) {
    return `https://${subdomain}.graphql.${region}.nhost.run/v1`;
  }

  return import.meta.env.VITE_GRAPHQL_URL ?? "/graphql";
}

type AccessTokenGetter = () => Promise<string | undefined> | string | undefined;

export function apolloClient(getAccessToken?: AccessTokenGetter) {
  const uri = getGraphqlUrl();

  const authLink = new SetContextLink(async ({ headers = {} }) => {
    const accessToken = await getAccessToken?.();

    return {
      headers: {
        ...headers,
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache: new InMemoryCache(),
  });
}

