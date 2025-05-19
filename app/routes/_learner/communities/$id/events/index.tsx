import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { SidebarProvider } from "@/components/ui/sidebar"
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"
import {
  type CalendarView,
  type EventColor,
} from "@/components/event-calendar/types"

import { CommunityEventsSidebar } from "./-components/community-events-sidebar"

const DEFAULT_CALENDARS_MAP: Record<
  string,
  {
    id: string
    name: string
    color: EventColor
    background: string
    isActive: boolean
  }
> = {
  courses: {
    id: "course",
    name: "Courses",
    color: "orange",
    background: "bg-orange-400",
    isActive: true,
  },
  threads: {
    id: "thread",
    name: "Threads",
    color: "emerald",
    background: "bg-emerald-400",
    isActive: true,
  },
  articles: {
    id: "article",
    name: "Articles",
    color: "violet",
    background: "bg-violet-400",
    isActive: true,
  },
}
const DEFAULT_CALENDARS = Object.values(DEFAULT_CALENDARS_MAP)

export const Route = createFileRoute("/_learner/communities/$id/events/")({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const [view, setView] = useLocalStorage<CalendarView>({
    key: "event-view",
    defaultValue: "month",
  })
  const [visibleCalendars, setVisibleCalendars] = useLocalStorage<string[]>({
    key: "event-visible-calendars",
    defaultValue: DEFAULT_CALENDARS.map((cal) => cal.id),
  })

  const events = useSuspenseQuery(
    trpc.communities.events.all.queryOptions({
      communityId: params.id,
    })
  )

  const formatedEvents = useMemo(() => {
    return events?.data?.map((colGroup) => {
      return {
        id: colGroup.id,
        title: colGroup.title,
        calendarId: colGroup.type,
        description: "caption" in colGroup ? colGroup.caption : "",
        start: new Date(colGroup.isFeaturedFrom || ""),
        end: new Date(colGroup.isFeaturedUntil || ""),
        color:
          colGroup?.type === "course"
            ? "orange"
            : colGroup?.type === "thread"
              ? "emerald"
              : colGroup.type === "article"
                ? "violet"
                : "blue",
        location: "",
      } as CalendarEvent
    })
  }, [events?.data, visibleCalendars])

  const visibleEvents = useMemo(() => {
    return formatedEvents?.filter((event) =>
      visibleCalendars.includes(event.calendarId || "")
    )
  }, [formatedEvents, visibleCalendars])

  return (
    <>
      <SidebarProvider className="h-full max-h-[calc(100dvh-92px)] min-h-[calc(100dvh-92px)]">
        <CommunityEventsSidebar
          calendars={DEFAULT_CALENDARS}
          visibleCalendars={visibleCalendars}
          setVisibleCalendars={setVisibleCalendars}
        />
        <div className="relative flex h-[calc(100dvh-92px)] max-h-[calc(100dvh-92px)] flex-1 flex-col gap-4 overflow-y-scroll bg-bg-weak-50 p-2">
          <EventCalendar
            className="rounded-lg ring-1 ring-stroke-soft-200"
            view={view}
            setView={setView}
            events={visibleEvents}
          />
        </div>
      </SidebarProvider>
    </>
  )
}
