import { useEffect, useMemo, useRef, useState } from "react"
import db from "@/integrations/firebase/client"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { cn } from "@/utils/cn"
import {
  enrolmentColumns,
  formatEnrolment,
  formatModule,
} from "@/utils/format-table-enrolments"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { groupBy } from "@/utils/group-by"
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiSearchLine,
} from "@remixicon/react"
import {
  useQueries,
  useQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import type { ExpandedState } from "@tanstack/table-core"
import { differenceInHours, format, isBefore } from "date-fns"
import Autoplay from "embla-carousel-autoplay"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Bar, BarChart, XAxis } from "recharts"
import { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { useLocalStorage } from "@/hooks/use-local-storage"
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
import { Datepicker } from "@/components/ui/datepicker"
import { DotStepper } from "@/components/ui/dot-stepper"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Popover } from "@/components/ui/popover"
import { Tooltip } from "@/components/ui/tooltip"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/chart"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { NumberTicker } from "@/components/number-ticker"
import { Section } from "@/components/section"

import CoursesBookmarks from "./-components/courses-bookmarks"
import CoursesEnrolmentsTable from "./-components/courses-enrolments-table"
import CoursesHeader from "./-components/courses-header"
import CoursesLastActive from "./-components/courses-last-active"
import CoursesSchedule from "./-components/courses-schedule"

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

