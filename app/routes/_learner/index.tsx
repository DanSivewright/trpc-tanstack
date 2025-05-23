import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
} from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { EnrolmentSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { cn } from "@/utils/cn"
import { filterFn } from "@/utils/filters"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { highlightText } from "@/utils/highlight-text"
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBook2Line,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiErrorWarningFill,
  RiExternalLinkLine,
  RiFilterLine,
  RiHeading,
  RiLoaderLine,
  RiRecordCircleLine,
  RiSearchLine,
  RiSortDesc,
  RiTableLine,
} from "@remixicon/react"
import {
  useQueries,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TableType,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  addDays,
  addMonths,
  addYears,
  endOfDay,
  endOfMonth,
  format,
  isBefore,
  isThisYear,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { motion } from "motion/react"
import { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { CompactButton } from "@/components/ui/compact-button"
import { Input } from "@/components/ui/input"
import { StarRating } from "@/components/ui/svg-rating-icons"
import { Table } from "@/components/ui/table"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"

import RecentLearning from "./-components/recent-learning"
import TodaysSchedule from "./-components/todays-schedule"
import UpcomingDeadlines from "./-components/upcoming-deadlines"

const dr = {
  mode: "m",
  start: startOfDay(addDays(new Date(), -30)).toISOString(),
  end: endOfDay(new Date()).toISOString(),
} as const
export const Route = createFileRoute("/_learner/")({
  validateSearch: z.object({
    q: z.string().default(""),
    expanded: z.custom<ExpandedState>().default({}),
    dr: z
      .object({
        mode: z.enum(["d", "y", "h", "w", "b", "m", "custom"]).or(z.string()),
        start: z.string(),
        end: z.string(),
      })
      .default(dr),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        expanded: {},
        dr,
      }),
    ],
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.enrolments.all.queryOptions({
        query: {
          contentType: "digital,mixded",
          include: "completed",
          limit: 100,
        },
      })
    )
  },
  component: RouteComponent,
  pendingComponent: () => <div>Loading...</div>,
})

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
  enrolment?: z.infer<typeof EnrolmentSchema>
  material?: Material
  subRows?: ColumnType[]
}

