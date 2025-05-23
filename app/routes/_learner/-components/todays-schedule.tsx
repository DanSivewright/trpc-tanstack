import { useCallback, useMemo } from "react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { cn } from "@/utils/cn"
import { RiLockLine } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import { addMinutes, format } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { LinkButton } from "@/components/ui/link-button"

type Props = {
  enrolment?: z.infer<typeof EnrolmentsDetailSchema>
  activityMap?: Map<string, EnrolmentActivityType>
}

type TimeSlot = {
  uid: string
  start: Date
  end: Date
  title: string
}

const TodaysSchedule: React.FC<Props> = ({ enrolment, activityMap }) => {
  if (!enrolment) return null

  const flatLearning = useMemo(() => {
    return enrolment?.publication?.material?.flatMap((m) => m.learning)
  }, [enrolment])

  const allLearningAfterFirstCompleted = useMemo(() => {
    const indexOfFirstInProgress = flatLearning?.findIndex(
      (l) => activityMap?.get(l.uid)?.status !== "completed"
    )
    return flatLearning?.slice(indexOfFirstInProgress)
  }, [flatLearning, activityMap])

  const timeSlots = useMemo(() => {
    if (!allLearningAfterFirstCompleted?.length) return []

    const now = new Date()
    // Round to next 30 minute interval
    const minutes = now.getMinutes()
    let currentTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      minutes <= 30 ? 30 : 0,
      0,
      0
    )

    if (minutes > 30) {
      currentTime.setHours(currentTime.getHours() + 1)
    }

    const slots: TimeSlot[] = []

    allLearningAfterFirstCompleted.forEach((lesson, index) => {
      // Get duration in minutes (default 30 if not specified)
      const durationMinutes = lesson.duration?.minutes ?? 30

      // Create time slot
      const start = index === 0 ? currentTime : addMinutes(currentTime, 5) // Add 5 min break after first lesson
      const end = addMinutes(start, durationMinutes)

      slots.push({
        start,
        end,
        uid: lesson.uid,
        title: lesson.title || "",
      })

      // Update current time for next iteration
      currentTime = end
    })

    return slots
  }, [allLearningAfterFirstCompleted])

  return (
    <div className="col-span-12 flex flex-col gap-3 rounded-10 xl:col-span-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar.Root placeholderType="company" size="40">
            <Avatar.Image
              src={enrolment?.publication?.featureImageUrl || undefined}
            />
          </Avatar.Root>

          <div className="flex flex-col">
            <h3 className="text-title-h6">Today's Schedule</h3>
            <p className="text-label-xs text-text-soft-400">
              {enrolment?.publication?.title}
            </p>
          </div>
        </div>
      </header>
      <ul className="relative flex h-[38vh] flex-1 flex-col">
        {timeSlots.slice(0, 8).map((slot, index) => {
          let color
          switch (activityMap?.get(slot.uid)?.status) {
            case "completed":
              color = "bg-green-500"
              break
            case "in-progress":
              color = "bg-blue-500"
              break
            case "not-started":
              color = "bg-gray-500"
              break
            case "failed":
              color = "bg-red-500"
              break
            default:
              color = "bg-gray-500"
              break
          }
          const isLocked =
            enrolment?.publication?.completeLearningInOrder &&
            activityMap?.get(slot.uid)?.status !== "completed" &&
            activityMap?.get(slot.uid)?.status !== "in-progress"
          return (
            <li
              key={index + slot.uid + "schedule"}
              className={cn(
                "flex w-full grow items-center justify-between gap-8 border-b border-stroke-soft-200",
                {
                  "max-h-11": timeSlots.length < 8,
                }
              )}
            >
              <p className="shrink-0 text-label-xs text-text-soft-400">
                {format(slot.start, "HH:mm")} - {format(slot.end, "HH:mm")}
              </p>
              <div className="flex items-center gap-2">
                {isLocked && (
                  <RiLockLine className="size-3 fill-warning-base" />
                )}
                <span className="relative flex size-1.5">
                  {color === "bg-blue-500" && (
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                        color
                      )}
                    ></span>
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-1.5 rounded-full",
                      color
                    )}
                  ></span>
                </span>
                <LinkButton.Root
                  asChild
                  variant={isLocked ? "gray" : "primary"}
                  underline={!isLocked}
                >
                  <Link
                    className="truncate text-right text-label-sm font-medium"
                    to="/"
                    disabled={isLocked}
                  >
                    {/* <p className="truncate text-right text-label-sm font-medium">
                      {slot.title}
                    </p> */}
                    {slot.title}
                  </Link>
                </LinkButton.Root>
              </div>
            </li>
          )
        })}
        {timeSlots.length > 8 && (
          <li
            className={cn(
              "flex w-full grow items-center justify-center gap-8 border-b border-stroke-soft-200"
            )}
          >
            <p className="text-label-xs text-primary-base">
              {timeSlots?.length - 8} Remaining Lessons
            </p>
          </li>
        )}
      </ul>
    </div>
  )
}
export default TodaysSchedule
