import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import {
  RiAddLine,
  RiChat3Line,
  RiHeartLine,
  RiSearchLine,
  RiSunLine,
  RiTimeLine,
  RiUserSmileLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { format, formatDistanceStrict, isAfter } from "date-fns"

import { useElementSize } from "@/hooks/use-element-size"
import { useViewportSize } from "@/hooks/use-viewport-size"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import { FancyButton } from "@/components/ui/fancy-button"
import { Input } from "@/components/ui/input"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import { Tooltip } from "@/components/ui/tooltip"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

import LikesButton from "../-components/likes-button"
import FeaturedGrid from "./-components/featured-grid"
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
        context.trpc.communities.threads.all.queryOptions({
          communityId: id,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.communities.courses.all.queryOptions({
          communityId: id,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.communities.articles.all.queryOptions({
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
        {/* <FeedInput /> */}
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
  const trpc = useTRPC()
  const params = Route.useParams()

  const me = useSuspenseQuery(trpc.people.me.queryOptions())

  return (
    <>
      <Section
        side="t"
        className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 px-8 pb-4 xl:px-0"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-title-h3 font-normal">
                Howdy {me?.data?.firstName}!
              </h1>
              <RiUserSmileLine className="size-10 fill-warning-base" />
            </div>
            <div className="flex items-center gap-2">
              <RiSunLine className="size-5 fill-warning-base" />
              <p className="text-subheading-sm font-light text-text-soft-400">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </Section>
      <FeedInput />
      {/* <div className="sticky top-12 z-20 bg-bg-white-0/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-lg flex-1 flex-col items-center justify-between gap-4 px-8 sm:flex-row xl:px-0">
          <div className="flex w-full grow items-center">
            <Input.Root className="relative z-[1]">
              <Input.Wrapper>
                <Input.Field
                  // value={q}
                  // onInput={(e) => {
                  //   const value = e.currentTarget.value
                  //   setQ(value)
                  //   handleSearch(value)
                  // }}
                  type="text"
                  placeholder="Search your communities..."
                />
                <Input.Icon as={RiSearchLine} />
              </Input.Wrapper>
            </Input.Root>
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger asChild>
                <FancyButton.Root className="relative z-0 -ml-2 h-[38px] w-12 rounded-l-none">
                  <FancyButton.Icon as={RiAddLine} />
                </FancyButton.Root>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">Create a new post</Tooltip.Content>
            </Tooltip.Root>
          </div>
          <TabMenuHorizontal.Root className="w-fit" defaultValue="all">
            <TabMenuHorizontal.List className="border-none">
              <TabMenuHorizontal.Trigger value="all">
                All
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="featured">
                Featured
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="courses">
                Courses
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger value="articles">
                Articles
              </TabMenuHorizontal.Trigger>
            </TabMenuHorizontal.List>
          </TabMenuHorizontal.Root>
        </div>
      </div> */}

      <FeaturedGrid communityId={params.id} />
      <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-2 px-8 pt-6 xl:px-0">
        <FeedList />
      </div>
    </>
  )
}
