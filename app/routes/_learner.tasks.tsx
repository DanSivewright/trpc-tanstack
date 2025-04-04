import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/tasks")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/tasks"!</div>
}
