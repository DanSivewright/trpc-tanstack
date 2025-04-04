import { createTRPCContext } from "@/integrations/trpc/init"
import { trpcRouter } from "@/integrations/trpc/router"
import { createAPIFileRoute } from "@tanstack/react-start/api"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

// Adapter function for TanStack
const handler = ({ request }: { request: Request }) => {
  // Create a simple response using the same TRPC handler logic
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: () => createTRPCContext(request),
  })
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
})
