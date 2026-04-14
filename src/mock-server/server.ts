import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
})

const basePort = Number(process.env.MOCK_GRAPHQL_PORT ?? 4000)

function listen(port: number) {
  const server = createServer(yoga)

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1
      console.warn(
        `Port ${port} is busy. Trying ${nextPort} (or set MOCK_GRAPHQL_PORT).`,
      )
      listen(nextPort)
      return
    }

    throw err
  })

  server.listen(port, () => {
    console.info(`Mock GraphQL running at http://localhost:${port}/graphql`)
  })
}

listen(basePort)