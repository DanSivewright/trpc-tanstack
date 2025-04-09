import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/articles/$articleId"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_learner/(communities)/communities/$id/articles/$articleId"!
    </div>
  )
}
