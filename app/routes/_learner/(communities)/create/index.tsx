import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/(communities)/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/create/"!</div>
}
