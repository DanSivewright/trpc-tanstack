import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBook2Line,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiErrorWarningFill,
  RiExternalLinkLine,
  RiHeading,
  RiLoaderLine,
  RiRecordCircleLine,
  RiTableLine,
} from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/table-core"
import {
  addDays,
  addMonths,
  addYears,
  endOfDay,
  format,
  isBefore,
  isThisYear,
  isToday,
  isWithinInterval,
  startOfDay,
} from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CompactButton } from "@/components/ui/compact-button"
import { StarRating } from "@/components/ui/svg-rating-icons"

import { filterFn } from "./filters"
import { highlightText } from "./highlight-text"

type Material = z.infer<
  typeof EnrolmentsDetailSchema
>["publication"]["material"][number]

type ColumnType = {
  uid: string
  title: string
  status: string
  dueDate: string | null
  topics: string[]
  enrolledAt: string
  startedAt: string | null
  completedAt: string | null
  rating: number | null
  type: string
  createdAt: string
  progress?: number
  enrolment?: z.infer<typeof EnrolmentsDetailSchema>
  material?: Material
  subRows?: ColumnType[]
}
export function getModuleDueDate(
  dueDate: Material["dueDate"],
  enrolledAt?: string
) {
  if (!dueDate) return ""
  if ("fixed" in dueDate) return dueDate.fixed
  if ("dueDuration" in dueDate && "dueMeasurement" in dueDate) {
    if (!enrolledAt) return ""
    switch (dueDate.dueMeasurement) {
      case "days":
        return endOfDay(
          addDays(new Date(enrolledAt), parseInt(dueDate?.dueDuration))
        ).toISOString()
      case "months":
        return endOfDay(
          addMonths(new Date(enrolledAt), parseInt(dueDate?.dueDuration))
        ).toISOString()
      case "years":
        return endOfDay(
          addYears(new Date(enrolledAt), parseInt(dueDate?.dueDuration))
        ).toISOString()

      default:
        break
    }
  }
  return ""
}

export function formatModule(
  m: Material,
  parent: ColumnType,
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
): ColumnType {
  return {
    uid: m?.uid,
    title: m?.moduleVersion?.module?.translations?.["1"]?.title,
    status: activity.flat.get(m.uid)?.status || "not-started",
    dueDate: getModuleDueDate(m?.dueDate, parent?.enrolledAt),
    topics: [],
    enrolledAt: "",
    startedAt: activity.flat.get(m.uid)?.context?.startedAt || "",
    completedAt: activity.flat.get(m.uid)?.context?.completedAt || "",
    rating: 0,
    type: "",
    createdAt: "",
    material: m as Material,
    subRows: m?.learning?.map((l) => ({
      uid: l?.uid,
      title: l?.title,
      status: activity.flat.get(l.uid)?.status || "not-started",
      dueDate: "",
      topics: [],
      enrolledAt: "",
      startedAt: activity.flat.get(l.uid)?.context?.startedAt || "",
      completedAt: activity.flat.get(l.uid)?.context?.completedAt || "",
      rating: 0,
      type: "",
      createdAt: "",
      subRows: undefined,
    })),
  }
}

export function formatEnrolment(
  enrolment: z.infer<typeof EnrolmentsDetailSchema>,
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
): ColumnType {
  const enrol = {
    uid: enrolment.uid,
    title: enrolment.publication.title || "",
    status: enrolment.currentState,
    dueDate: enrolment.dueDate || "",
    topics: enrolment.publication.topics || [],
    enrolledAt: enrolment.createdAt,
    startedAt: enrolment.startedAt || "",
    completedAt: enrolment.completedAt || "",
    rating: enrolment.feedback?.rating || 0,
    type: enrolment.publication.type || "",
    createdAt: enrolment.createdAt,
    progress: activity?.progress.get(enrolment.uid) || 0,
    enrolment,
  }
  return {
    ...enrol,
    subRows:
      enrolment?.publication?.type === "course"
        ? enrolment?.publication?.material?.map((m) =>
            formatModule(m, enrol, activity)
          )
        : undefined,
  }
}

