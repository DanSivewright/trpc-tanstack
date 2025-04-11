import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/calendar"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Calendar",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/communities/$id/calendar"!</div>
}
