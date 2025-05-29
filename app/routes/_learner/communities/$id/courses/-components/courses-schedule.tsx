import { useMemo, useState } from "react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { cn } from "@/utils/cn"
import { groupBy } from "@/utils/group-by"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCloseCircleLine,
  RiInformationLine,
  RiListUnordered,
  RiRecordCircleLine,
  RiSearchLine,
} from "@remixicon/react"
import { Command, CommandEmpty } from "cmdk"
import { format } from "date-fns"
import type { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { CommandMenu } from "@/components/ui/command-menu"
import { CompactButton } from "@/components/ui/compact-button"
import { Input } from "@/components/ui/input"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"

interface CompactCalendarProps {
  className?: string
  onDateSelect?: (date: Date) => void
  enrolments: z.infer<typeof EnrolmentsDetailSchema>[]
}

const CompactCalendar = ({
  className,
  onDateSelect,
  enrolments,
}: CompactCalendarProps) => {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getWeekStartDate(new Date())
  )

  const onlyInCompleteEnrolments = useMemo(() => {
    if (!enrolments) return []
    const now = new Date()

    return enrolments
      .filter((enrolment) => {
        if (!enrolment?.dueDate || enrolment?.currentState === "completed")
          return false

        const dueDate = new Date(enrolment.dueDate)
        const startOfSelectedDate = new Date(selectedDate.setHours(0, 0, 0, 0))
        const startOfDueDate = new Date(dueDate.setHours(0, 0, 0, 0))

        // Include if due date is the same day or after the selected date
        return startOfDueDate.getTime() >= startOfSelectedDate.getTime()
      })
      .sort((a, b) => {
        const aDate = new Date(a.dueDate ?? "")
        const bDate = new Date(b.dueDate ?? "")

        // Calculate absolute difference in milliseconds from now
        const aDiff = Math.abs(aDate.getTime() - now.getTime())
        const bDiff = Math.abs(bDate.getTime() - now.getTime())

        return aDiff - bDiff // Closest dates first
      })
  }, [enrolments, selectedDate])
  const groupedEnrolmentsByCurrentState = useMemo(() => {
    return groupBy(
      onlyInCompleteEnrolments,
      (enrolment) => enrolment.currentState
    )
  }, [onlyInCompleteEnrolments])

  function getWeekStartDate(date: Date): Date {
    const newDate = new Date(date)
    const day = newDate.getDay()
    // Adjust to Monday start (0 = Sunday, so we need to handle it specially)
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1)
    newDate.setDate(diff)
    return newDate
  }

  function getDaysInView(): Date[] {
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(weekStartDate)
      date.setDate(weekStartDate.getDate() + i)
      return date
    })
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  function navigateWeek(direction: "prev" | "next") {
    const newDate = new Date(weekStartDate)
    newDate.setDate(weekStartDate.getDate() + (direction === "next" ? 5 : -5))
    setWeekStartDate(newDate)
  }

  function navigateMonth(direction: "prev" | "next") {
    const newDate = new Date(weekStartDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setWeekStartDate(getWeekStartDate(newDate))
  }

  function formatMonth(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  function isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  function isSelected(date: Date): boolean {
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInView()

  return (
    <div
      className={cn(
        "col-span-12 flex aspect-square h-full w-full flex-col gap-4 xl:col-span-4",
        className
      )}
    >
      <h3 className="text-title-h6">Schedule</h3>
      <header className="flex w-full items-center justify-between rounded-[12px] bg-bg-weak-50 p-1.5">
        <CompactButton.Root
          variant="white"
          onClick={() => navigateMonth("prev")}
          aria-label="Previous month"
        >
          <CompactButton.Icon as={RiArrowLeftSLine} />
        </CompactButton.Root>

        <h2 className="text-lg font-medium">{formatMonth(weekStartDate)}</h2>

        <CompactButton.Root
          variant="white"
          onClick={() => navigateMonth("next")}
          aria-label="Next month"
        >
          <CompactButton.Icon as={RiArrowRightSLine} />
        </CompactButton.Root>
      </header>

      <div className="flex items-center gap-2">
        <CompactButton.Root
          onClick={() => navigateWeek("prev")}
          aria-label="Previous week"
        >
          <CompactButton.Icon as={RiArrowLeftSLine} />
        </CompactButton.Root>

        <div className="flex flex-1 justify-between gap-1">
          {days.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={cn(
                "flex min-w-[60px] flex-col items-center rounded-lg p-2 transition-all duration-200",
                "hover:bg-bg-weak-50",
                "focus:outline-none focus:ring-1 focus:ring-primary-base focus:ring-offset-1",
                isSelected(date) &&
                  "bg-primary-base text-white hover:bg-primary-dark",
                isToday(date) &&
                  !isSelected(date) &&
                  "bg-primary-alpha-10 ring-1 ring-primary-alpha-10"
              )}
            >
              <span className="text-label-xs font-normal">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="mt-1 text-label-md font-semibold">
                {date.getDate()}
              </span>
            </button>
          ))}
        </div>

        <CompactButton.Root
          onClick={() => navigateWeek("next")}
          aria-label="Next week"
        >
          <CompactButton.Icon as={RiArrowRightSLine} />
        </CompactButton.Root>
      </div>
      <div className="flex h-full flex-col">
        <Input.Root className="w-full rounded-b-none">
          <Input.Wrapper>
            <Input.Field
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
            <Input.Icon as={RiSearchLine} />
          </Input.Wrapper>
        </Input.Root>

        <Command className="h-full rounded-b-10 border-x border-b border-stroke-soft-200">
          <CommandMenu.Input
            value={search}
            onValueChange={setSearch}
            className="sr-only hidden"
          />
          <TabMenuHorizontal.Root
            value={tab}
            onValueChange={setTab}
            defaultValue="all"
            className="no-scrollbar"
          >
            <TabMenuHorizontal.List className="no-scrollbar h-10 border-y-0 border-b border-stroke-soft-200 px-3 *:text-label-sm">
              <TabMenuHorizontal.Trigger value="all">
                <TabMenuHorizontal.Icon as={RiListUnordered} />
                All
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="in-progress">
                <TabMenuHorizontal.Icon as={RiRecordCircleLine} />
                In Progress
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="not-started">
                <TabMenuHorizontal.Icon as={RiInformationLine} />
                Not Started
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="due-soon">
                <TabMenuHorizontal.Icon as={RiCloseCircleLine} />
                Due Soon
              </TabMenuHorizontal.Trigger>
            </TabMenuHorizontal.List>
          </TabMenuHorizontal.Root>
          <CommandMenu.List className="">
            <CommandEmpty className="relative flex w-full grow flex-col items-center justify-center gap-2 overflow-hidden p-3 pt-12 text-center">
              {search && (
                <RiSearchLine className="animate-bounce text-text-soft-400 opacity-80" />
              )}
              <h1 className="relative z-10 text-title-h6">No results found.</h1>
              <p className="relative z-10 text-label-sm font-light text-text-soft-400">
                {search
                  ? "Can't find what you're looking for? Make a new enrolment."
                  : "Your schedule is clear."}
              </p>
            </CommandEmpty>

            {Object.entries(groupedEnrolmentsByCurrentState).map(
              ([key, value]) => {
                if (tab !== "all" && key !== tab) return null
                return (
                  <CommandMenu.Group
                    className="capitalize"
                    heading={key.replace("-", " ")}
                  >
                    {value?.map((detail) => (
                      <CommandMenu.Item
                        key={`${key}:${detail.uid}`}
                        value={detail?.publication?.title!}
                        // className="flex items-center justify-between gap-4 rounded-10 bg-bg-weak-50 p-3 ring-0"
                      >
                        <div className="flex w-full grow flex-col gap-1">
                          <h4 className="text-label-md font-medium">
                            {detail.publication.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {detail?.dueDate && (
                              <p className="text-label-xs text-text-sub-600">
                                {format(
                                  new Date(detail?.dueDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge.Root
                          variant="filled"
                          {...(detail?.currentState === "completed" && {
                            color: "green",
                          })}
                          {...(detail?.currentState === "in-progress" && {
                            color: "blue",
                          })}
                          {...(detail?.currentState === "not-started" && {
                            color: "gray",
                          })}
                          {...(detail?.currentState === "failed" && {
                            color: "red",
                          })}
                          size="medium"
                          className="shrink-0 capitalize"
                        >
                          {detail?.currentState === "completed" && (
                            <Badge.Icon as={RiCheckboxCircleFill} />
                          )}
                          {detail?.currentState === "in-progress" && (
                            <Badge.Icon as={RiRecordCircleLine} />
                          )}
                          {detail?.currentState === "failed" && (
                            <Badge.Icon as={RiCloseCircleFill} />
                          )}
                          {detail?.currentState.replace("-", " ")}
                        </Badge.Root>
                      </CommandMenu.Item>
                    ))}
                  </CommandMenu.Group>
                )
              }
            )}
          </CommandMenu.List>
        </Command>
      </div>
    </div>
  )
}

export default CompactCalendar
