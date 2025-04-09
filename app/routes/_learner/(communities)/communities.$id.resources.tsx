import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/resources"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/communities/$id/resources"!</div>
}