function RouteComponent() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const trpc = useTRPC()
  const enrolments = useSuspenseQuery(
    trpc.enrolments.all.queryOptions({
      query: {
        contentType: "digital,mixded",
        include: "completed",
        limit: 100,
      },
    })
  )
  const formattedEnrolments = useMemo(
    () =>
      enrolments.data?.enrolments?.map((enrolment) =>
        formatEnrolment(enrolment)
      ),
    [enrolments.data?.enrolments]
  )

  const me = useSuspenseQuery(trpc.people.me.queryOptions())

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const updateTableFilters = (name: keyof typeof search, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value
    navigate({
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  const enrolmentDetails = useSuspenseQueries({
    queries: enrolments?.data?.enrolments
      .filter((x) => x.publication?.type === "course")
      ?.map((e) => ({
        ...trpc.enrolments.detail.queryOptions({
          params: {
            uid: e.uid,
          },
          query: {
            excludeMaterial: true,
          },
          addOns: {
            withActivity: true,
          },
        }),
      })),
  })

  const flatEnrolmentDetails = useMemo(() => {
    return enrolmentDetails?.flatMap((e) => e.data)
  }, [enrolmentDetails])

  const flatActivityMap = useMemo(() => {
    const map: Map<string, EnrolmentActivityType> = new Map()
    if (!enrolmentDetails || enrolmentDetails.length === 0) return map
    enrolmentDetails
      .filter((query) => !query?.isLoading)
      .forEach((item) => {
        if (
          !item.data ||
          !item.data.activity ||
          item?.data?.activity?.length === 0
        )
          return
        item.data.activity.forEach((activity) => {
          map.set(activity.typeUid, activity)
        })
      })
    return map
  }, [enrolmentDetails])

  const activityMapPerDetail = useMemo(() => {
    const map: Map<string, EnrolmentActivityType[]> = new Map()
    if (!enrolmentDetails || enrolmentDetails.length === 0) return map
    enrolmentDetails
      .filter((query) => !query?.isLoading)
      .forEach((item) => {
        if (
          !item.data ||
          !item.data.activity ||
          item?.data?.activity?.length === 0
        )
          return
        map.set(item.data.uid, item.data.activity)
      })
    return map
  }, [enrolmentDetails])

  const totalTrackableActivityMapPerDetail = useMemo(() => {
    const map: Map<string, number> = new Map()
    if (!enrolmentDetails || enrolmentDetails.length === 0) return map
    enrolmentDetails.forEach((item) => {
      if (item.data) {
        map.set(item?.data?.uid, getTotalTrackableActivity(item?.data) || 0)
      }
    })
    return map
  }, [enrolmentDetails])

  const totalCompletedActivityMapPerDetail = useMemo(() => {
    const map: Map<string, number> = new Map()
    if (!activityMapPerDetail || !totalTrackableActivityMapPerDetail) return map

    activityMapPerDetail.forEach((activity, key) => {
      map.set(
        key,
        activity.filter(
          (activity) =>
            (activity.type === "lesson" ||
              activity.type === "assessment" ||
              activity.type === "module" ||
              activity.type === "assignment") &&
            activity.status === "completed"
        ).length || 0
      )
    })
    return map
  }, [activityMapPerDetail, totalTrackableActivityMapPerDetail])

  const progressMapPerDetail = useMemo(() => {
    const map: Map<string, number> = new Map()
    if (
      !totalCompletedActivityMapPerDetail ||
      !totalTrackableActivityMapPerDetail
    )
      return map

    totalTrackableActivityMapPerDetail.forEach((value, key) => {
      const completed = totalCompletedActivityMapPerDetail.get(key) || 0
      const total = completed > 0 ? (completed / value) * 100 : 0

      map.set(key, total > 100 ? 100 : Math.round(total))
    })
    return map
  }, [totalCompletedActivityMapPerDetail, totalTrackableActivityMapPerDetail])

  const data = useMemo(() => {
    if (!formattedEnrolments || formattedEnrolments.length === 0) return []
    if (!enrolmentDetails || enrolmentDetails.length === 0)
      return formattedEnrolments

    return formattedEnrolments.map((e) => {
      const detail = enrolmentDetails?.find(
        (m) => m?.data?.uid === e?.uid
      )?.data

      if (!detail) return e
      return {
        ...e,
        progress: progressMapPerDetail.get(e.uid) || 0,
        subRows: detail?.publication?.material?.map((m) =>
          formatModule(m, e, flatActivityMap)
        ),
      }
    })
  }, [formattedEnrolments, enrolmentDetails, progressMapPerDetail])

  const featuredEnrolments = useMemo(() => {
    const notCompleted = enrolments?.data?.enrolments?.filter(
      (e) => e.currentState !== "completed"
    )
    const sortedByCreatedAt = notCompleted?.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const onlyIntercalCourses = sortedByCreatedAt?.filter(
      (e) => e.publication.type === "course"
    )
    const dueThisMonth = onlyIntercalCourses?.filter((e) => {
      if (!e.dueDate) return false
      const dueDate = endOfDay(new Date(e.dueDate))
      const start = startOfMonth(new Date())
      const end = endOfMonth(new Date())
      return isWithinInterval(dueDate, { start, end })
    })
    const listOfPossibleFeatures = [...dueThisMonth, ...onlyIntercalCourses]
    const setOfPublicationEnrolmentUids = new Set(
      listOfPossibleFeatures?.slice(0, 5)?.map((e) => e.uid)
    )
    return enrolmentDetails
      ?.filter((detail) => setOfPublicationEnrolmentUids.has(detail.data?.uid))
      .map((detail) => detail.data)
  }, [enrolments?.data?.enrolments, enrolmentDetails])

  const palettes = useQueries({
    queries: featuredEnrolments
      ?.filter(
        (f) =>
          f?.publication?.featureImageUrl &&
          f?.publication?.featureImageUrl !== ""
      )
      ?.map((detail) =>
        trpc.palette.get.queryOptions({
          url: detail?.publication?.featureImageUrl!,
        })
      ),
  })

  const heroSize = useElementSize()

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <>
      <Carousel
        opts={{
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {featuredEnrolments?.map((detail, detailIndex) => {
            const palette = palettes.find(
              (p) => p.data?.url === detail?.publication?.featureImageUrl
            )
            const progress = progressMapPerDetail.get(detail.uid) || 0
            const flatLearning = detail?.publication?.material?.flatMap(
              (m) => m.learning
            )
            const continueLessonUid =
              detail?.continue?.lessonUid || flatLearning?.[0]?.uid
            const continueLessonIndex = flatLearning?.findIndex(
              (l) => l.uid === continueLessonUid
            )
            const allLearningAfterCurrentLesson =
              flatLearning?.slice(continueLessonIndex)

            console.log("continue:::", detail)

            return (
              <CarouselItem className="relative" key={detail.uid + "-feature"}>
                <header className="relative z-10 h-[calc(50vh-44px)] w-screen bg-bg-weak-50 pb-5 pt-8">
                  {palette?.data && (
                    <div
                      style={{
                        background: `linear-gradient(0deg, rgba(${palette?.data?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                      }}
                      className="absolute inset-x-0 bottom-0 z-[1] h-[65%]"
                    >
                      <div className="gradient-blur">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  )}
                  {detail?.publication?.featureImageUrl && (
                    <img
                      src={detail?.publication?.featureImageUrl}
                      alt={detail.publication.title + " feature image"}
                      className="absolute inset-0 z-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="relative z-10 flex h-full flex-col justify-end gap-6 pb-10">
                    <Grid
                      style={{
                        color: palette?.data?.LightMuted?.titleTextColor,
                      }}
                      className="gutter relative z-10 mx-auto w-full max-w-screen-xl"
                      gap="xs"
                    >
                      <div
                        ref={heroSize.ref}
                        className="col-span-7 flex flex-col justify-end gap-2"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          {detail?.dueDate && (
                            <Badge.Root>
                              <Badge.Icon as={RiCalendarLine} />
                              {format(new Date(detail?.dueDate), "MMM d, yyyy")}
                            </Badge.Root>
                          )}
                        </div>
                        <h1 className="line-clamp-3 text-title-h2">
                          {detail?.publication?.publishedBy && (
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <Avatar.Root
                                  className="mr-4 inline-flex"
                                  size="32"
                                >
                                  <Avatar.Image
                                    src={
                                      detail?.publication?.publishedBy?.imageUrl
                                    }
                                  />
                                </Avatar.Root>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                Publisher:{" "}
                                {detail?.publication?.publishedBy?.name}
                              </Tooltip.Content>
                            </Tooltip.Root>
                          )}

                          {detail.publication.title}
                        </h1>
                        <p className="line-clamp-3 text-label-sm opacity-70">
                          {detail.publication.summary ||
                            detail?.publication?.translations?.["1"]?.summary}
                        </p>
                        {detail?.publication?.topics && (
                          <div className="flex flex-wrap gap-2">
                            {detail?.publication?.topics?.map((topic) => (
                              <Badge.Root
                                {...(palette?.data?.LightMuted?.rgb
                                  ? {
                                      style: {
                                        backgroundColor: `rgba(${palette?.data?.DarkVibrant?.rgb?.join(",")}, 1)`,
                                      },
                                    }
                                  : {
                                      color: "blue",
                                    })}
                                key={topic}
                              >
                                {topic}
                              </Badge.Root>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-3">
                          <Button.Root
                            variant="neutral"
                            mode="lighter"
                            className="rounded-full p-0.5 pl-3"
                          >
                            <span>Continue Learning</span>
                            <div className="flex aspect-square h-full items-center justify-center rounded-full bg-bg-strong-950">
                              <Button.Icon
                                className="fill-bg-white-0"
                                as={RiArrowRightSLine}
                              />
                            </div>
                          </Button.Root>
                          <Button.Root className="gap-6 rounded-full bg-bg-white-0/20 backdrop-blur-xl">
                            <span>More Info</span>
                            <Button.Icon as={RiArrowRightSLine} />
                          </Button.Root>
                        </div>
                      </div>
                      <div className="col-span-5 flex flex-col justify-end gap-3">
                        {progress > 0 && (
                          <article className="relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-10 bg-bg-white-0 p-4 shadow-regular-sm *:text-static-black lg:col-span-5">
                            <header className="flex flex-col gap-1">
                              <h2 className="capitalize">
                                {detail?.publication?.type} Progress
                              </h2>
                              <p className="text-label-xs text-text-soft-400">
                                {progress === 0 && (
                                  <>
                                    Start learning and watch your progress grow.
                                  </>
                                )}
                                {progress < 25 && progress > 0 && (
                                  <>
                                    You're just getting started! Keep going to
                                    build momentum.
                                  </>
                                )}

                                {progress >= 25 && progress < 50 && (
                                  <>
                                    You're making good progress! You've
                                    completed a quarter of the course.
                                  </>
                                )}

                                {progress >= 50 && progress < 75 && (
                                  <>
                                    Excellent work! You're more than halfway
                                    through your learning journey.
                                  </>
                                )}

                                {progress >= 75 && progress < 100 && (
                                  <>
                                    Almost there! Just a few more activities to
                                    complete your course.
                                  </>
                                )}

                                {progress === 100 && (
                                  <>
                                    Congratulations! You've completed all
                                    activities in this course.
                                  </>
                                )}
                              </p>
                            </header>
                            <footer className="flex flex-col gap-1.5">
                              <h3 className="text-title-h4">{progress}%</h3>
                              <ul className="flex h-12 w-full items-center gap-1 overflow-hidden">
                                {Array.from({ length: 50 }).map((_, i) => {
                                  const value = progress // 25% progress
                                  const totalBars = 50
                                  const barIndex = i + 1

                                  // Calculate exact number of bars that should be filled
                                  const exactBarsToFill =
                                    (value / 100) * totalBars

                                  // For full bars
                                  const shouldFillCompletely =
                                    barIndex <= Math.floor(exactBarsToFill)

                                  // For partial fill (the transitioning bar)
                                  const isTransitionBar =
                                    barIndex === Math.ceil(exactBarsToFill)
                                  const partialFillPercentage = isTransitionBar
                                    ? (exactBarsToFill % 1) * 100
                                    : 0

                                  // Final height calculation
                                  const fillHeight = shouldFillCompletely
                                    ? "100%"
                                    : isTransitionBar
                                      ? `${partialFillPercentage}%`
                                      : "0%"

                                  return (
                                    <li
                                      key={`progress-${i}-${detail?.uid}`}
                                      className="relative h-full w-full bg-bg-soft-200"
                                    >
                                      <motion.div
                                        className="absolute inset-x-0 bottom-0 bg-success-base"
                                        initial={{ height: "0%" }}
                                        viewport={{
                                          once: true,
                                        }}
                                        animate={{
                                          height:
                                            detailIndex + 1 === current
                                              ? fillHeight
                                              : "0%",
                                        }}
                                        transition={{
                                          duration: 0.5,
                                          delay: i * 0.02, // Stagger the animations
                                          ease: "easeOut",
                                        }}
                                      />
                                    </li>
                                  )
                                })}
                              </ul>
                            </footer>
                          </article>
                        )}
                      </div>
                    </Grid>
                  </div>
                </header>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      <div className="absolute inset-x-0 top-[calc(50vh-20px)] z-0 h-24 w-full rounded-t-20 bg-bg-white-0 drop-shadow-2xl"></div>
      <div className="relative z-10 -mt-5 rounded-t-20 bg-bg-white-0 py-10">
        <div className="gutter z-10 mx-auto flex w-full max-w-screen-2xl flex-col gap-12">
          <Grid>
            <UpcomingDeadlines enrolments={flatEnrolmentDetails} />
            <TodaysSchedule
              enrolment={featuredEnrolments?.[3]}
              activityMap={flatActivityMap}
            />
            <RecentLearning
              enrolment={featuredEnrolments?.[0]}
              activityMap={flatActivityMap}
            />
          </Grid>
          <section className="flex flex-col gap-6">
            <Breadcrumb.Root>
              <Breadcrumb.Item>
                <Avatar.Root size="20">
                  {me?.data?.imageUrl ? (
                    <Avatar.Image src={me?.data?.imageUrl} />
                  ) : (
                    me?.data?.firstName?.[0]
                  )}
                </Avatar.Root>
                <span>Learning</span>
              </Breadcrumb.Item>
              <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
              <Breadcrumb.Item>Courses</Breadcrumb.Item>
              <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
              <Breadcrumb.Item active>
                The Power of Minimalism in Design
              </Breadcrumb.Item>
            </Breadcrumb.Root>
            <div className="flex items-center gap-2">
              <Input.Root className="max-w-[400px]" size="xsmall">
                <Input.Wrapper>
                  <Input.Icon as={RiSearchLine} />
                  <Input.Field
                    value={search.q}
                    onChange={(e) => {
                      updateTableFilters("q", e.target.value)
                    }}
                    type="text"
                    placeholder="Search"
                  />
                </Input.Wrapper>
              </Input.Root>
              <Button.Root size="xsmall" variant="neutral" mode="stroke">
                <Button.Icon as={RiFilterLine} />
                Filters
              </Button.Root>
              <Button.Root size="xsmall" variant="neutral" mode="stroke">
                <Button.Icon as={RiSortDesc} />
                Sort by
              </Button.Root>
            </div>
            <EnrolmentTable
              getSubRows={(row) => row.subRows}
              getRowCanExpand={(row) => row.subRows !== undefined}
              columns={columns}
              data={data}
            />
          </section>
        </div>
      </div>
    </>
  )
}

const getCommonPinningStyles = (
  column: Column<z.infer<typeof EnrolmentSchema>>
): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px gray inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

type EnrolmentTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getSubRows?:
    | ((originalRow: TData, index: number) => TData[] | undefined)
    | undefined
  getRowCanExpand?: ((row: Row<TData>) => boolean) | undefined
  setTable?: Dispatch<React.SetStateAction<TableType<TData> | undefined>>
}
function EnrolmentTable<TData, TValue>({
  columns,
  data,
  getSubRows,
  getRowCanExpand,
  setTable,
}: EnrolmentTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const updateTableFilters = (name: keyof typeof search, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value
    navigate({
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSubRows,
    getRowCanExpand,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: (updaterOrValue) =>
      updateTableFilters("expanded", updaterOrValue),
    onGlobalFilterChange: (updaterOrValue) =>
      updateTableFilters("q", updaterOrValue),
    state: {
      sorting,
      columnFilters,
      globalFilter: search.q,
      columnVisibility,
      rowSelection,
      expanded: search.expanded,
    },
    debugTable: true,
  })

  useEffect(() => {
    if (setTable) {
      setTable(table)
    }
  }, [table, setTable])

  return (
    <div className="no-scrollbar w-full max-w-full overflow-x-auto">
      <Table.Root
        {...{
          style: {
            width: table.getCenterTotalSize(),
          },
        }}
      >
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head
                    colSpan={header.colSpan}
                    className="sticky left-0 z-10"
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Table.Head>
                )
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row, rowIndex, arr) => (
              <React.Fragment key={row.id}>
                <Table.Row data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <Table.Cell
                      className={cn(
                        "relative h-9 w-full items-center bg-bg-white-0 py-0",
                        {
                          "first:rounded-none first:border-l-4 first:border-primary-base last:rounded-none":
                            row.getIsExpanded() || row?.depth > 0,
                          "bg-bg-weak-50": row?.depth > 0,
                          // "bg-bg-weak-50":
                          //   row.getIsExpanded() && row?.depth === 0,
                          // "bg-bg-soft-200/80 group-hover/row:bg-bg-soft-200":
                          //   (row.getIsExpanded() && row?.depth === 1) ||
                          //   row?.depth === 1,
                          // "bg-bg-sub-300/60 group-hover/row:bg-bg-sub-300/70":
                          //   row?.depth === 2,
                        }
                      )}
                      style={{
                        ...getCommonPinningStyles(cell.column as any),
                      }}
                      key={cell.id}
                    >
                      {cellIndex === 0 &&
                        row.depth === 1 &&
                        row?.getIsExpanded() && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-success-base"></span>
                        )}
                      {cellIndex === 0 && row?.depth === 2 && (
                        <span className="absolute inset-y-0 left-0 w-1 bg-success-base"></span>
                      )}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              </React.Fragment>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={table.getAllColumns().length}>
                <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
                  <h1 className="relative z-10 text-title-h4">
                    No learning found
                  </h1>
                  <p className="relative z-10 text-label-sm font-light text-text-soft-400">
                    Can't find what you're looking for?
                  </p>
                  <RiSearchLine
                    className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
                    size={450}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

function formatEnrolment(
  enrolment: z.infer<typeof EnrolmentSchema>
): ColumnType {
  return {
    uid: enrolment.uid,
    title: enrolment.publication.content.title,
    status: enrolment.currentState,
    dueDate: enrolment.dueDate || "",
    topics: enrolment.publication.topics || [],
    enrolledAt: enrolment.createdAt,
    startedAt: enrolment.startedAt || "",
    completedAt: enrolment.completedAt || "",
    rating: enrolment.feedback?.rating || 0,
    type: enrolment.publication.type || "",
    createdAt: enrolment.createdAt,
    enrolment,
    subRows: enrolment?.publication?.type === "course" ? [] : undefined,
  }
}

function formatModule(
  m: Material,
  parent: ColumnType,
  flatActivityMap: Map<string, EnrolmentActivityType>
): ColumnType {
  function getDueDate(dueDate: Material["dueDate"]) {
    if (!dueDate) return ""
    if ("fixed" in dueDate) return dueDate.fixed
    if ("dueDuration" in dueDate && "dueMeasurement" in dueDate) {
      switch (dueDate.dueMeasurement) {
        case "days":
          if (!parent?.enrolledAt) return ""
          return endOfDay(
            addDays(
              new Date(parent?.enrolledAt),
              parseInt(dueDate?.dueDuration)
            )
          ).toISOString()
        case "months":
          if (!parent?.enrolledAt) return ""
          return endOfDay(
            addMonths(
              new Date(parent?.enrolledAt),
              parseInt(dueDate?.dueDuration)
            )
          ).toISOString()
        case "years":
          if (!parent?.enrolledAt) return ""
          return endOfDay(
            addYears(
              new Date(parent?.enrolledAt),
              parseInt(dueDate?.dueDuration)
            )
          ).toISOString()

        default:
          break
      }
    }
    return ""
  }
  return {
    uid: m?.uid,
    title: m?.moduleVersion?.module?.translations?.["1"]?.title,
    status: flatActivityMap.get(m.uid)?.status || "not-started",
    dueDate: getDueDate(m?.dueDate),
    topics: [],
    enrolledAt: "",
    startedAt: flatActivityMap.get(m.uid)?.context?.startedAt || "",
    completedAt: flatActivityMap.get(m.uid)?.context?.completedAt || "",
    rating: 0,
    type: "",
    createdAt: "",
    material: m as Material,
    subRows: m?.learning?.map((l) => ({
      uid: l?.uid,
      title: l?.title,
      status: flatActivityMap.get(l.uid)?.status || "not-started",
      dueDate: "",
      topics: [],
      enrolledAt: "",
      startedAt: flatActivityMap.get(l.uid)?.context?.startedAt || "",
      completedAt: flatActivityMap.get(l.uid)?.context?.completedAt || "",
      rating: 0,
      type: "",
      createdAt: "",
      subRows: undefined,
    })),
  }
}

const columns: ColumnDef<ColumnType>[] = [
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
          {row.getCanExpand() && row?.original?.subRows !== undefined ? (
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
          <span className="line-clamp-1 w-full max-w-56 text-paragraph-sm font-normal hover:text-primary-base hover:underline">
            {highlightText(value, globalFilter)}
          </span>
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
