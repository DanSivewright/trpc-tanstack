import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/teams")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/teams"!</div>
}
