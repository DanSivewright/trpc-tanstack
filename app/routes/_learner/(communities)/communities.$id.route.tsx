import {
  RiAddLine,
  RiArticleLine,
  RiGraduationCapLine,
  RiHashtag,
  RiLayoutMasonryLine,
  RiTaskLine,
} from "@remixicon/react"
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router"

import * as Button from "@/components/ui/button"
import * as TabMenuHorizontal from "@/components/ui/tab-menu-horizontal"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"

export const Route = createFileRoute("/_learner/(communities)/communities/$id")(
  {
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
  }
)

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
              >
                <TabMenuHorizontal.Icon as={RiLayoutMasonryLine} />
                Feed
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${id}/tasks`}
              asChild
            >
              <Link
                to="/communities/$id/tasks"
                params={{
                  id,
                }}
              >
                <TabMenuHorizontal.Icon as={RiTaskLine} />
                Tasks
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger
              value={`/communities/${id}/articles`}
              asChild
            >
              <Link
                to="/communities/$id/articles"
                params={{
                  id,
                }}
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
              >
                <TabMenuHorizontal.Icon as={RiHashtag} />
                Thread
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
              >
                <TabMenuHorizontal.Icon as={RiGraduationCapLine} />
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
