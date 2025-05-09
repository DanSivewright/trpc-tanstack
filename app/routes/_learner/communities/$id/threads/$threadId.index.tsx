import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/communities/$id/threads/$threadId/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const thread = useQuery(
    trpc.communities.threadDetail.queryOptions({
      communityId: params.id,
      threadId: params.threadId,
    })
  )
  return (
    <div>
      <pre>{JSON.stringify(thread, null, 2)}</pre>
    </div>
  )
}
