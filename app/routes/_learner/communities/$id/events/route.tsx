import { createFileRoute, Outlet } from "@tanstack/react-router"

import { CalendarProvider } from "@/components/event-calendar/calendar-context"

export const Route = createFileRoute("/_learner/communities/$id/events")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CalendarProvider>
      <Outlet />
    </CalendarProvider>
  )
}
