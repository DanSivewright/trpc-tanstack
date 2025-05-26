import { Suspense, useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { groupBy } from "@/utils/group-by"
import { faker } from "@faker-js/faker"
import {
  RiAddLine,
  RiArrowDownSLine,
  RiEyeLine,
  RiLoopLeftLine,
  RiMessageLine,
  RiUserLine,
} from "@remixicon/react"
import {
  useQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from "@tanstack/react-router"
import { differenceInHours, format, isBefore } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FancyButton } from "@/components/ui/fancy-button"
import { Input } from "@/components/ui/input"
import { StarRating } from "@/components/ui/svg-rating-icons"
import { Tooltip } from "@/components/ui/tooltip"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/chart"
import { Grid } from "@/components/grid"
import { Section } from "@/components/section"

export const Route = createFileRoute("/_learner/communities/$id/courses/")({
  validateSearch: z.object({
    q: z.string().default(""),
    type: z
      .enum(["all", "enrolled", "not-enrolled"])
      .catch("all")
      .default("all"),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        type: "all",
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
    // context.queryClient.prefetchQuery(
    //   context.trpc.communities.courses.all.queryOptions({
    //     communityId: params.id,
    //   })
    // )
    // context.queryClient.prefetchQuery(
    //   context.trpc.communities.detail.queryOptions({
    //     id: params.id,
    //   })
    // )
    // context.queryClient.prefetchQuery(context.trpc.people.me.queryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()

  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const courses = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId: params.id,
    })
  )

  const enrolmentsQuery = useSuspenseQuery(
    trpc.enrolments.all.queryOptions({
      query: {
        contentType: "digital,mixded",
        include: "completed",
        limit: 100,
      },
    })
  )
  const enrolments = useMemo(
    () =>
      enrolmentsQuery.data?.enrolments?.filter((e) =>
        courses?.data?.find((c) => c.publicationUid === e.publication?.uid)
      ),
    [enrolmentsQuery.data?.enrolments, courses?.data]
  )

  const enrolmentDetails = useSuspenseQueries({
    queries: enrolments
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

  console.log("acts:::", {
    activityMapPerDetail,
    grouped: Array.from(activityMapPerDetail.entries()).map(([key, value]) => {
      return {
        [key]: groupBy(value, (x) => x.type),
      }
    }),
  })
  // const allEnrolmentsForAllCourses = useSuspenseQueries({
  //   queries: courses?.data?.map((c) =>
  //     trpc.content.enrolments?.queryOptions({
  //       params: {
  //         type: c.typeAccessor,
  //         typeUid: c.typeUid,
  //       },
  //       query: {
  //         page: 1,
  //         limit: 100,
  //       },
  //     })
  //   ),
  // })

  // const onlyMemberEnrolments = useMemo(() => {
  //   return allEnrolmentsForAllCourses?.filter((e) => {
  //     return e.data?.filter((enrolment) =>
  //       courses?.data?.find(
  //         (c) =>
  //           c.publicationUid === enrolment?.publicationUid &&
  //           c.enrolments?.some((x) => x.enrolleeUid === enrolment?.person?.uid)
  //       )
  //     )
  //   })
  // }, [allEnrolmentsForAllCourses])

  const chartData = useMemo(
    () =>
      courses?.data?.map((c) => ({
        title: c?.content?.content?.title,
        score: faker.number.int({ min: 0, max: 100 }),
      })),
    [courses?.data]
  )
  // const chartData = [
  //   // { month: "January", mobile: 80 },
  //   // { month: "February", mobile: 200 },
  //   // { month: "March", mobile: 120 },
  //   // { month: "April", mobile: 190 },
  //   // { month: "May", mobile: 130 },
  //   // { month: "June", mobile: 140 },
  // ]
  const chartConfig = {
    score: {
      label: "Score",
      color: "rgb(var(--primary-dark))",
    },
  } satisfies ChartConfig

  return (
    <>
      <header className="gutter h-[calc(50vh-92px)] bg-bg-soft-200">
        <Grid className="h-full w-full py-6 pb-10">
          <div className="col-span-12 flex h-full flex-col justify-between gap-8 xl:col-span-4">
            <h1 className="text-pretty text-title-h2 font-normal">
              Keep <span className="opacity-45">Your</span>
              <br /> Learning Going
            </h1>
            <div className="flex w-full flex-col pb-5">
              <p className="leading-none opacity-45">Learning Completed</p>
              <p className="shrink-0 text-[10rem] leading-none">87%</p>
            </div>
          </div>
          <div className="col-span-12 flex h-full flex-col xl:col-span-8">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-title-h5">Activity</h2>
              <div className="flex items-center gap-3">
                <Badge.Root
                  size="small"
                  color="gray"
                  variant="stroke"
                  className="ring-0"
                >
                  <Badge.Dot />
                  <span>Community</span>
                </Badge.Root>
                <Badge.Root
                  size="small"
                  color="purple"
                  variant="stroke"
                  className="ring-0"
                >
                  <Badge.Dot />
                  <span>Me</span>
                </Badge.Root>
                <Button.Root
                  className="rounded-full"
                  size="xxsmall"
                  variant="neutral"
                  mode="lighter"
                >
                  <Button.Icon as={RiArrowDownSLine} />
                  All Time
                </Button.Root>
              </div>
            </header>
            <div className="w-full grow">
              <ChartContainer
                config={chartConfig}
                className="max-h-[300px] min-h-[calc(50vh-184px)] w-full"
              >
                <BarChart accessibilityLayer data={chartData}>
                  <XAxis
                    dataKey="title"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />

                  <Bar
                    //
                    dataKey="score"
                    fill="var(--color-score)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </Grid>
      </header>
      <pre>{JSON.stringify(enrolmentDetails, null, 2)}</pre>
      {/* <Suspense
        fallback={
          <div className="h-[500px] w-full animate-pulse bg-bg-soft-200" />
        }
      >
        <FeaturedCourse communityId={params.id} />
      </Suspense> */}
      {/* <Section
        size="sm"
        spacer="p"
        className="mx-auto flex max-w-screen-lg flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button.Root
              onClick={() => {
                navigate({
                  resetScroll: false,
                  search: (old) => ({
                    ...old,
                    type: "all",
                  }),
                })
              }}
              {...(search.type === "all" || search.type === undefined
                ? {
                    variant: "primary",
                    mode: "lighter",
                  }
                : {
                    variant: "neutral",
                    mode: "ghost",
                  })}
              size="xxsmall"
            >
              <Button.Icon as={RiLoopLeftLine} />
              All
            </Button.Root>
            <Button.Root
              onClick={() => {
                navigate({
                  resetScroll: false,
                  search: (old) => ({ ...old, type: "enrolled" }),
                })
              }}
              {...(search.type === "enrolled"
                ? {
                    variant: "primary",
                    mode: "lighter",
                  }
                : {
                    variant: "neutral",
                    mode: "ghost",
                  })}
              size="xxsmall"
            >
              <Button.Icon as={RiUserLine} />
              My Courses
            </Button.Root>
            <Button.Root
              onClick={() => {
                navigate({
                  resetScroll: false,
                  search: (old) => ({ ...old, type: "not-enrolled" }),
                })
              }}
              {...(search.type === "not-enrolled"
                ? {
                    variant: "primary",
                    mode: "lighter",
                  }
                : {
                    variant: "neutral",
                    mode: "ghost",
                  })}
              size="xxsmall"
            >
              <Button.Icon as={RiAddLine} />
              Not Enrolled
            </Button.Root>
          </div>
          <Input.Root size="medium">
            <Input.Wrapper>
              <Input.Field
                value={search.q}
                onChange={(e) =>
                  navigate({
                    resetScroll: false,
                    search: (old) => ({
                      ...old,
                      q: e.target.value,
                    }),
                  })
                }
                type="text"
                placeholder="Find a course..."
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="flex flex-col">
          <h2 className="text-label-md text-text-soft-400">Courses</h2>

          <Suspense fallback={<CourseListSkeleton />}>
            <CourseList />
          </Suspense>
        </div>
      </Section> */}
    </>
  )
}

function FeaturedCourse({ communityId }: { communityId: string }) {
  const trpc = useTRPC()
  const coursesQuery = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId,
    })
  )
  const featured = coursesQuery.data?.find(
    (course) => course.isFeatured && course.status === "published"
  )

  if (!featured) {
    return null
  }

  return (
    <header className="relative h-[500px] w-full">
      <img
        src={featured.content?.featureImageUrl || undefined}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        alt={featured.title + " featured image"}
      />
      <div className="absolute bottom-0 left-1/2 top-0 z-10 flex w-full max-w-screen-lg -translate-x-1/2 items-end px-8 pb-12 xl:px-0">
        <div className="flex w-full items-end justify-between">
          <div className="flex w-3/4 flex-col gap-2">
            <div className="flex items-center gap-5">
              {featured?.enrolments && featured?.enrolments.length > 0 && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <AvatarGroupCompact.Root size="24">
                      <AvatarGroupCompact.Stack>
                        {featured?.enrolments
                          ?.slice(0, 3)
                          .map((enrolment) => (
                            <Avatar.Root color="sky">
                              {enrolment.enrollee.avatarUrl ? (
                                <Avatar.Image
                                  src={enrolment.enrollee.avatarUrl}
                                />
                              ) : (
                                enrolment?.enrollee?.firstName?.[0]
                              )}
                            </Avatar.Root>
                          ))}
                      </AvatarGroupCompact.Stack>
                      {featured?.enrolments.length > 3 && (
                        <AvatarGroupCompact.Overflow>
                          +{featured?.enrolments.length - 3}
                        </AvatarGroupCompact.Overflow>
                      )}
                    </AvatarGroupCompact.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Community Enrolments</Tooltip.Content>
                </Tooltip.Root>
              )}
              <div className="h-4 w-px rotate-12 bg-white opacity-45"></div>
              <div className="flex items-center gap-2">
                <StarRating rating={4.5} />
                <span className="pt-1 text-paragraph-xs text-white">
                  4.5 ∙ 5.2K Ratings
                </span>
              </div>
              <div className="h-4 w-px rotate-12 bg-white opacity-45"></div>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="flex w-fit items-center gap-3">
                    <Avatar.Root color="sky" size="20">
                      {featured?.content?.createdBy?.imageUrl ? (
                        <Avatar.Image
                          src={
                            import.meta.env.DEV
                              ? "https://www.alignui.com/images/avatar/illustration/wei.png"
                              : featured?.content?.createdBy?.imageUrl
                          }
                        />
                      ) : (
                        featured?.content?.createdBy?.firstName?.[0]
                      )}
                    </Avatar.Root>
                    <span className="text-label-sm text-white opacity-90">
                      {featured?.content?.createdBy?.firstName}{" "}
                      {featured?.content?.createdBy?.lastName}
                    </span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content>Publisher</Tooltip.Content>
              </Tooltip.Root>
            </div>
            <h1 className="text-pretty text-title-h2 text-white">
              {featured.title}
            </h1>
            <p className="text-label-md text-white opacity-70">
              {featured.caption}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {featured?.tags?.map((tag) => (
                <Badge.Root key={tag}>{tag}</Badge.Root>
              ))}
            </div>
          </div>
          <div className="flex w-1/4 items-center gap-2">
            <Button.Root
              size="medium"
              variant="neutral"
              mode="lighter"
              className="rounded-full"
              asChild
            >
              <Link
                to="/communities/$id/courses/$courseId"
                params={{
                  id: communityId,
                  courseId: featured.id,
                }}
                search={{
                  type: featured.typeAccessor,
                  typeUid: featured.typeUid,
                }}
                preload="intent"
              >
                View Course
              </Link>
            </Button.Root>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-0 h-[85%] bg-gradient-to-t from-black to-transparent"></div>
    </header>
  )
}

