import { useTRPC } from "@/integrations/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/communities/$id/courses/")({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.courses.queryOptions({
        communityId: params.id,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const trpc = useTRPC()
  const courses = useSuspenseQuery(
    trpc.communities.courses.queryOptions({
      communityId: params.id,
    })
  )
  return (
    <div>
      <pre>{JSON.stringify(courses.data, null, 2)}</pre>
    </div>
  )
}
