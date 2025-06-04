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
import { FancyButton } from "@/components/ui/fancy-button"
import { Input } from "@/components/ui/input"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import { Tooltip } from "@/components/ui/tooltip"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

import LikesButton from "../-components/likes-button"
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
  const viewport = useViewportSize()
  const content = useElementSize()

  const me = useSuspenseQuery(trpc.people.me.queryOptions())
  const courses = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId: params.id,
    })
  )
  const threads = useSuspenseQuery(
    trpc.communities.threads.all.queryOptions({
      communityId: params.id,
    })
  )
  const articles = useSuspenseQuery(
    trpc.communities.articles.all.queryOptions({
      communityId: params.id,
    })
  )

  const featured = useMemo(() => {
    return [...courses?.data, ...threads?.data, ...articles?.data]
      .filter(
        (x) =>
          x.isFeatured &&
          x.isFeaturedUntil &&
          isAfter(new Date(x.isFeaturedUntil), new Date())
      )
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [courses?.data, threads?.data, articles?.data])

  const first = featured[0] || null

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
      <div className="sticky top-12 z-20 bg-bg-white-0/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-lg flex-1 items-center justify-between gap-4 px-8 xl:px-0">
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
      </div>

      <Section side="b" className="mt-6 flex flex-col gap-2">
        <Grid
          gap="none"
          className="mx-auto h-fit w-full max-w-screen-lg gap-4 px-8 xl:px-0"
        >
          {first && (
            <div className="relative col-span-8 aspect-[16/13] w-full overflow-hidden rounded-10 ring-1 ring-stroke-soft-200">
              {first?.images &&
                first?.images?.length &&
                first?.images.some((x) => x.featured) && (
                  <>
                    <Image
                      path={first?.images?.find((x) => x.featured)?.path!}
                      lqip={{
                        active: true,
                        quality: 1,
                        blur: 50,
                      }}
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="absolute inset-0 object-cover"
                    />
                    {first?.meta?.colors && (
                      <div
                        style={{
                          background: `linear-gradient(0deg, rgba(${first?.meta?.colors?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
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
                  </>
                )}
              <div
                style={{
                  color: first?.meta?.colors?.LightMuted?.titleTextColor,
                }}
                className="relative z-10 flex h-full flex-col justify-end gap-6 px-8 pb-8"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-title-h4 font-normal">
                    <Avatar.Root className="mr-2 inline-flex" size="24">
                      {first?.author?.avatarUrl && (
                        <Avatar.Image
                          src={first?.author?.avatarUrl}
                          alt={first?.author?.name}
                        />
                      )}
                    </Avatar.Root>
                    {first?.title}
                  </h3>
                  {first?.tags && (
                    <div className="flex flex-wrap items-center gap-2">
                      {first?.tags.slice(0, 3).map((tag) => (
                        <Badge.Root
                          color="blue"
                          className="h-5 capitalize"
                          key={first?.id + tag}
                        >
                          {tag}
                        </Badge.Root>
                      ))}
                      {first?.tags?.length > 3 && (
                        <Badge.Root color="blue" className="h-5 capitalize">
                          +{first?.tags?.length - 3}
                        </Badge.Root>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 *:text-label-xs *:opacity-75">
                  <div className="flex items-center gap-2">
                    <RiChat3Line size={15} name="MessageCircle" />
                    <span>{first?.commentsCount || "No Comments"}</span>
                  </div>
                  <LikesButton
                    mode="ghost"
                    className="text-label-xs hover:bg-transparent"
                    style={{
                      color: first?.meta?.colors?.LightMuted?.titleTextColor,
                    }}
                    // @ts-ignore
                    collectionGroup={first.type + "s"}
                    collectionGroupDocId={first.id}
                    communityId={params.id}
                  />
                  {/* <div className="flex items-center gap-2">
                    <RiHeartLine size={15} />
                    <span>{first?.commentsCount || "No Comments"}</span>
                  </div> */}
                  {first?.duration && (
                    <div className="flex items-center gap-2">
                      <RiTimeLine size={15} name="Clock" />
                      <span>
                        {first?.duration
                          ? formatDistanceStrict(0, first.duration * 1000, {
                              unit:
                                first.duration < 60
                                  ? "second"
                                  : first?.duration > 3600
                                    ? "hour"
                                    : "minute",
                              roundingMethod: "floor",
                            })
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="col-span-4 flex h-full flex-1 flex-col justify-between gap-4 rounded-10">
            {featured
              .slice(1)
              .slice(0, 3)
              .map((x) => (
                <Tooltip.Root key={x.id}>
                  <Tooltip.Trigger asChild>
                    <div
                      className={cn(
                        "relative h-full w-full grow overflow-hidden rounded-10 bg-bg-weak-50 ring-1 ring-stroke-soft-200",
                        {
                          "bg-primary-base":
                            !x?.images || x?.images?.every((x) => !x.featured),
                        }
                      )}
                    >
                      <Image
                        path={x.images?.find((x) => x.featured)?.path!}
                        lqip={{
                          active: true,
                          quality: 1,
                          blur: 50,
                        }}
                        className="absolute inset-0 object-cover"
                      />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="bottom">
                    <p>{x.title}</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              ))}
          </div>
        </Grid>
      </Section>
      <pre>{JSON.stringify(first, null, 2)}</pre>
      {/* <pre>{JSON.stringify(featured, null, 2)}</pre> */}
      {/* <FeedInput />
      <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-2 px-8 pt-6 xl:px-0">
        <FeedList />
      </div> */}
    </>
  )
}
