import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/communities/create/course/enrolments"
)({
  loader: () => ({
    step: "enrolments",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/communities/create/$id/course/enrolments"!</div>
}
