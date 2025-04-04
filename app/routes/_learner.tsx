import { createFileRoute, Outlet } from "@tanstack/react-router"

import NavigationLearnerHeader from "@/components/navigation/navigation-learner/navigation-learner-header"

export const Route = createFileRoute("/_learner")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <NavigationLearnerHeader />
      <Outlet />
    </>
  )
}
