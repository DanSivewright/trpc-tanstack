import { useTRPC } from "@/integrations/trpc/react"
import { useSuspenseQueries } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

export const Route = createFileRoute(
  "/_learner/communities/create/course/enrolments"
)({
  validateSearch: z.object({
    communityIds: z
      .array(z.string())
      .min(1, "Please select at least one community"),
    content: z.array(
      z.object({
        type: z.string(),
        typeUid: z.string(),
      })
    ),
  }),
  beforeLoad: ({ search }) => {
    if (!search.communityIds?.length) {
      throw redirect({
        to: "/communities/create/course",
      })
    }
    if (!search.content?.length) {
      throw redirect({
        to: "/communities/create/course/select-courses",
        search: { communityIds: search.communityIds },
      })
    }
  },
  loaderDeps: ({ search }) => ({
    communityIds: search.communityIds,
    content: search.content,
  }),
  loader: async ({ context, deps }) => {
    // await Promise.all([
    //   ...deps.content.map((c) =>
    //     context.queryClient.ensureQueryData(
    //       context.trpc.content.detail.queryOptions({
    //         params: { type: c.type, typeUid: c.typeUid },
    //       })
    //     )
    //   ),
    //   ...deps.communityIds.map((id) =>
    //     context.queryClient.ensureQueryData(
    //       context.trpc.communities.detail.queryOptions({ id })
    //     )
    //   ),
    // ])
    return {
      step: "enrolments",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { content, communityIds } = Route.useSearch()
  // const learning = useSuspenseQueries({
  //   queries: content.map((c) =>
  //     trpc.content.detail.queryOptions({
  //       params: { type: c.type, typeUid: c.typeUid },
  //     })
  //   ),
  // })
  // const communities = useSuspenseQueries({
  //   queries: communityIds.map((id) =>
  //     trpc.communities.detail.queryOptions({ id })
  //   ),
  // })

  return (
    <div>
      <h1>Enrolments</h1>
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  )
}
