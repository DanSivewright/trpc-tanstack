import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/enrolments/$uid")({
  component: RouteComponent,
  loader: () => ({
    crumb: "Course Title",
  }),
})

function RouteComponent() {
  return <div>Hello "/_learner/enrolments/$id"!</div>
}
