import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/communities/$id/threads/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/communities/$id/threads"!</div>
}
