import { useEffect, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { RiArrowRightSLine, RiCalendarLine } from "@remixicon/react"
import {
  useQueries,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from "@tanstack/react-router"
import { type ExpandedState } from "@tanstack/react-table"
import {
  addDays,
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { motion } from "motion/react"
import { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { toast } from "@/components/ui/toast"
import * as AlertToast from "@/components/ui/toast-alert"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"
import Bookmarks from "@/components/widgets/bookmarks"

import CoursesEnrolmentsTable from "./communities/$id/courses/-components/courses-enrolments-table"
import CoursesLastActive from "./communities/$id/courses/-components/courses-last-active"
import CoursesNotes from "./communities/$id/courses/-components/courses-notes"
import CoursesSchedule from "./communities/$id/courses/-components/courses-schedule"

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
    return enrolmentDetails?.map((e) => e.data)
  }, [enrolmentDetails])

  const activity = useMemo(() => {
    const activityObj = {
      flat: new Map<string, EnrolmentActivityType>(),
      detail: new Map<string, EnrolmentActivityType[]>(),
      progress: new Map<string, number>(),
    }

    if (
      !enrolmentDetails ||
      enrolmentDetails.length === 0 ||
      enrolmentDetails.some((q) => q.isLoading)
    )
      return activityObj

    enrolmentDetails?.forEach((e) => {
      activityObj.detail.set(e?.data?.uid, e?.data?.activity || [])
      const totalTrackableActivity = getTotalTrackableActivity(e?.data)
      const totalCompletedActivity =
        (e?.data?.activity || []).filter(
          (activity) =>
            (activity.type === "lesson" ||
              activity.type === "assessment" ||
              activity.type === "module" ||
              activity.type === "assignment") &&
            activity.status === "completed"
        ).length || 0

      const enrolmentProgress =
        totalCompletedActivity > 0
          ? Math.round((totalCompletedActivity / totalTrackableActivity) * 100)
          : 0

      activityObj.progress.set(
        e?.data?.uid,
        enrolmentProgress > 100 ? 100 : enrolmentProgress
      )

      e?.data?.activity?.forEach((activity) => {
        activityObj.flat.set(activity.typeUid, activity)
      })
    })
    return activityObj
  }, [enrolmentDetails])

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  type tableParams = Pick<typeof search, "q" | "expanded">
  const updateTableFilters = (name: keyof tableParams, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value
    navigate({
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

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
            const progress = activity.progress.get(detail.uid) || 0
            // const flatLearning = detail?.publication?.material?.flatMap(
            //   (m) => m.learning
            // )
            // const continueLessonUid =
            //   detail?.continue?.lessonUid || flatLearning?.[0]?.uid
            // const continueLessonIndex = flatLearning?.findIndex(
            //   (l) => l.uid === continueLessonUid
            // )
            // const allLearningAfterCurrentLesson =
            //   flatLearning?.slice(continueLessonIndex)
            const imagePath = getPathFromGoogleStorage(
              detail?.publication?.featureImageUrl || ""
            )

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
                  {detail?.publication?.featureImageUrl && imagePath && (
                    <Image
                      path={imagePath || ""}
                      alt={detail.publication.title + " feature image"}
                      sizes="100vw"
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
                      <div className="col-span-7 flex flex-col justify-end gap-2">
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
                          {/* @ts-ignore */}
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
                            onClick={() => {
                              toast.custom((t) => (
                                <AlertToast.Root
                                  t={t}
                                  status="feature"
                                  message="Comming soon..."
                                />
                              ))
                            }}
                          >
                            <span>Continue Learning</span>
                            <div className="flex aspect-square h-full items-center justify-center rounded-full bg-bg-strong-950">
                              <Button.Icon
                                className="fill-bg-white-0"
                                as={RiArrowRightSLine}
                              />
                            </div>
                          </Button.Root>
                          <Button.Root
                            asChild
                            className="gap-6 rounded-full bg-bg-white-0/20 backdrop-blur-xl"
                          >
                            <Link
                              to="/enrolments/$uid"
                              search={{
                                // @ts-ignore
                                type: detail?.publication?.type + "s",
                                typeUid: detail?.publication?.typeUid!,
                              }}
                              params={{ uid: detail.uid }}
                            >
                              <span>More Info</span>
                              <Button.Icon as={RiArrowRightSLine} />
                            </Link>
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
      <Section
        size="sm"
        spacer="p"
        className="gutter relative z-10 -mt-5 w-full rounded-t-20 bg-bg-white-0"
      >
        <Grid gap="none" className="w-full gap-6">
          <CoursesLastActive
            enrolments={flatEnrolmentDetails}
            activity={activity}
          />
          <div className="col-span-12 flex aspect-[1/2] flex-col gap-6 md:col-span-6 md:aspect-square xl:col-span-4">
            <Bookmarks
              identifierKey="enrolmentUid"
              identifiers={flatEnrolmentDetails?.map((e) => e?.uid)}
            />
            <CoursesNotes enrolments={flatEnrolmentDetails} />
          </div>

          <CoursesSchedule enrolments={flatEnrolmentDetails} />
          <CoursesEnrolmentsTable
            enrolments={flatEnrolmentDetails}
            activity={activity}
            q={search.q}
            expanded={search.expanded}
            updateTableFilters={updateTableFilters}
          />
        </Grid>
      </Section>
    </>
  )
}