export const enrolmentColumns: ColumnDef<ColumnType>[] = [
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Title",
      type: "text",
      icon: RiHeading,
    },
    size: 500,
    cell: ({ row, getValue, table }) => {
      const value = getValue() as string
      const globalFilter = (table.getState().globalFilter || "").toLowerCase()
      const imageUrl = row.original?.enrolment?.publication?.featureImageUrl

      return (
        <div
          style={{
            paddingLeft: `${row.depth * 2}rem`,
          }}
          className="group flex w-full items-center gap-2"
        >
          {row?.original?.subRows !== undefined ? (
            <CompactButton.Root
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
              variant="ghost"
            >
              {row.getIsExpanded() ? (
                <>
                  {row?.original?.subRows &&
                  row?.original?.subRows?.length > 0 ? (
                    <CompactButton.Icon as={RiArrowDownSLine} />
                  ) : (
                    <CompactButton.Icon
                      className="animate-spin"
                      as={RiLoaderLine}
                    />
                  )}
                </>
              ) : (
                <CompactButton.Icon as={RiArrowRightSLine} />
              )}
            </CompactButton.Root>
          ) : null}

          <Avatar.Root
            {...(!imageUrl && {
              color:
                row?.original?.type === "course"
                  ? "sky"
                  : row?.original?.type === "program"
                    ? "purple"
                    : "gray",
            })}
            size="20"
          >
            {imageUrl ? (
              <Avatar.Image src={imageUrl} />
            ) : (
              <>
                {row?.original?.type === "course" ? (
                  <RiBook2Line className="size-3 fill-sky-800" />
                ) : row?.original?.type === "program" ? (
                  <RiTableLine className="size-3 fill-purple-800" />
                ) : (
                  <RiExternalLinkLine className="size-3 fill-gray-800" />
                )}
              </>
            )}
          </Avatar.Root>
          {row.depth === 0 ? (
            <Link
              to="/enrolments/$uid"
              search={{
                // @ts-ignore
                type: row?.original?.enrolment?.publication?.type + "s",
                typeUid: row?.original?.enrolment?.publication?.typeUid!,
              }}
              params={{
                uid: row?.original?.uid,
              }}
              className="line-clamp-1 w-full max-w-56 text-paragraph-sm font-normal hover:text-primary-base hover:underline"
            >
              {highlightText(value, globalFilter)}
            </Link>
          ) : (
            <span className="line-clamp-1 w-full max-w-56 text-paragraph-sm font-normal hover:text-primary-base hover:underline">
              {highlightText(value, globalFilter)}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    size: 150,
    cell: ({ getValue, row }) => {
      const value = getValue() as string
      if (!value) return null
      if (row?.depth > 0 && value === "not-started") return null

      return (
        <div className="flex h-full w-full items-center">
          <Badge.Root
            variant="filled"
            {...(value === "completed" && {
              color: "green",
            })}
            {...(value === "in-progress" && {
              color: "blue",
            })}
            {...(value === "not-started" && {
              color: "gray",
              variant: "stroke",
            })}
            {...(value === "failed" && {
              color: "red",
            })}
            size="medium"
            className="capitalize"
          >
            {value === "completed" && <Badge.Icon as={RiCheckboxCircleFill} />}
            {value === "in-progress" && <Badge.Icon as={RiRecordCircleLine} />}
            {value === "failed" && <Badge.Icon as={RiCloseCircleFill} />}
            {value.replace("-", " ")}
          </Badge.Root>
        </div>
      )
    },
  },
  {
    id: "progress",
    header: "Progress",
    accessorKey: "progress",
    size: 150,
    cell: ({ getValue, row }) => {
      const value = getValue() as number
      if (!value || value === 0) return null

      return (
        <div className="flex items-center gap-2">
          <ul className="flex h-5 w-full items-center gap-0.5 overflow-hidden">
            {Array.from({ length: 10 }).map((_, index) => {
              const progressPerBar = value / 10
              const currentBarProgress = progressPerBar - index
              const fillPercentage =
                Math.min(Math.max(currentBarProgress, 0), 1) * 100

              return (
                <li
                  key={`${row.id}-${index}-${row.index}-progress`}
                  className="relative h-full w-full bg-bg-soft-200"
                >
                  <div
                    style={{
                      height: `${fillPercentage}%`,
                    }}
                    className="absolute inset-x-0 bottom-0 bg-success-base"
                  />
                </li>
              )
            })}
          </ul>
          <span className="text-paragraph-xs font-normal">{value}%</span>
        </div>
      )
    },
  },
  {
    id: "dueDate",
    header: "Due Date",
    accessorKey: "dueDate",
    filterFn: filterFn("date"),
    size: 200,
    meta: {
      displayName: "Due Date",
      type: "date",
      icon: RiCalendarLine,
    },
    cell: ({ getValue, row }) => {
      const value = getValue() as string

      if (!value || value === "") return null
      const formattedDate = format(
        new Date(value),
        isThisYear(new Date(value)) ? "MMM d" : "MMM d, yy"
      )
      if (!formattedDate) return null

      const dueDatePassed = isBefore(endOfDay(new Date(value)), new Date())
      const dueWithin7Days = isWithinInterval(new Date(value), {
        start: startOfDay(new Date()),
        end: addDays(startOfDay(new Date()), 7),
      })
      const dueDateToday = isToday(startOfDay(new Date(value)))
      const isCompleted = row.original?.status === "completed"

      // due today
      if (!isCompleted && dueDateToday) {
        return (
          <div className="flex h-full items-center gap-2 bg-warning-base px-2 text-static-white">
            <RiErrorWarningFill className="size-5 fill-warning-light" />
            <span className="text-paragraph-sm font-normal">Due Today</span>
          </div>
        )
      }

      // incomplete and not due soon
      if (!isCompleted && !dueWithin7Days && !dueDatePassed) {
        return (
          <div className="flex h-full items-center gap-2">
            <RiErrorWarningFill className="size-5 fill-information-base" />
            <span className="text-paragraph-sm font-normal">
              {formattedDate}
            </span>
          </div>
        )
      }

      // incomplete and due soon
      if (!isCompleted && dueWithin7Days && !dueDateToday) {
        return (
          <div className="flex h-full items-center gap-2 bg-information-base px-2 text-static-white">
            <RiErrorWarningFill className="size-5 fill-information-light" />
            <span className="text-paragraph-sm font-normal">
              {formattedDate}
            </span>
          </div>
        )
      }

      // incomplete and late
      if (!isCompleted && dueDatePassed) {
        return (
          <div className="flex h-full items-center gap-2 bg-error-base px-2 text-static-white">
            <RiErrorWarningFill className="size-5 fill-error-light" />
            <span className="text-paragraph-sm font-normal">
              {formattedDate}
            </span>
          </div>
        )
      }

      return null
    },
  },
  {
    id: "topics",
    header: "Topics",
    accessorKey: "topics",
    size: 200,
    cell: ({ getValue }) => {
      const value = getValue() as string[]
      if (!value || value.length === 0) return null
      return (
        <div className="flex items-center gap-1.5">
          {value.slice(0, 1).map((topic) => (
            <Badge.Root
              className="shrink-0"
              variant="light"
              key={topic}
              size="small"
            >
              {topic}
            </Badge.Root>
          ))}
          {value.length > 1 && (
            <Badge.Root className="shrink-0" variant="light" size="small">
              +{value.length - 1}
            </Badge.Root>
          )}
        </div>
      )
    },
  },

  {
    id: "startedAt",
    header: "Started At",
    accessorKey: "startedAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "completedAt",
    header: "Completed At",
    accessorKey: "completedAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "enrolledAt",
    header: "Enrolled At",
    accessorKey: "createdAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "rating",
    header: "Rating",
    accessorKey: "rating",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as number
      if (!value) return null
      return <StarRating rating={value} />
    },
  },
]
