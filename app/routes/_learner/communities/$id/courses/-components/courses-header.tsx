import { useEffect, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { groupBy } from "@/utils/group-by"
import { RiArrowDownSLine } from "@remixicon/react"
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query"
import { differenceInHours, format, isBefore } from "date-fns"
import { Bar, BarChart, XAxis } from "recharts"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Datepicker } from "@/components/ui/datepicker"
import { Kbd } from "@/components/ui/kbd"
import { Popover } from "@/components/ui/popover"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/chart"
import { Grid } from "@/components/grid"
import { NumberTicker } from "@/components/number-ticker"

type Props = {
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
}

const presets = [
  {
    label: "Today",
    shortcut: "d",
  },
  {
    label: "This Week",
    shortcut: "w",
  },
  {
    label: "This Month",
    shortcut: "m",
  },
  {
    label: "This Year",
    shortcut: "y",
  },
] as const

const CoursesHeader: React.FC<Props> = ({ activity }) => {
  const [range, setRange] = useLocalStorage<"d" | "w" | "m" | "y" | string[]>({
    key: "learner-communities-courses-range",
    defaultValue: "m",
  })
  const [rangeSelectorOpen, setRangeSelectorOpen] = useState(false)

  const progressComplete = useMemo(() => {
    return Math.round(
      Array.from(activity.progress.values()).reduce(
        (acc, curr) => acc + curr,
        0
      ) / activity.progress.size
    )
  }, [activity.progress])

  const chartData = useMemo(() => {
    if (!activity.flat) return []

    const now = new Date()
    let startDate: Date
    let endDate: Date
    let groupingFormat: string

    // Determine date range and grouping format based on range type
    if (Array.isArray(range)) {
      startDate = new Date(range[0])
      endDate = new Date(range[1])
      const diffInHours = differenceInHours(endDate, startDate)

      if (diffInHours <= 24) {
        groupingFormat = "HH:00" // Hours for single day
      } else if (diffInHours <= 168) {
        // 7 days
        groupingFormat = "EEE" // Days for week
      } else if (diffInHours <= 744) {
        // ~31 days
        groupingFormat = "week" // Group by weeks for month
      } else {
        groupingFormat = "MMMM" // Months for longer periods
      }
    } else {
      switch (range) {
        case "d":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          )
          groupingFormat = "HH:00"
          break
        case "w":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - now.getDay()
          )
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + (6 - now.getDay())
          )
          groupingFormat = "EEE"
          break
        case "m":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          groupingFormat = "week" // Changed to group by weeks
          break
        case "y":
        default:
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          groupingFormat = "MMMM"
          break
      }
    }

    // Create array of all periods based on grouping format
    type Period = string | { display: string; start: Date; end: Date }
    const periods: Period[] = []
    let currentDate = new Date(startDate)

    if (groupingFormat === "week") {
      // For weekly grouping in a month, start from the 1st of the month
      const firstDayOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      )
      const lastDayOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      )

      // Set currentDate to the start of the first week
      currentDate = new Date(firstDayOfMonth)

      while (currentDate.getTime() <= lastDayOfMonth.getTime()) {
        const weekStart = format(currentDate, "d")
        const weekEndDate = new Date(currentDate)
        weekEndDate.setDate(weekEndDate.getDate() + 6)

        // Ensure we don't go beyond the month
        const actualEndDate = new Date(
          Math.min(weekEndDate.getTime(), lastDayOfMonth.getTime())
        )

        const weekEnd = format(actualEndDate, "d")
        const monthLabel = format(currentDate, "MMM")

        // Store both the display string and the date range for accurate activity grouping
        periods.push({
          display: `${weekStart} - ${weekEnd} ${monthLabel}`,
          start: new Date(currentDate),
          end: new Date(actualEndDate.setHours(23, 59, 59, 999)),
        })

        // Move to next week's start
        currentDate.setDate(currentDate.getDate() + 7)
      }
    } else {
      while (
        isBefore(currentDate, endDate) ||
        format(currentDate, groupingFormat) === format(endDate, groupingFormat)
      ) {
        const formattedPeriod = format(currentDate, groupingFormat)
        if (!periods.includes(formattedPeriod)) {
          periods.push(formattedPeriod)
        }

        // Increment based on grouping format
        if (groupingFormat === "HH:00") {
          currentDate = new Date(
            currentDate.setHours(currentDate.getHours() + 1)
          )
        } else if (groupingFormat === "EEE") {
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
        } else {
          currentDate = new Date(
            currentDate.setMonth(currentDate.getMonth() + 1)
          )
        }
      }
    }

    // Create a map to store activities by period
    const activitiesByPeriod = new Map<string, EnrolmentActivityType[]>(
      periods.map((period) => [
        typeof period === "string" ? period : period.display,
        [],
      ])
    )

    // Process each activity and group by period
    activity.flat.forEach((activity) => {
      if (!activity.context?.completedAt) return

      const activityDate = new Date(activity.context.completedAt)
      // Only include activities within the selected range
      if (isBefore(activityDate, startDate) || isBefore(endDate, activityDate))
        return

      let periodKey: string
      if (groupingFormat === "week") {
        // Find the matching week period for this activity
        const matchingPeriod = periods.find(
          (period): period is { display: string; start: Date; end: Date } => {
            if (typeof period === "string") return false
            const activityTime = activityDate.getTime()
            return (
              activityTime >= period.start.getTime() &&
              activityTime <= period.end.getTime()
            )
          }
        )
        periodKey =
          matchingPeriod?.display || (periods[0] as { display: string }).display
      } else {
        periodKey = format(activityDate, groupingFormat)
      }

      activitiesByPeriod.get(periodKey)?.push(activity)
    })

    // Convert the map to the desired format, maintaining period order
    return periods.map((period) => {
      const periodKey = typeof period === "string" ? period : period.display
      const activities = activitiesByPeriod.get(periodKey) || []
      const groupedAct = groupBy(
        activities,
        (activity: EnrolmentActivityType) => activity.type
      )

      return {
        period: periodKey,
        ...Object.entries(groupedAct).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.length,
          }),
          {
            // lesson: 0,
            // module: 0,
            // assessment: 0,
            // assignment: 0,
            // card: 0,
          }
        ),
      }
    })
  }, [activity.flat, range])

  const chartConfig = {
    lesson: {
      label: "Lessons",
      color: "rgb(var(--stable-base))",
    },
    module: {
      label: "Modules",
      color: "rgb(var(--feature-base))",
    },
    assessment: {
      label: "Assessments",
      color: "rgb(var(--away-base))",
    },
    card: {
      label: "Cards",
      color: "rgb(var(--information-base))",
    },
  } satisfies ChartConfig

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      presets.map((preset) => {
        if (preset.shortcut === e.key) {
          setRange(preset.shortcut)
          setRangeSelectorOpen(false)
        }
      })
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (
      range &&
      Array.isArray(range) &&
      range.some((date) => !date || date === "")
    ) {
      setRange("m")
    }
  }, [range])
  return (
    <header className="gutter h-[calc(50vh-92px)] bg-bg-soft-200">
      <Grid className="h-full w-full py-6 pb-10">
        <div className="col-span-12 flex h-full flex-col justify-between gap-8 xl:col-span-4">
          <h1 className="text-pretty text-title-h2 font-normal">
            Keep <span className="opacity-45">Your</span>
            <br /> Learning Going
          </h1>
          <div className="flex w-full flex-col pb-5">
            <p className="leading-none opacity-45">Learning Completed</p>
            <p className="shrink-0 whitespace-pre-wrap text-[10rem] leading-none text-text-strong-950">
              <NumberTicker
                className="text-text-strong-950"
                value={progressComplete}
              />
              %
            </p>
          </div>
        </div>
        <div className="col-span-12 hidden h-full flex-col xl:col-span-8 xl:flex">
          <header className="flex items-end justify-between gap-3">
            <h2 className="text-title-h5">Activity</h2>
            <div className="flex items-center gap-3">
              <Popover.Root
                open={rangeSelectorOpen}
                onOpenChange={setRangeSelectorOpen}
              >
                <Popover.Trigger asChild>
                  <Button.Root
                    variant="neutral"
                    mode="lighter"
                    size="xxsmall"
                    className="rounded-full"
                  >
                    <span>
                      {typeof range === "string" &&
                      presets.find((r) => r.shortcut === range) ? (
                        presets.find((r) => r.shortcut === range)?.label
                      ) : Array.isArray(range) ? (
                        <>
                          {range
                            ?.map((r) => format(new Date(r), "MMM d"))
                            .join(" - ")}
                        </>
                      ) : (
                        ""
                      )}
                    </span>
                    <Button.Icon as={RiArrowDownSLine} />
                  </Button.Root>
                </Popover.Trigger>
                <Popover.Content
                  showArrow={false}
                  sideOffset={5}
                  className="w-auto p-0"
                  align="end"
                >
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2 p-3">
                      <p className="mx-3 text-label-xs uppercase text-text-soft-400">
                        Date Range
                      </p>
                      <div className="grid gap-1">
                        {presets.map(({ label, shortcut }) => {
                          const isActive = shortcut === range
                          return (
                            <Button.Root
                              key={label}
                              mode={isActive ? "stroke" : "ghost"}
                              variant="neutral"
                              size="xsmall"
                              onClick={() => {
                                setRange(shortcut)
                                setRangeSelectorOpen(false)
                              }}
                            >
                              <span className="mr-auto">{label}</span>
                              <Kbd.Root className="uppercase">
                                {shortcut}
                              </Kbd.Root>
                            </Button.Root>
                          )
                        })}
                      </div>
                    </div>
                    <Datepicker.Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={new Date()}
                      selected={
                        Array.isArray(range)
                          ? {
                              from: range[0] ? new Date(range[0]) : undefined,
                              to: range[1] ? new Date(range[1]) : undefined,
                            }
                          : undefined
                      }
                      onSelect={(dates) => {
                        setRange([
                          dates?.from?.toISOString()
                            ? dates?.from?.toISOString()
                            : dates?.to?.toISOString() || "",
                          dates?.to?.toISOString()
                            ? dates?.to?.toISOString()
                            : dates?.from?.toISOString() || "",
                        ])
                      }}
                      numberOfMonths={1}
                    />
                  </div>
                </Popover.Content>
              </Popover.Root>
            </div>
          </header>
          <div className="w-full grow">
            <ChartContainer
              config={chartConfig}
              className="max-h-[300px] min-h-[calc(50vh-184px)] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    // For hours format (13:00)
                    if (value.includes(":")) return value

                    // For week ranges (1 May-7 May)
                    if (value.includes("-")) return value

                    // For month names or weekday names (already short format)
                    return value.slice(0, 3)
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

                <Bar
                  stackId="a"
                  dataKey="lesson"
                  fill="var(--color-lesson)"
                  // radius={[0, 0, 4, 4]}
                />
                <Bar
                  stackId="a"
                  dataKey="assessment"
                  fill="var(--color-assessment)"
                />
                <Bar stackId="a" dataKey="card" fill="var(--color-card)" />
                <Bar
                  // radius={[4, 4, 0, 0]}
                  stackId="a"
                  dataKey="module"
                  fill="var(--color-module)"
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </Grid>
    </header>
  )
}
export default CoursesHeader
