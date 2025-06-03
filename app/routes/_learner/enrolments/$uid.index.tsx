import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { cn } from "@/utils/cn"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import {
  RiArrowRightSLine,
  RiBarChartLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCompassLine,
  RiInformationLine,
  RiLockLine,
  RiPlayCircleLine,
  RiPlayList2Line,
  RiRecordCircleLine,
  RiStarLine,
} from "@remixicon/react"
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  retainSearchParams,
  stripSearchParams,
  useLocation,
} from "@tanstack/react-router"
import { format } from "date-fns"
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react"
import { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import { toast } from "@/components/ui/toast"
import * as AlertToast from "@/components/ui/toast-alert"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"
import { Section } from "@/components/section"
import Bookmarks from "@/components/widgets/bookmarks"

import CoursesBookmarks from "../communities/$id/courses/-components/courses-bookmarks"
import CoursesNotes from "../communities/$id/courses/-components/courses-notes"
import CoursesSchedule from "../communities/$id/courses/-components/courses-schedule"
import EnrolmentsModuleDrawer from "./-components/enrolments-module-drawer"

export const Route = createFileRoute("/_learner/enrolments/$uid/")({
  validateSearch: z.object({
    type: z.enum(["courses", "programs", "externals"]),
    typeUid: z.string(),
    moduleUid: z.string().optional(),
    highlightUid: z.string().optional(),
  }),
  search: {
    middlewares: [
      retainSearchParams(["type", "typeUid"]),
      stripSearchParams({
        moduleUid: "",
        highlightUid: "",
      }),
    ],
  },
  loaderDeps: ({ search }) => {
    return {
      type: search.type,
      typeUid: search.typeUid,
    }
  },
  loader: async ({ context, params, deps }) => {
    context.queryClient.prefetchQuery(
      context.trpc.enrolments.resources.queryOptions({
        params: {
          type: deps.type,
          typeUid: deps.typeUid,
        },
      })
    )
    await context.queryClient.ensureQueryData(
      context.trpc.enrolments.detail.queryOptions({
        params: {
          uid: params?.uid,
        },
        addOns: {
          withActivity: true,
        },
        query: {
          excludeMaterial: true,
        },
      })
    )
  },
  component: RouteComponent,
  pendingComponent: () => {
    return (
      <Section className="mx-auto flex w-full max-w-screen-lg flex-col gap-6 px-8 xl:px-0">
        <div className="h-12 w-3/4 animate-pulse rounded-10 bg-bg-soft-200"></div>

        <Grid gap="none" className="gap-y-7">
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Created
          </div>
          <div className="col-span-10 h-5 w-20 animate-pulse rounded-md bg-bg-soft-200"></div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Due
          </div>

          <div className="col-span-10 h-5 w-20 animate-pulse rounded-md bg-bg-soft-200"></div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Resources
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            <div className="h-5 w-48 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
          </div>

          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Topics
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
          </div>
        </Grid>
      </Section>
    )
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const { scrollY } = useScroll()

  const [hash, setHash] = useState(location.hash)
  const [visibleSections, setVisibleSections] = useState<string[]>([])

  // Transform will now move upward (negative values) and stop at the maximum scroll point
  const y = useTransform(
    scrollY,
    [0, 500],
    [0, -100],
    { clamp: true } // This ensures the animation stops at the endpoints
  )

  const resourcesQuery = useQuery(
    trpc.enrolments.resources.queryOptions({
      params: {
        type: search.type,
        typeUid: search.typeUid,
      },
    })
  )
  const enrolmentQuery = useSuspenseQuery(
    trpc.enrolments.detail.queryOptions({
      params: {
        uid: params?.uid,
      },
      addOns: {
        withActivity: true,
      },
      query: {
        excludeMaterial: true,
      },
    })
  )
  const detail = enrolmentQuery.data

  const activity = useMemo(() => {
    const activityObj = {
      flat: new Map<string, EnrolmentActivityType>(),
      detail: new Map<string, EnrolmentActivityType[]>(),
      progress: new Map<string, number>(),
    }

    if (!detail) return activityObj

    activityObj.detail.set(detail?.uid, detail?.activity || [])
    const totalTrackableActivity = getTotalTrackableActivity(detail)
    const totalCompletedActivity =
      (detail?.activity || []).filter(
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
      detail?.uid,
      enrolmentProgress > 100 ? 100 : enrolmentProgress
    )

    detail?.activity?.forEach((activity) => {
      activityObj.flat.set(activity.typeUid, activity)
    })
    return activityObj
  }, [detail])

  const palette = useSuspenseQuery({
    ...trpc.palette.get.queryOptions({
      url: detail?.publication?.featureImageUrl || "",
    }),
  })
  const imagePath = useMemo(() => {
    return getPathFromGoogleStorage(detail?.publication?.featureImageUrl || "")
  }, [detail?.publication?.featureImageUrl])
  const progress = activity.progress.get(detail?.uid) || 0

  const inViewRef = useRef(null)
  const inView = useInView(inViewRef, {
    initial: true,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id

          setVisibleSections((prev) => {
            if (entry.isIntersecting) {
              // Add section to visible sections if not already present
              if (!prev.includes(sectionId)) {
                return [...prev, sectionId]
              }
            } else {
              // Remove section from visible sections
              return prev.filter((id) => id !== sectionId)
            }
            return prev
          })
        })
      },
      {
        // Using a threshold of 1.0 means the callback will only trigger
        // when 100% of the section is visible
        threshold: 1.0,
      }
    )

    const sections = document.querySelectorAll(
      "#overview, #modules, #about, #performance, #reviews"
    )
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section)
      })
    }
  }, [])

  // Update hash based on visible sections
  useEffect(() => {
    if (visibleSections.length > 0) {
      // Set hash to the last (bottommost) visible section
      setHash(visibleSections[visibleSections.length - 1])
    } else {
      // If no sections visible, default to overview
      setHash("overview")
    }
  }, [visibleSections])

  const lastActiveModule = useMemo(() => {
    const uid =
      detail?.continue?.moduleUid || detail?.publication?.material?.[0]?.uid
    const module = detail?.publication?.material?.find(
      (material) => material.uid === uid
    )
    return {
      module,
      imagePath: getPathFromGoogleStorage(
        module?.moduleVersion?.module?.featureImageUrl || ""
      ),
    }
  }, [detail])

  const isLocked = useCallback(
    (identifier: string, index: number) => {
      if (!detail?.publication?.completeLearningInOrder) return false
      if (index === 0) return false
      if (activity.flat.get(identifier)?.status === "completed") return false
      if (activity.flat.get(identifier)?.status === "in-progress") return false
      if (activity.flat.get(identifier)?.status === "failed") return false

      if (
        index > 0 &&
        activity.flat.get(detail?.publication?.material[index - 1]?.uid)
          ?.status === "completed"
      )
        return false

      return true
    },
    [activity.flat, detail?.publication?.completeLearningInOrder]
  )

  return (
    <>
      <EnrolmentsModuleDrawer activity={activity} enrolment={detail} />
      {detail?.publication?.featureImageUrl && imagePath && (
        <motion.div
          style={{
            y,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "calc(50vh-44px)",
            width: "100%",
            zIndex: 0,
            willChange: "transform", // Optimize performance
          }}
        >
          <Image
            path={imagePath || ""}
            alt={detail?.publication?.title + " feature image"}
            sizes="100vw"
            className="h-[calc(60vh-44px)] w-full object-cover"
          />
        </motion.div>
      )}
      <header
        ref={inViewRef}
        className="relative z-10 h-[calc(50vh-44px)] w-screen pb-5 pt-8"
      >
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
                      <Avatar.Root className="mr-4 inline-flex" size="32">
                        <Avatar.Image
                          src={detail?.publication?.publishedBy?.imageUrl}
                        />
                      </Avatar.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      Publisher: {detail?.publication?.publishedBy?.name}
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
                        <>Start learning and watch your progress grow.</>
                      )}
                      {progress < 25 && progress > 0 && (
                        <>
                          You're just getting started! Keep going to build
                          momentum.
                        </>
                      )}

                      {progress >= 25 && progress < 50 && (
                        <>
                          You're making good progress! You've completed a
                          quarter of the course.
                        </>
                      )}

                      {progress >= 50 && progress < 75 && (
                        <>
                          Excellent work! You're more than halfway through your
                          learning journey.
                        </>
                      )}

                      {progress >= 75 && progress < 100 && (
                        <>
                          Almost there! Just a few more activities to complete
                          your course.
                        </>
                      )}

                      {progress === 100 && (
                        <>
                          Congratulations! You've completed all activities in
                          this course.
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
                        const exactBarsToFill = (value / 100) * totalBars

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
                                height: fillHeight,
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
      <div className="absolute inset-x-0 top-[calc(50vh-20px)] z-10 h-24 w-full rounded-t-20 bg-bg-white-0 drop-shadow-2xl"></div>
      <NavigationLearnerSubHeader
        className={cn("-mt-5 rounded-t-20 bg-bg-white-0", {
          "rounded-t-none bg-bg-white-0/80 shadow-regular-md backdrop-blur-xl":
            !inView,
        })}
        overrideChildren
        hideBreadcrumbs
        mode="light"
      >
        <div className="gutter mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4">
          <AnimatePresence>
            {!inView ? (
              <motion.div
                key="back"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <Avatar.Root placeholderType="company" size="20">
                    <Avatar.Image
                      src={detail?.publication?.featureImageUrl || undefined}
                    />
                  </Avatar.Root>
                  <h1 className="w-full truncate text-label-md font-normal">
                    {detail?.publication?.title}
                  </h1>
                </div>
                <Button.Root
                  mode="filled"
                  variant="primary"
                  size="xxsmall"
                  className="rounded-full"
                  asChild
                >
                  <Link to="/">
                    <Button.Icon as={RiPlayCircleLine} />
                    Continue
                  </Link>
                </Button.Root>
              </motion.div>
            ) : (
              <span></span>
            )}
          </AnimatePresence>
          <TabMenuHorizontal.Root value={hash} className="w-fit">
            <TabMenuHorizontal.List className="border-none">
              <TabMenuHorizontal.Trigger
                onClick={() => {
                  navigate({
                    to: Route.to,
                    params: {
                      uid: params?.uid,
                    },
                    search: search,
                    hash: "overview",
                  })
                }}
                value="overview"
              >
                <TabMenuHorizontal.Icon as={RiCompassLine} />
                Overview
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger
                onClick={() => {
                  navigate({
                    to: Route.to,
                    params: {
                      uid: params?.uid,
                    },
                    search: search,
                    hash: "modules",
                  })
                }}
                value="modules"
              >
                <TabMenuHorizontal.Icon as={RiPlayList2Line} />
                Modules
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger
                onClick={() => {
                  navigate({
                    to: Route.to,
                    params: {
                      uid: params?.uid,
                    },
                    search: search,
                    hash: "about",
                  })
                }}
                value="about"
              >
                <TabMenuHorizontal.Icon as={RiInformationLine} />
                About
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger
                onClick={() => {
                  navigate({
                    to: Route.to,
                    params: {
                      uid: params?.uid,
                    },
                    search: search,
                    hash: "performance",
                  })
                }}
                value="performance"
              >
                <TabMenuHorizontal.Icon as={RiBarChartLine} />
                Performance
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger
                onClick={() => {
                  navigate({
                    to: Route.to,
                    params: {
                      uid: params?.uid,
                    },
                    search: search,
                    hash: "reviews",
                  })
                }}
                value="reviews"
              >
                <TabMenuHorizontal.Icon as={RiStarLine} />
                Reviews
              </TabMenuHorizontal.Trigger>
            </TabMenuHorizontal.List>
          </TabMenuHorizontal.Root>
        </div>
      </NavigationLearnerSubHeader>
      <Section
        size="sm"
        spacer="p"
        className="gutter relative z-10 -mt-5 w-full rounded-t-20 bg-bg-white-0"
      >
        <div className="gutter mx-auto flex max-w-screen-2xl flex-col gap-4">
          <Grid id="overview" gap="none" className="w-full gap-6">
            <div className="col-span-12 flex aspect-square h-full w-full flex-1 flex-col overflow-hidden rounded-[22px] ring-1 ring-stroke-soft-200 xl:col-span-4">
              <div className="relative flex w-full grow items-end gap-7 border-b border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-md">
                <div className="relative aspect-square h-full overflow-hidden rounded-xl bg-primary-base">
                  {lastActiveModule?.imagePath ? (
                    <Image
                      className="absolute inset-0 h-full w-full object-cover"
                      path={lastActiveModule?.imagePath || ""}
                      alt={
                        lastActiveModule?.module?.moduleVersion?.module
                          ?.translations["1"]?.title || "module image"
                      }
                      sizes={`(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 15vw`}
                      lqip={{
                        active: true,
                        quality: 1,
                        blur: 50,
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col">
                  <p className="text-label-xs text-text-soft-400">
                    CONTINUE LEARNING
                  </p>
                  <p className="line-clamp-2 text-pretty text-title-h5">
                    {
                      lastActiveModule?.module?.moduleVersion?.module
                        ?.translations["1"]?.title
                    }
                  </p>
                  <Button.Root
                    variant="primary"
                    mode="lighter"
                    size="small"
                    className="mt-2 w-fit rounded-full p-0.5 pl-3"
                  >
                    <span>Continue</span>
                    <div className="flex aspect-square h-full items-center justify-center rounded-full bg-primary-base">
                      <Button.Icon
                        className="fill-bg-white-0"
                        as={RiArrowRightSLine}
                      />
                    </div>
                  </Button.Root>
                </div>
              </div>
              <Grid
                gap="none"
                className="min-h-[50%] w-full gap-4 bg-bg-weak-50 p-5"
              >
                {lastActiveModule?.module?.learning
                  ?.slice(0, 8)
                  ?.map((lesson) => {
                    const act = activity.flat.get(lesson.uid)
                    return (
                      <Tooltip.Root key={lesson.uid}>
                        <Tooltip.Trigger asChild>
                          <div className="relative col-span-3 aspect-square overflow-hidden rounded-xl bg-primary-base/20 p-2">
                            <Badge.Root
                              square
                              className="absolute left-1.5 top-1.5 z-10 aspect-square p-0.5"
                              color={
                                act?.status === "completed"
                                  ? "green"
                                  : act?.status === "in-progress"
                                    ? "blue"
                                    : "gray"
                              }
                            >
                              {act?.status === "completed" ? (
                                <RiCheckboxCircleFill className="size-3" />
                              ) : (
                                <RiRecordCircleLine className="size-3" />
                              )}
                            </Badge.Root>
                            <p className="absolute -bottom-[1.25rem] left-4 text-[5rem] font-black leading-none text-static-white/50">
                              {lesson?.title?.[0]}
                            </p>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content className="capitalize">
                          <p>
                            {act?.status.replace("-", " ")}: {lesson?.title}
                          </p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    )
                  })}
              </Grid>
            </div>
            <div className="col-span-12 flex aspect-[1/2] flex-col gap-6 md:col-span-6 md:aspect-square xl:col-span-4">
              <Bookmarks
                identifierKey="enrolmentUid"
                identifiers={[detail?.uid]}
              />
              <CoursesNotes enrolments={[detail]} />
            </div>

            <CoursesSchedule enrolments={[detail]} />
          </Grid>
          <Section
            id="modules"
            size="sm"
            className="flex flex-col gap-4"
            spacer="p"
          >
            <h2 className="text-title-h4">Modules</h2>
            <Grid gap="none" className="gap-2">
              {detail?.publication?.material?.map((material, materialIndex) => {
                const modImagePath = getPathFromGoogleStorage(
                  material?.moduleVersion?.module?.featureImageUrl || ""
                )
                const act = activity.flat.get(material.uid)
                return (
                  <button
                    onClick={() => {
                      navigate({
                        resetScroll: false,
                        search: (prev) => ({
                          ...prev,
                          moduleUid: material.uid,
                        }),
                      })
                    }}
                    onMouseOver={() => {
                      if (!material?.moduleVersion?.module?.featureImageUrl)
                        return null
                      queryClient.prefetchQuery(
                        trpc.palette.get.queryOptions({
                          url:
                            material?.moduleVersion?.module?.featureImageUrl ||
                            "",
                        })
                      )
                    }}
                    className={cn(
                      "col-span-12 flex cursor-pointer items-center gap-8 border-b px-4 py-3 transition-colors hover:bg-bg-weak-50 xl:col-span-6",
                      {
                        // "border bg-muted-foreground/10 shadow-lg": moduleUid === uid,
                      }
                    )}
                    key={material.uid}
                  >
                    <Image
                      lqip={{
                        active: true,
                        quality: 1,
                        blur: 50,
                      }}
                      className="size-14 rounded-10 object-cover"
                      path={modImagePath || ""}
                      alt={
                        material?.moduleVersion?.module?.translations["1"]
                          ?.title || "module image"
                      }
                    />
                    <div className="flex grow flex-col gap-1 text-left">
                      <h3 className="line-clamp-1 text-pretty text-label-lg">
                        {
                          material.moduleVersion?.module?.translations["1"]
                            ?.title
                        }
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-label-xs text-text-soft-400">
                          {Object.entries(material?.duration ?? {}).length >
                            0 &&
                          !Object.entries(material?.duration ?? {}).every(
                            ([_, value]) => value === 0
                          )
                            ? Object.entries(material?.duration ?? {})
                                .map(([key, value]) => {
                                  if (
                                    !key ||
                                    !value ||
                                    value === 0 ||
                                    key === "0"
                                  )
                                    return "No Duration"
                                  return (
                                    <span key={key}>
                                      {value} {key}
                                    </span>
                                  )
                                })
                                .filter(Boolean)
                            : "No Duration"}
                        </span>

                        <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                        <div className="flex items-center gap-2 capitalize">
                          <Badge.Root
                            variant="light"
                            {...(act?.status === "completed" && {
                              color: "green",
                            })}
                            {...(act?.status === "in-progress" && {
                              color: "blue",
                            })}
                            {...(act?.status === "not-started" && {
                              color: "gray",
                              variant: "stroke",
                            })}
                            {...(act?.status === "failed" && {
                              color: "red",
                            })}
                            size="small"
                            className="capitalize"
                          >
                            {act?.status === "completed" && (
                              <Badge.Icon as={RiCheckboxCircleFill} />
                            )}
                            {act?.status === "in-progress" && (
                              <Badge.Icon as={RiRecordCircleLine} />
                            )}
                            {act?.status === "failed" && (
                              <Badge.Icon as={RiCloseCircleFill} />
                            )}
                            {act?.status.replace("-", " ")}
                          </Badge.Root>

                          {isLocked(material.uid, materialIndex) && (
                            <>
                              <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <RiLockLine className="size-3 text-yellow-600" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>
                                    Locked! Complete previous modules first.
                                  </p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-label-xs text-text-sub-600">
                      {materialIndex + 1 < 10 && "0"}
                      {materialIndex + 1}
                    </span>
                  </button>
                )
              })}
            </Grid>
          </Section>
        </div>
      </Section>
    </>
  )
}
