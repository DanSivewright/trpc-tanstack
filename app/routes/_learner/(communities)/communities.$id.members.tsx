import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/members"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Members",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/communities/$id/member"!</div>
}
