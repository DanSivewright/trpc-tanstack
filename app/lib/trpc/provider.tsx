import { QueryClient } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getWebRequest } from "@tanstack/react-start/server"
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import superjson from "superjson"

import { getAuthCookie } from "../auth-cookies"
import { TRPCProvider } from "./react"
import type { TRPCRouter } from "./router"

const queryClient = new QueryClient({
  defaultOptions: {
    dehydrate: { serializeData: superjson.serialize },
    hydrate: { deserializeData: superjson.deserialize },
  },
})

const getRequestHeaders = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getWebRequest()!
    const headers = new Headers(request.headers)

    return Object.fromEntries(headers)
  }
)

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""
    return `http://localhost:${process.env.PORT ?? 3000}`
  })()
  return base + "/api/trpc"
}

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchStreamLink({
      transformer: superjson,
      url: getUrl(),
      async headers() {
        const auth = await getAuthCookie()
        const h = await getRequestHeaders()
        return {
          ...h,
          Authorization: auth ? `Bearer ${auth.token}` : "",
          "x-tenant-id": auth.tenantId ?? "",
          uid: auth.uid ?? "",
        }
      },
    }),
  ],
})

const serverHelpers = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: queryClient,
})

export function getContext() {
  return {
    queryClient,
    trpc: serverHelpers,
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  )
}
