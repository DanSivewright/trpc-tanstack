import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/articles"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Articles",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/communities/$id/articles"!</div>
}
