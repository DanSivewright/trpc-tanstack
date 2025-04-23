import { useTRPC } from "@/integrations/trpc/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { useNotification } from "@/hooks/use-notification"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/community/$id/publish"
)({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      step: "publish",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { notification } = useNotification()
  const navigate = useNavigate()
  const { step } = Route.useLoaderData()

  const qc = useQueryClient()
  const trpc = useTRPC()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())
  return (
    <div>
      Hello "/_learner/(communities)/communities_/create/community/$id/publish"!
    </div>
  )
}
