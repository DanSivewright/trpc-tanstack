import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/communities/$id")({
  component: RouteComponent,
  loader: () => ({
    crumb: "Coding",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/communities/$id"!</div>
}
