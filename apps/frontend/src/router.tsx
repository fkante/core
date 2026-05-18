import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import * as TanstackQuery from './integrations/tanstack-query/root-provider'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) => {
        if (!fromLocation) return ['nav-initial']
        const fromDepth = fromLocation.pathname.split('/').filter(Boolean).length
        const toDepth = toLocation.pathname.split('/').filter(Boolean).length
        if (toDepth > fromDepth) return ['nav-forward']
        if (toDepth < fromDepth) return ['nav-backward']
        return ['nav-sibling']
      },
    },
    Wrap: (props: { children: React.ReactNode }) => {
      return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
