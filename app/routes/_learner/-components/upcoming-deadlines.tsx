import { useEffect, useMemo, useState } from "react"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { RiCalendarLine } from "@remixicon/react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  isThisWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import type { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as Datepicker from "@/components/ui/datepicker"
import { Kbd } from "@/components/ui/kbd"
import { Popover } from "@/components/ui/popover"
import { Grid } from "@/components/grid"

type Props = {
  enrolments: z.infer<typeof EnrolmentsDetailSchema>[]
}

const presets = [
  {
    label: "Today",
    from: startOfDay(new Date()).toISOString(),
    to: endOfDay(new Date()).toISOString(),
    shortcut: "d", // day
  },
  {
    label: "Yesterday",
    from: startOfDay(addDays(new Date(), -1)).toISOString(),
    to: endOfDay(addDays(new Date(), -1)).toISOString(),
    shortcut: "y",
  },
  {
    label: "This Week",
    from: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    shortcut: "w",
  },

  {
    label: "This Month",
    from: startOfMonth(new Date()).toISOString(),
    to: endOfMonth(new Date()).toISOString(),
    shortcut: "m",
  },
]

const UpcomingDeadlines: React.FC<Props> = ({ enrolments }) => {
  const [open, setOpen] = useState(false)

  const navigate = useNavigate({ from: "/" })
  const { dr } = useSearch({ from: "/_learner/" })

  const sortedEnrolments = useMemo(() => {
    return enrolments
      .filter(
        (e) =>
          e.dueDate &&
          e.dueDate !== "" &&
          e?.currentState !== "completed" &&
          isWithinInterval(new Date(e.dueDate), {
            start: startOfDay(dr?.start),
            end: endOfDay(dr?.end),
          })
      )
      .sort((a, b) => {
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      })
  }, [enrolments, dr?.start, dr?.end])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      presets.map((preset) => {
        if (preset.shortcut === e.key) {
          navigate({
            search: (old) => ({
              ...old,
              dr: {
                ...old.dr,
                start: preset.from,
                end: preset.to,
                mode: preset.shortcut,
              },
            }),
          })
          setOpen(false)
        }
      })
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="col-span-12 flex flex-col gap-3 xl:col-span-7">
      <header className="flex items-center justify-between">
        <h3 className="text-title-h6">Upcoming Deadlines</h3>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button.Root size="xxsmall" variant="neutral" mode="ghost">
              <span>
                {presets.find((p) => p.shortcut === dr.mode)?.label || (
                  <>
                    {format(new Date(dr.start), "MMM d")} -{" "}
                    {format(new Date(dr.end), "MMM d")}
                  </>
                )}
              </span>
              <Button.Icon as={RiCalendarLine} />
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
                  {presets.map(({ label, shortcut, from, to }) => {
                    const isActive = dr?.start === from && dr?.end === to
                    return (
                      <Button.Root
                        key={label}
                        mode={isActive ? "stroke" : "ghost"}
                        variant="neutral"
                        size="xsmall"
                        onClick={() => {
                          navigate({
                            resetScroll: false,
                            search: (old) => ({
                              ...old,
                              dr: {
                                ...old.dr,
                                start: from,
                                end: to,
                                mode: shortcut,
                              },
                            }),
                          })
                          setOpen(false)
                        }}
                      >
                        <span className="mr-auto">{label}</span>
                        <Kbd.Root className="uppercase">{shortcut}</Kbd.Root>
                      </Button.Root>
                    )
                  })}
                </div>
              </div>
              <Datepicker.Calendar
                initialFocus
                mode="range"
                defaultMonth={dr.start ? new Date(dr.start) : undefined}
                selected={
                  dr?.mode === "custom"
                    ? {
                        from: dr.start ? new Date(dr.start) : undefined,
                        to: dr.end ? new Date(dr.end) : undefined,
                      }
                    : undefined
                }
                onSelect={(dates) => {
                  navigate({
                    resetScroll: false,
                    search: (old) => ({
                      ...old,
                      dr: {
                        ...old.dr,
                        start: dates?.from?.toISOString() || "",
                        end: dates?.to?.toISOString()
                          ? dates?.to?.toISOString()
                          : dates?.from?.toISOString() || "",
                        mode: "custom",
                      },
                    }),
                  })
                }}
                numberOfMonths={1}
              />
            </div>
          </Popover.Content>
        </Popover.Root>
      </header>
      {sortedEnrolments && sortedEnrolments?.length ? (
        <Grid gap="none" className="w-full gap-2">
          {sortedEnrolments?.slice(0, 5).map((enrolment) => {
            return (
              <div
                key={`upcoming-${enrolment?.uid}`}
                className="col-span-4 flex aspect-[1/1.05] flex-col overflow-hidden rounded-10 bg-bg-weak-50 ring-[1px] ring-stroke-sub-300/65 drop-shadow-xl"
              >
                <div className="relative h-[85%] w-full bg-pink-50">
                  <Badge.Root
                    size="small"
                    className="absolute left-2 top-2 z-10"
                    {...(enrolment?.currentState === "in-progress" && {
                      color: "blue",
                    })}
                    {...(enrolment?.currentState === "not-started" && {
                      color: "gray",
                    })}
                  >
                    {enrolment?.currentState.replace("-", " ")}
                  </Badge.Root>
                  {enrolment?.publication?.featureImageUrl && (
                    <img
                      src={enrolment?.publication?.featureImageUrl}
                      alt={enrolment?.publication?.title || ""}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="bg-bg-white-0 p-3">
                  <p className="line-clamp-1">
                    {enrolment?.publication?.title}
                  </p>
                  <p className="text-paragraph-xs font-normal text-text-soft-400">
                    {isThisWeek(new Date(enrolment?.dueDate!))
                      ? `Due in ${formatDistance(new Date(enrolment?.dueDate!), new Date())}`
                      : `Due ${format(new Date(enrolment?.dueDate!), "MMM d")}`}
                  </p>
                </div>
              </div>
            )
          })}

          {sortedEnrolments?.length > 5 && (
            <div className="col-span-4 flex aspect-[1/1.05] items-center justify-center rounded-10 bg-primary-base text-center text-static-white">
              <span className="text-paragraph-sm font-normal">
                +{sortedEnrolments?.length - 5} more
              </span>
            </div>
          )}
        </Grid>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-10 bg-bg-weak-50 text-center">
          <span className="text-title-h4">🎉</span>
          <h3 className="font-mono text-title-h4">No upcoming deadlines</h3>
          <p className="text-pretty text-paragraph-sm font-normal">
            No deadlines for this range. Feel free to learn at your own pace.
          </p>
        </div>
      )}
    </div>
  )
}
export default UpcomingDeadlines
