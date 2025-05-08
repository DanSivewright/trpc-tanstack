import { createFileRoute } from "@tanstack/react-router"

import { SidebarProvider } from "@/components/ui/sidebar"
import { CalendarProvider } from "@/components/event-calendar/calendar-context"

import CommunityEventsCalendar from "./-components/community-events-calendar"
import { CommunityEventsSidebar } from "./-components/community-events-sidebar"

export const Route = createFileRoute("/_learner/communities/$id/events/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <CommunityEventsSidebar />
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
          <CommunityEventsCalendar />
        </div>
      </SidebarProvider>
    </CalendarProvider>
  )
}
