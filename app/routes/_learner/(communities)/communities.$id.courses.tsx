import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/courses"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Courses",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/(communities)/communities/$id/courses"!</div>
}
