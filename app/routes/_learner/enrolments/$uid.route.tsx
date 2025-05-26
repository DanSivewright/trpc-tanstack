import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/enrolments/$uid")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  )
}
