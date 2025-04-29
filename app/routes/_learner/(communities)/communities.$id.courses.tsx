import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/courses"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Courses",
  }),
})

function RouteComponent() {
  const params = Route.useParams()
  return (
    <>
      <Link
        to="/communities/$id/threads/$threadId"
        params={{
          id: params.id,
          threadId: crypto.randomUUID(),
        }}
      >
        Go to test thread
      </Link>
    </>
  )
}
