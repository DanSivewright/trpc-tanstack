import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/explore")({
  component: RouteComponent,
  loader: () => ({
    crumb: "Explore",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/explore"!</div>
}
