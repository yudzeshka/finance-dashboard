import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function apolloClient() {
  const uri = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql'

  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  })
}