export const Route = createFileRoute("/_learner/communities/$id/courses/")({
  validateSearch: z.object({
    q: z.string().default(""),
    expanded: z.custom<ExpandedState>().default({}),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        expanded: {},
      }),
    ],
  },
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.communities.courses.all.queryOptions({
          communityId: params.id,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.enrolments.all.queryOptions({
          query: {
            contentType: "digital,mixded",
            include: "completed",
            limit: 100,
          },
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.people.me.queryOptions()
      ),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [range, setRange] = useLocalStorage<"d" | "w" | "m" | "y" | string[]>({
    key: "learner-communities-courses-range",
    defaultValue: "m",
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

  const courses = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId: params.id,
    })
  )

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
      .filter((x) => {
        if (x.publication?.type !== "course") return false
        if (courses?.data?.find((c) => c.publicationUid === x.publication?.uid))
          return true
        return false
      })
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

  return (
    <>
      <CoursesHeader activity={activity} />
      <div className="absolute inset-x-0 top-[calc(50vh-20px)] z-0 h-24 w-full rounded-t-20 bg-bg-white-0 drop-shadow-2xl"></div>
      <Section
        size="sm"
        spacer="p"
        className="gutter relative z-10 -mt-5 w-full rounded-t-20 bg-bg-white-0"
      >
        <Grid gap="none" className="w-full gap-6">
          {/* <div className="relative col-span-12 flex aspect-video h-full w-full flex-1 grow flex-col rounded-[22px] bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200 xl:col-span-8 xl:aspect-auto">
            <header className="flex h-12 grow items-center px-3 pb-1">
              <h2 className="text-title-h6">
                Recent Learning{" "}
                <span className="text-label-sm text-text-soft-400">
                  ({enrolmentDetails?.length})
                </span>
              </h2>
            </header>
            <div
              ref={carouselSize.ref}
              className="relative h-full w-full grow overflow-hidden rounded-[18px] bg-pink-50"
            >
              <Carousel
                opts={{
                  loop: true,
                }}
                // plugins={[
                //   Autoplay({
                //     delay: 2000,
                //   }),
                // ]}
                setApi={setApi}
                className="absolute inset-0 bg-blue-50"
              >
                <CarouselContent>
                  {enrolmentDetails?.map((detail) => {
                    const enrolment = detail.data
                    const palette = palettes.find(
                      (p) =>
                        p.data?.url === enrolment?.publication?.featureImageUrl
                    )
                    const imagePath = getPathFromGoogleStorage(
                      enrolment?.publication?.featureImageUrl ?? ""
                    )
                    return (
                      <CarouselItem key={"recent-" + enrolment?.uid}>
                        <div
                          style={{
                            height: `${height.current || 0 - 20}px`,
                          }}
                          className="relative h-full w-full overflow-hidden rounded-[18px]"
                        >
                          <div
                            style={{
                              background: palette?.data
                                ? `linear-gradient(0deg, rgba(${palette?.data?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`
                                : "",
                            }}
                            className={cn(
                              "absolute inset-x-0 bottom-0 z-[1] h-[65%]",
                              {
                                "bg-gradient-to-t from-primary-base/35 to-transparent":
                                  !palette?.data,
                              }
                            )}
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
                          {imagePath ? (
                            <Image
                              lqip={{
                                active: true,
                                quality: 1,
                                blur: 50,
                              }}
                              sizes="(max-width: 1280px) 100vw, 66vw"
                              className="absolute inset-0 h-full w-full object-cover"
                              path={imagePath ?? ""}
                            />
                          ) : (
                            <div className="absolute inset-0 overflow-hidden bg-primary-alpha-24">
                              <p className="absolute -top-[3.75vw] left-1/4 text-wrap text-[15vw] font-black italic leading-none text-primary-base opacity-5">
                                {enrolment?.publication?.title}
                              </p>
                            </div>
                          )}
                          <div
                            style={{
                              color:
                                palette?.data?.LightMuted?.titleTextColor ||
                                "#FFFFFF",
                            }}
                            className="absolute inset-0 z-10 flex flex-col justify-end gap-2 p-8"
                          >
                            {enrolment?.dueDate && (
                              <Badge.Root className="w-fit">
                                <Badge.Icon as={RiCalendarLine} />
                                {format(
                                  new Date(enrolment?.dueDate),
                                  "MMM d, yyyy"
                                )}
                              </Badge.Root>
                            )}
                            <h1 className="line-clamp-3 text-title-h5">
                              {enrolment?.publication?.publishedBy && (
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <Avatar.Root
                                      className="mr-2 inline-flex"
                                      size="20"
                                    >
                                      <Avatar.Image
                                        src={
                                          enrolment?.publication?.publishedBy
                                            ?.imageUrl
                                        }
                                      />
                                    </Avatar.Root>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>
                                    Publisher:{" "}
                                    {enrolment?.publication?.publishedBy?.name}
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              )}

                              {enrolment.publication.title}
                            </h1>
                            <p className="line-clamp-2 text-label-sm opacity-70">
                              {enrolment.publication.summary ||
                                enrolment?.publication?.translations?.["1"]
                                  ?.summary}
                            </p>
                            {enrolment?.publication?.topics && (
                              <div className="flex flex-wrap gap-2">
                                {enrolment?.publication?.topics?.map(
                                  (topic) => (
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
                                  )
                                )}
                              </div>
                            )}
                            <Button.Root
                              variant="neutral"
                              mode="lighter"
                              className="mt-2 w-fit rounded-full p-0.5 pl-3"
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
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
              </Carousel>
            </div>
            <div
              //
              className="absolute bottom-3 left-1/2 z-50 w-fit -translate-x-1/2 rounded-full bg-white/20 px-1.5 py-1 backdrop-blur-md"
            >
              <DotStepper.Root>
                {enrolmentDetails?.map((_, i) => (
                  <DotStepper.Item
                    key={"dot-" + i}
                    aria-label={`Go to image ${i}`}
                    active={i + 1 === current}
                    onClick={() => {
                      if (i + 1 !== current) {
                        api?.scrollTo(i)
                      }
                    }}
                  />
                ))}
              </DotStepper.Root>
            </div>
          </div> */}
          <CoursesLastActive
            enrolments={flatEnrolmentDetails}
            activity={activity}
          />
          <CoursesBookmarks enrolments={flatEnrolmentDetails} />
          <CoursesSchedule enrolments={flatEnrolmentDetails} />
          <CoursesEnrolmentsTable
            enrolments={flatEnrolmentDetails}
            activity={activity}
          />
        </Grid>
      </Section>
    </>
  )
}
