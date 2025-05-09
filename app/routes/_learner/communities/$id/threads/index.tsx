import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/communities/$id/threads/")({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const threads = useQuery(
    trpc.communities.threads.queryOptions({
      communityId: params.id,
    })
  )
  return (
    <div>
      <div className="flex flex-col gap-4">
        {threads.data?.map((thread) => (
          <Link
            to="/communities/$id/threads/$threadId"
            params={{
              id: params.id,
              threadId: thread.id,
            }}
            key={thread.id}
          >
            <h2>{thread.title}</h2>
            <p>{thread.content}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
