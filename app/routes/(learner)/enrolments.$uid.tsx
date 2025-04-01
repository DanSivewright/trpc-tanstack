import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { useTRPC } from "@/lib/trpc/react"

export const Route = createFileRoute("/(learner)/enrolments/$uid")({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { uid } = Route.useParams()

  const query = useQuery(
    trpc.enrolments.detail.queryOptions({
      params: {
        uid,
      },
      query: {
        excludeMaterial: true,
      },
    })
  )
  const enrolment = query.data
  return (
    <div>
      <pre>{JSON.stringify(enrolment, null, 2)}</pre>
    </div>
  )
}
