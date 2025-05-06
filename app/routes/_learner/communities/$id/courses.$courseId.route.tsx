import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import {
  RiBarChartLine,
  RiGroupLine,
  RiLayoutGridLine,
  RiLoaderLine,
} from "@remixicon/react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/ui/svg-rating-icons"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"

export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId"
)({
  loader: async ({ context, params: { id, courseId } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.communities.courseDetail.queryOptions({
          communityId: id,
          courseId,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.communities.detail.queryOptions({
          id,
        })
      ),
    ])
  },
  component: RouteComponent,
})
function RouteComponent() {
  const params = Route.useParams()
  const trpc = useTRPC()
  const location = useLocation()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: params.id,
    })
  )

  const modules = useQuery(
    trpc.content.modules.queryOptions({
      params: {
        type: course.data?.typeAccessor,
        typeUid: course.data?.typeUid,
      },
    })
  )

  const contentSize = useElementSize()
  const containerSize = useElementSize()
  const padding = useMemo(() => {
    // const width = containerSize.width
    // const contentWidth = contentSize.width
    // return (width - contentWidth) / 2 + 32 + "px"
    return (containerSize.width - contentSize.width) / 2 + "px"
  }, [containerSize.width, contentSize.width])

  const badges = useMemo(() => {
    return modules?.data?.filter((m: any) => m?.badge?.uid).length
  }, [modules?.data])

  return (
    <>
      <header ref={containerSize.ref} className="relative h-[500px] w-full">
        <img
          src={course.data.content?.featureImageUrl || undefined}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          alt={course.data.title + " featured image"}
        />
        <div
          ref={contentSize.ref}
          className="absolute bottom-0 left-1/2 top-0 z-10 flex w-full max-w-screen-lg -translate-x-1/2 items-end px-8 pb-12 xl:px-0"
        >
          <div className="flex w-full items-end justify-between">
            <div className="flex w-3/4 flex-col gap-2">
              <div className="flex items-center gap-5">
                {course.data?.enrolments &&
                  course.data?.enrolments.length > 0 && (
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <AvatarGroupCompact.Root size="24">
                          <AvatarGroupCompact.Stack>
                            {course.data?.enrolments
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
                          <AvatarGroupCompact.Overflow>
                            +{course.data?.enrolments.length - 3}
                          </AvatarGroupCompact.Overflow>
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
              </div>
              <h1 className="text-pretty text-title-h2 text-white">
                {course.data.title}
              </h1>
              <p className="text-label-md text-white opacity-70">
                {course.data.caption}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Badge.Root
                      className="capitalize"
                      color={badges === 0 ? "red" : "blue"}
                      variant="filled"
                    >
                      Earns:
                      {modules?.isLoading ? (
                        <Badge.Icon
                          className="animate-spin"
                          as={RiLoaderLine}
                        />
                      ) : (
                        <> {badges === 0 ? "No" : badges} </>
                      )}
                      Badge{badges === 1 ? "" : "s"}
                    </Badge.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Badges</Tooltip.Content>
                </Tooltip.Root>
                {course.data?.tags?.map((tag) => (
                  <Badge.Root className="capitalize" key={tag}>
                    {tag}
                  </Badge.Root>
                ))}
              </div>
            </div>
            <div className="flex w-1/4 items-center gap-2">
              <Button.Root
                size="medium"
                variant="neutral"
                mode="lighter"
                className="rounded-full"
              >
                Button
              </Button.Root>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-0 h-[85%] bg-gradient-to-t from-black to-transparent"></div>
      </header>
      <div
        style={{
          paddingLeft: padding,
          paddingRight: padding,
        }}
        className="sticky top-12 z-10 flex items-center justify-between gap-8 border-b border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs"
      >
        <TabMenuHorizontal.Root className="" defaultValue={location.pathname}>
          <TabMenuHorizontal.List className="border-none">
            <TabMenuHorizontal.Trigger
              value={`/communities/${params.id}/courses/${params.courseId}`}
              asChild
            >
              <Link
                to="/communities/$id/courses/$courseId"
                params={{
                  id: params.id,
                  courseId: params.courseId,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiLayoutGridLine} />
                Overview
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${params.id}/courses/${params.courseId}/enrolments`}
              asChild
            >
              <Link
                to="/communities/$id/courses/$courseId/enrolments"
                params={{
                  id: params.id,
                  courseId: params.courseId,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiGroupLine} />
                Enrolments
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${params.id}/courses/${params.courseId}/performance`}
              asChild
            >
              <Link
                to="/communities/$id/courses/$courseId/performance"
                params={{
                  id: params.id,
                  courseId: params.courseId,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiBarChartLine} />
                Performance
              </Link>
            </TabMenuHorizontal.Trigger>
          </TabMenuHorizontal.List>
        </TabMenuHorizontal.Root>
        <div className="flex items-center">
          {/* <Button.Root size="xxsmall">Test</Button.Root> */}
        </div>
      </div>
      <Grid
        gap="none"
        className="mx-auto mt-8 max-w-screen-lg gap-8 px-8 xl:px-0"
      >
        <div className="col-span-9">
          <Outlet />
        </div>
        <div className="col-span-3">x</div>
      </Grid>
    </>
  )
}
