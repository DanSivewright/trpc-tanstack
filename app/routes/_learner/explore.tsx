import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/explore")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/explore"!</div>
}
