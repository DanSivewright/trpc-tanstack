"use client"

import { useEffect, useMemo, useState } from "react"
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"

import { cn } from "@/lib/utils"
// import Participants from "@/components/participants"
// import ThemeToggle from "@/components/theme-toggle"

import { useNotification } from "@/hooks/use-notification"
// import {
//   ChevronDownIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
// } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView,
  type CalendarEvent,
  type CalendarView,
} from "@/components/event-calendar"

import { Avatar } from "../ui/avatar"
import { AvatarGroupCompact } from "../ui/avatar-group-compact"
import { Dropdown } from "../ui/dropdown"
import { Kbd } from "../ui/kbd"
import { useCalendarContext } from "./calendar-context"

export interface EventCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  className?: string
  initialView?: CalendarView
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
}: EventCalendarProps) {
  // Use the shared calendar context instead of local state
  const { currentDate, setCurrentDate } = useCalendarContext()
  const [view, setView] = useState<CalendarView>(initialView)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const { open } = useSidebar()
  const { notification } = useNotification()

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month")
          break
        case "w":
          setView("week")
          break
        case "d":
          setView("day")
          break
        case "a":
          setView("agenda")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEventDialogOpen])

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, AgendaDaysToShow))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event) // Debug log
    setSelectedEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleEventCreate = (startTime: Date) => {
    console.log("Creating new event at:", startTime) // Debug log

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes()
    const remainder = minutes % 15
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder)
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder))
      }
      startTime.setSeconds(0)
      startTime.setMilliseconds(0)
    }

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    }
    setSelectedEvent(newEvent)
    setIsEventDialogOpen(true)
  }

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event)
      // Show toast notification when an event is updated
      notification({
        title: `Event "${event.title}" updated`,
        description: format(new Date(event.start), "MMM d, yyyy"),
        variant: "stroke",
      })
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      })
      // Show toast notification when an event is added

      notification({
        title: `Event "${event.title}" added`,
        description: format(new Date(event.start), "MMM d, yyyy"),
        variant: "stroke",
      })
    }
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId)
    onEventDelete?.(eventId)
    setIsEventDialogOpen(false)
    setSelectedEvent(null)

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      notification({
        title: `Event "${deletedEvent.title}" deleted`,
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        variant: "stroke",
        status: "error",
      })
    }
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent)

    // Show toast notification when an event is updated via drag and drop
    notification({
      title: `Event "${updatedEvent.title}" moved`,
      description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
      variant: "stroke",
      status: "information",
    })
  }

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else if (view === "day") {
      return (
        <>
          <span className="min-sm:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="min-md:hidden max-sm:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      )
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate
      const end = addDays(currentDate, AgendaDaysToShow - 1)

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, view])

  return (
    <div
      className="has-data-[slot=month-view]:flex-1 flex flex-col rounded-lg"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            "flex flex-col justify-between gap-2 py-5 sm:flex-row sm:items-center sm:px-4",
            className
          )}
        >
          <div className="flex justify-between gap-1.5 max-sm:items-center sm:flex-col">
            <div className="flex items-center gap-1.5">
              <SidebarTrigger
                data-state={open ? "invisible" : "visible"}
                className="peer transition-opacity duration-200 ease-in-out sm:-ms-1.5 lg:data-[state=invisible]:pointer-events-none lg:data-[state=invisible]:opacity-0"
                isOutsideSidebar={true}
              />
              <h2 className="text-label-xl font-semibold transition-transform duration-300 ease-in-out lg:peer-data-[state=invisible]:-translate-x-8">
                {viewTitle}
              </h2>
            </div>
            <AvatarGroupCompact.Root size="24" className="shadow-none">
              <AvatarGroupCompact.Stack className="shadow-none">
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/emma.png" />
                </Avatar.Root>
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                </Avatar.Root>
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/sophia.png" />
                </Avatar.Root>
              </AvatarGroupCompact.Stack>
              <AvatarGroupCompact.Overflow>+9</AvatarGroupCompact.Overflow>
            </AvatarGroupCompact.Root>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center max-sm:order-1 sm:gap-2">
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="xsmall"
                  onClick={handlePrevious}
                  aria-label="Previous"
                >
                  <Button.Icon as={RiArrowLeftSLine} aria-hidden="true" />
                </Button.Root>
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="xsmall"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <Button.Icon as={RiArrowRightSLine} aria-hidden="true" />
                </Button.Root>
              </div>
              <Button.Root size="xsmall" onClick={handleToday}>
                Today
              </Button.Root>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button.Root
                variant="neutral"
                mode="stroke"
                size="xsmall"
                // variant="outline"
                // className="max-sm:px-2.5! max-sm:h-8"
                onClick={() => {
                  setSelectedEvent(null) // Ensure we're creating a new event
                  setIsEventDialogOpen(true)
                }}
              >
                New Event
              </Button.Root>
              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <Button.Root variant="neutral" mode="stroke" size="xsmall">
                    <span className="capitalize">{view}</span>
                    <Button.Icon as={RiArrowDownSLine} aria-hidden="true" />
                  </Button.Root>
                </Dropdown.Trigger>
                <Dropdown.Content align="end" className="min-w-32">
                  <Dropdown.Item
                    className="justify-between"
                    onClick={() => setView("month")}
                  >
                    Month <Kbd.Root>M</Kbd.Root>
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="justify-between"
                    onClick={() => setView("week")}
                  >
                    Week <Kbd.Root>W</Kbd.Root>
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="justify-between"
                    onClick={() => setView("day")}
                  >
                    Day <Kbd.Root>D</Kbd.Root>
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="justify-between"
                    onClick={() => setView("agenda")}
                  >
                    Agenda <Kbd.Root>A</Kbd.Root>
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Root>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false)
            setSelectedEvent(null)
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  )
}
