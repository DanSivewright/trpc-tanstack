import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/utils/cn"
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
import {
  DraggableEvent,
  DroppableCell,
  EventGap,
  EventHeight,
  EventItem,
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  sortEvents,
  useEventVisibility,
  type CalendarEvent,
} from "@/components/event-calendar"
import { DefaultStartHour } from "@/components/event-calendar/constants"

import { Popover } from "../ui/popover"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const weekdays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek(new Date()), i)
      return format(date, "EEE")
    })
  }, [])

  const weeks = useMemo(() => {
    const result = []
    let week = []

    for (let i = 0; i < days.length; i++) {
      week.push(days[i])
      if (week.length === 7 || i === days.length - 1) {
        result.push(week)
        week = []
      }
    }

    return result
  }, [days])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const [isMounted, setIsMounted] = useState(false)
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div data-slot="month-view" className="contents">
      <div className="border-border/70 grid grid-cols-7 border-y uppercase">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-label-xs text-text-soft-400"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div
            key={`week-${weekIndex}`}
            className="grid grid-cols-7 [&:last-child>*]:border-b-0"
          >
            {week.map((day, dayIndex) => {
              if (!day) return null // Skip if day is undefined

              const dayEvents = getEventsForDay(events, day)
              const spanningEvents = getSpanningEventsForDay(events, day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const cellId = `month-cell-${day.toISOString()}`
              const allDayEvents = [...spanningEvents, ...dayEvents]
              const allEvents = getAllEventsForDay(events, day)

              const isReferenceCell = weekIndex === 0 && dayIndex === 0
              const visibleCount = isMounted
                ? getVisibleEventCount(allDayEvents.length)
                : undefined
              const hasMore =
                visibleCount !== undefined && allDayEvents.length > visibleCount
              const remainingCount = hasMore
                ? allDayEvents.length - visibleCount
                : 0

              return (
                <div
                  key={day.toString()}
                  className="border-border/70 group border-b border-r last:border-r-0 data-[outside-cell=true]:bg-white-alpha-24 data-[outside-cell=true]:text-text-soft-400"
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <DroppableCell
                    id={cellId}
                    date={day}
                    onClick={() => {
                      const startTime = new Date(day)
                      startTime.setHours(DefaultStartHour, 0, 0)
                      onEventCreate(startTime)
                    }}
                  >
                    <div
                      className={cn(
                        "text-sm mt-1 inline-flex size-6 items-center justify-center rounded-full",
                        {
                          "bg-primary-base text-white": isToday(day),
                        }
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    <div
                      ref={isReferenceCell ? contentRef : null}
                      className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        const isFirstDay = isSameDay(day, eventStart)
                        const isLastDay = isSameDay(day, eventEnd)

                        const isHidden =
                          isMounted && visibleCount && index >= visibleCount

                        if (!visibleCount) return null

                        if (!isFirstDay) {
                          return (
                            <div
                              key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
                              className="aria-hidden:hidden"
                              aria-hidden={isHidden ? "true" : undefined}
                            >
                              <EventItem
                                onClick={(e) => handleEventClick(event, e)}
                                event={event}
                                view="month"
                                isFirstDay={isFirstDay}
                                isLastDay={isLastDay}
                              >
                                <div className="invisible" aria-hidden={true}>
                                  {!event.allDay && (
                                    <span>
                                      {format(
                                        new Date(event.start),
                                        "h:mm"
                                      )}{" "}
                                    </span>
                                  )}
                                  {event.title}
                                </div>
                              </EventItem>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={event.id}
                            className="aria-hidden:hidden"
                            aria-hidden={isHidden ? "true" : undefined}
                          >
                            <DraggableEvent
                              event={event}
                              view="month"
                              onClick={(e: React.MouseEvent) =>
                                handleEventClick(event, e)
                              }
                              isFirstDay={isFirstDay}
                              isLastDay={isLastDay}
                            />
                          </div>
                        )
                      })}

                      {hasMore && (
                        <Popover.Root modal>
                          <Popover.Trigger asChild>
                            <button
                              className="focus-visible:border-ring focus-visible:ring-ring/50 mt-[var(--event-gap)] flex h-[var(--event-height)] w-full select-none items-center overflow-hidden rounded-sm px-1 text-left text-[10px] text-text-soft-400 outline-none backdrop-blur-md transition hover:bg-bg-weak-50 hover:text-text-sub-600 focus-visible:ring-[3px] sm:px-2 sm:text-label-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>
                                + {remainingCount}{" "}
                                <span className="max-sm:sr-only">more</span>
                              </span>
                            </button>
                          </Popover.Trigger>
                          <Popover.Content
                            sideOffset={0}
                            showArrow={false}
                            align="center"
                            className="max-w-52 p-3"
                            style={
                              {
                                "--event-height": `${EventHeight}px`,
                              } as React.CSSProperties
                            }
                          >
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                {format(day, "EEE d")}
                              </div>
                              <div className="space-y-1">
                                {sortEvents(allEvents).map((event) => {
                                  const eventStart = new Date(event.start)
                                  const eventEnd = new Date(event.end)
                                  const isFirstDay = isSameDay(day, eventStart)
                                  const isLastDay = isSameDay(day, eventEnd)

                                  return (
                                    <EventItem
                                      key={event.id}
                                      onClick={(e) =>
                                        handleEventClick(event, e)
                                      }
                                      event={event}
                                      view="month"
                                      isFirstDay={isFirstDay}
                                      isLastDay={isLastDay}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          </Popover.Content>
                        </Popover.Root>
                      )}
                    </div>
                  </DroppableCell>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
