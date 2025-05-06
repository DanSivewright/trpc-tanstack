import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId/enrolments"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_learner/communities/$id/courses/$courseId/enrolments"!</div>
  )
}
