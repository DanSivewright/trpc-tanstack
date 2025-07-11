import { createRouter as createTanstackRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"

import * as TanstackQuery from "./integrations/tanstack-query/root-provider"
import { routeTree } from "./routeTree.gen"

export const createRouter = () => {
  const router = routerWithQueryClient(
    createTanstackRouter({
      scrollRestoration: true,
      defaultHashScrollIntoView: {
        behavior: "smooth",
      },
      routeTree,
      context: {
        ...TanstackQuery.getContext(),
      },
      // defaultPreloadStaleTime: 0,
      defaultPreload: "intent",
      Wrap: (props: { children: React.ReactNode }) => {
        return <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>
      },
    }),
    TanstackQuery.getContext().queryClient
  )

  return router
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
