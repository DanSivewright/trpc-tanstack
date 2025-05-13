import { createFileRoute } from "@tanstack/react-router"

import { Section } from "@/components/section"

import FeedInput from "./-components/feed-input"
import FeedList from "./-components/feed-list"

export const Route = createFileRoute("/_learner/communities/$id/")({
  loader: async ({ context, params: { id } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.communities.detail.queryOptions({
          id,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.communities.feed.queryOptions({
          communityId: id,
        })
      ),
    ])
    return {
      leaf: "Feed",
    }
  },
  component: RouteComponent,
  pendingComponent: () => {
    return (
      <>
        <FeedInput />
        <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-2 px-8 pt-6 xl:px-0">
          <Section side="b" className="mt-6 flex flex-col gap-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="flex flex-col gap-2">
                <div className="relative flex flex-col gap-1.5">
                  <div className="flex items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative size-6 animate-pulse rounded-full bg-bg-weak-50 xl:absolute xl:-left-16 xl:top-0 xl:block xl:size-12"></div>
                      <div className="size-6 w-48 animate-pulse rounded-md bg-bg-weak-50"></div>
                    </div>
                  </div>
                  <div className="size-7 w-3/4 animate-pulse rounded-md bg-bg-weak-50"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-bg-weak-50"></div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-bg-weak-50"></div>
                  <div className="h-4 w-1/3 animate-pulse rounded-md bg-bg-weak-50"></div>
                  <div className="aspect-video w-full animate-pulse rounded-md bg-bg-weak-50"></div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      </>
    )
  },
})

function RouteComponent() {
  return (
    <>
      <FeedInput />
      <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-2 px-8 pt-6 xl:px-0">
        <FeedList />
      </div>
    </>
  )
}
