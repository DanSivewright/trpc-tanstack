import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

export const Route = createFileRoute(
  "/_learner/communities/create/course/select-courses"
)({
  validateSearch: z.object({
    communityIds: z.array(z.string()),
  }),
  // search: {
  //   communityIds: z.array(z.string()),
  // },
  loader: () => {
    // const communityIds = params.communityIds
    // const community = context.queryClient.getQueryData(
    //   context.trpc.communities.getById.queryKey(communityId)
    // )
    return {
      step: "courses",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { communityIds } = Route.useSearch()
  return (
    <div>
      <pre>{JSON.stringify(communityIds, null, 2)}</pre>
    </div>
  )
}
