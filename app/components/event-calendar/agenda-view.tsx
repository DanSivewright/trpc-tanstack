import { useMemo } from "react"
import { RiCalendarEventLine } from "@remixicon/react"
import { addDays, format, isToday } from "date-fns"

import {
  AgendaDaysToShow,
  EventItem,
  getAgendaEventsForDay,
  type CalendarEvent,
} from "@/components/event-calendar"

interface AgendaViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
}

export function AgendaView({
  currentDate,
  events,
  onEventSelect,
}: AgendaViewProps) {
  // Show events for the next days based on constant
  const days = useMemo(() => {
    console.log("Agenda view updating with date:", currentDate.toISOString())
    return Array.from({ length: AgendaDaysToShow }, (_, i) =>
      addDays(new Date(currentDate), i)
    )
  }, [currentDate])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Agenda view event clicked:", event)
    onEventSelect(event)
  }

  // Check if there are any days with events
  const hasEvents = days.some(
    (day) => getAgendaEventsForDay(events, day).length > 0
  )

  return (
    <div className="border-border/70 border-t ps-4">
      {!hasEvents ? (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
          <RiCalendarEventLine
            size={32}
            className="mb-2 text-text-disabled-300"
          />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-text-soft-400">
            There are no events scheduled for this time period.
          </p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getAgendaEventsForDay(events, day)

          if (dayEvents.length === 0) return null

          return (
            <div
              key={day.toString()}
              className="border-border/70 relative my-12 border-t"
            >
              <span
                className="absolute -top-3 left-0 flex h-6 items-center bg-bg-white-0 pe-4 text-[10px] uppercase data-[today=true]:font-medium sm:pe-4 sm:text-label-xs"
                data-today={isToday(day) || undefined}
              >
                {format(day, "d MMM, EEEE")}
              </span>
              <div className="mt-6 space-y-2">
                {dayEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    view="agenda"
                    onClick={(e) => handleEventClick(event, e)}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
