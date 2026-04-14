import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { apolloClient } from './app/providers/apollo'
import { ApolloProvider } from '@apollo/client/react'
import { Dashboard } from './pages/dashboard/Dashboard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient()}>
      <Dashboard />
    </ApolloProvider>
  </StrictMode>,
)