function CourseList() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: params.id,
    })
  )
  const me = useSuspenseQuery(trpc.people.me.queryOptions())
  const coursesQuery = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId: params.id,
    })
  )

  const courses = useMemo(() => {
    let filteredCourses = coursesQuery.data

    if (search.type === "enrolled") {
      filteredCourses = filteredCourses?.filter((course) =>
        course.enrolments?.some(
          (enrolment) => enrolment.enrolleeUid === me.data?.uid
        )
      )
    }
    if (search.type === "not-enrolled") {
      filteredCourses = filteredCourses?.filter(
        (course) =>
          !course.enrolments?.some(
            (enrolment) => enrolment.enrolleeUid === me.data?.uid
          )
      )
    }

    if (search.q && search.q !== "") {
      filteredCourses = filteredCourses?.filter((course) =>
        course.title.toLowerCase().includes(search.q.toLowerCase())
      )
    }

    return filteredCourses
  }, [coursesQuery.data, search.type, search.q, me.data?.uid])
  return (
    <ul className="flex flex-col gap-1">
      {courses && courses.length > 0 ? (
        courses?.map((course) => {
          if (
            community?.data?.membership?.role === "member" &&
            course.status === "draft"
          ) {
            return null
          }
          return (
            <li key={course.id}>
              <Link
                to="/communities/$id/courses/$courseId"
                params={{
                  id: params.id,
                  courseId: course.id,
                }}
                search={{
                  type: course.typeAccessor,
                  typeUid: course.typeUid,
                }}
                preload="intent"
                className="flex cursor-pointer items-center justify-between rounded-10 py-4 transition-all"
              >
                <div className="flex w-full max-w-[66%] items-center gap-3">
                  <Avatar.Root color="sky" size="32">
                    {course.content?.featureImageUrl ? (
                      <Avatar.Image src={course.content?.featureImageUrl} />
                    ) : (
                      course.title?.[0]
                    )}
                  </Avatar.Root>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-label-md font-normal">
                        {course.title}
                      </h3>
                      {course.createdAt &&
                        differenceInHours(new Date(), course.createdAt) <=
                          48 && (
                          <Badge.Root
                            size="small"
                            color="green"
                            className="capitalize"
                          >
                            <Badge.Dot />
                            New
                          </Badge.Root>
                        )}

                      {course.enrolments?.some(
                        (enrolment) => enrolment.enrolleeUid === me.data?.uid
                      ) && (
                        <Badge.Root
                          className="capitalize"
                          size="small"
                          variant="lighter"
                          color="blue"
                        >
                          <Badge.Dot />
                          Enrolled
                        </Badge.Root>
                      )}
                      {course?.status === "draft" && (
                        <Badge.Root
                          className="capitalize"
                          size="small"
                          variant="light"
                          color="gray"
                        >
                          Draft
                        </Badge.Root>
                      )}
                      {course?.isFeatured && (
                        <>
                          {!course?.isFeaturedUntil && (
                            <Badge.Root
                              className="capitalize"
                              size="small"
                              color="purple"
                            >
                              Featured
                            </Badge.Root>
                          )}
                          {course?.isFeaturedUntil &&
                            isBefore(
                              new Date(),
                              new Date(course.isFeaturedUntil)
                            ) && (
                              <Badge.Root
                                className="shrink-0 capitalize"
                                size="small"
                                color="purple"
                              >
                                Featured Until
                                {course?.isFeaturedUntil && (
                                  <span>
                                    {format(
                                      new Date(course.isFeaturedUntil),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                )}
                              </Badge.Root>
                            )}
                        </>
                      )}
                    </div>
                    <p className="line-clamp-1 text-label-xs text-text-soft-400">
                      {course.caption}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Button.Root
                          variant="neutral"
                          mode="ghost"
                          size="xxsmall"
                        >
                          <Button.Icon as={RiMessageLine} />
                          {course.commentsCount || 0}
                        </Button.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Course Comments</Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Button.Root
                          variant="neutral"
                          mode="ghost"
                          size="xxsmall"
                        >
                          <Button.Icon as={RiEyeLine} />
                          {course.views || 0}
                        </Button.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Course Views</Tooltip.Content>
                    </Tooltip.Root>
                  </div>

                  {course?.enrolments && course?.enrolments.length > 0 && (
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <AvatarGroupCompact.Root
                          className="bg-bg-weak-50"
                          size="24"
                        >
                          <AvatarGroupCompact.Stack>
                            {course?.enrolments
                              ?.slice(0, 3)
                              .map((enrolment) => (
                                <Avatar.Root color="sky">
                                  {enrolment.enrollee.avatarUrl ? (
                                    <Avatar.Image
                                      src={enrolment.enrollee.avatarUrl}
                                    />
                                  ) : (
                                    enrolment?.enrollee?.firstName?.[0]
                                  )}
                                </Avatar.Root>
                              ))}
                          </AvatarGroupCompact.Stack>
                          {course?.enrolments.length > 3 && (
                            <AvatarGroupCompact.Overflow>
                              +{course?.enrolments.length - 3}
                            </AvatarGroupCompact.Overflow>
                          )}
                        </AvatarGroupCompact.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Community Enrolments</Tooltip.Content>
                    </Tooltip.Root>
                  )}
                </div>
              </Link>
            </li>
          )
        })
      ) : (
        <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
          <h1 className="relative z-10 text-title-h4">
            {search.q && search.q !== "" ? (
              <>
                {search.type === "enrolled"
                  ? "Couldn't find any courses you are enrolled in"
                  : search.type === "not-enrolled"
                    ? "Couldn't find any courses you are not enrolled in"
                    : "Couldn't find any courses"}{" "}
                with: <span className="font-bold italic">{search.q}</span>
              </>
            ) : (
              <>
                {search.type === "enrolled"
                  ? "You are not enrolled in any courses"
                  : search.type === "not-enrolled"
                    ? "You are enrolled in all courses"
                    : "Your community has no courses"}
              </>
            )}
          </h1>
          <p className="relative z-10 text-label-sm font-light text-text-soft-400">
            {community?.data?.membership?.role === "admin" ? (
              <>
                {!search.q && search.type === "all"
                  ? "Be the first to create a course in this community."
                  : "Couldn't find any courses. Create a new course below."}
              </>
            ) : (
              "Ask your community admin to create a new course."
            )}
          </p>
          {community?.data?.membership?.role === "admin" ? (
            <div className="flex items-center gap-3">
              <FancyButton.Root
                size="xsmall"
                variant="basic"
                className="relative z-10"
              >
                <FancyButton.Icon as={RiAddLine} />
                Create a course
              </FancyButton.Root>
            </div>
          ) : null}

          <RiAddLine
            className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
            size={450}
          />
        </div>
      )}
    </ul>
  )
}

function CourseListSkeleton() {
  return (
    <ul className="flex flex-col gap-1">
      <li className="group flex cursor-pointer items-center justify-between rounded-10 py-4 transition-all hover:px-4">
        <div className="flex w-full max-w-[66%] items-center gap-3">
          <div className="size-8 animate-pulse rounded-full bg-bg-soft-200"></div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-48 animate-pulse rounded-10 bg-bg-soft-200"></div>
            <div className="h-2 w-24 animate-pulse rounded-10 bg-bg-soft-200"></div>
          </div>
        </div>
      </li>
      <li className="group flex cursor-pointer items-center justify-between rounded-10 py-4 transition-all hover:px-4">
        <div className="flex w-full max-w-[66%] items-center gap-3">
          <div className="size-8 animate-pulse rounded-full bg-bg-soft-200"></div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-48 animate-pulse rounded-10 bg-bg-soft-200"></div>
            <div className="h-2 w-24 animate-pulse rounded-10 bg-bg-soft-200"></div>
          </div>
        </div>
      </li>
      <li className="group flex cursor-pointer items-center justify-between rounded-10 py-4 transition-all hover:px-4">
        <div className="flex w-full max-w-[66%] items-center gap-3">
          <div className="size-8 animate-pulse rounded-full bg-bg-soft-200"></div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-48 animate-pulse rounded-10 bg-bg-soft-200"></div>
            <div className="h-2 w-24 animate-pulse rounded-10 bg-bg-soft-200"></div>
          </div>
        </div>
      </li>
    </ul>
  )
}
