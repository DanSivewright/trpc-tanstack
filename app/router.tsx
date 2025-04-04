import { createRouter as createTanstackRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"

import { DefaultCatchBoundary } from "./components/default-catch-boundary"
import { NotFound } from "./components/not-found"
import * as TanstackQuery from "./lib/trpc/provider"
// import { getAuthToken, getTenantId } from "./lib/auth-cookies"
// import { auth } from "./lib/firebase/client";
import { TRPCProvider } from "./lib/trpc/react"
import { routeTree } from "./routeTree.gen"

export function createRouter() {
  const router = routerWithQueryClient(
    createTanstackRouter({
      routeTree,
    }),
    TanstackQuery.getContext().queryClient
  )
  // const router = routerWithQueryClient(
  //   createTanstackRouter({
  //     routeTree,
  //     context: {
  //       ...TanstackQuery.getContext(),
  //     },
  //     scrollRestoration: true,
  //     defaultPreloadStaleTime: 0,
  //     Wrap: (props: { children: React.ReactNode }) => {
  //       return <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>
  //     },
  //   }),
  //   TanstackQuery.getContext().queryClient
  // )
  // return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
