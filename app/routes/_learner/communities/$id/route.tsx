import {
  RiAddLine,
  RiArticleLine,
  RiCalendarEventLine,
  RiGraduationCapLine,
  RiHashtag,
  RiLayoutMasonryLine,
  RiLoaderLine,
} from "@remixicon/react"
import {
  createFileRoute,
  Link,
  MatchRoute,
  Outlet,
  useLocation,
} from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"

export const Route = createFileRoute("/_learner/communities/$id")({
  loader: async ({ context, params: { id } }) => {
    const community = await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    context.queryClient.prefetchQuery(
      context.trpc.communities.joined.queryOptions()
    )
    return {
      community,
      crumb: community?.name,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const { id } = Route.useParams()
  return (
    <>
      <NavigationLearnerSubHeader>
        <TabMenuHorizontal.Root value={location.pathname} className="w-fit">
          <TabMenuHorizontal.List className="border-none">
            <TabMenuHorizontal.Trigger value={`/communities/${id}`} asChild>
              <Link
                to="/communities/$id"
                params={{
                  id,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiLayoutMasonryLine} />
                Feed
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              asChild
              value={`/communities/${id}/articles`}
            >
              <Link
                to="/communities/$id/articles"
                params={{
                  id,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiArticleLine} />
                Articles
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${id}/threads`}
              asChild
            >
              <Link
                to="/communities/$id/threads"
                params={{
                  id,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiHashtag} />
                Threads
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${id}/events`}
              asChild
            >
              <Link
                to="/communities/$id/events"
                params={{
                  id,
                }}
                preload="intent"
              >
                <TabMenuHorizontal.Icon as={RiCalendarEventLine} />
                Events
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${id}/courses`}
              asChild
            >
              <Link
                to="/communities/$id/courses"
                params={{
                  id,
                }}
                preload="intent"
              >
                <MatchRoute
                  to="/communities/$id/courses"
                  params={{
                    id,
                  }}
                  pending
                >
                  {(match) => {
                    if (!!match) {
                      return (
                        <TabMenuHorizontal.Icon
                          className="animate-spin"
                          as={RiLoaderLine}
                        />
                      )
                    }
                    return <TabMenuHorizontal.Icon as={RiGraduationCapLine} />
                  }}
                </MatchRoute>
                Courses
              </Link>
            </TabMenuHorizontal.Trigger>
          </TabMenuHorizontal.List>
        </TabMenuHorizontal.Root>
        <Button.Root
          mode="filled"
          variant="primary"
          size="xxsmall"
          className="rounded-full"
          asChild
        >
          <Link to="/communities/create">
            <Button.Icon as={RiAddLine} />
            Create
          </Link>
        </Button.Root>
      </NavigationLearnerSubHeader>
      <Outlet />
    </>
  )
}
