import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"

import FeedInput from "./-components/feed-input"
import FeedList from "./-components/feed-list"

export const Route = createFileRoute("/_learner/communities/$id/")({
  loader: async ({ context, params: { id } }) => {
    context.queryClient.prefetchQuery(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    context.queryClient.prefetchQuery(
      context.trpc.communities.feed.queryOptions({
        communityId: id,
      })
    )
    return {
      leaf: "Feed",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <FeedInput />
      <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-2 px-8 pt-6 xl:px-0">
        <Suspense fallback={<div>Loading...</div>}>
          <FeedList />
        </Suspense>
      </div>
    </>
  )
}
