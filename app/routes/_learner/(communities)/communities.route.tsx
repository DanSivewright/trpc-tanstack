import { useEffect, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communitiesAllSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import {
  RiAddLine,
  RiArrowRightLine,
  RiArticleLine,
  RiBloggerLine,
  RiCalendarLine,
  RiGraduationCapLine,
  RiHashtag,
  RiLayoutMasonryLine,
  RiTaskLine,
  RiTodoLine,
} from "@remixicon/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  getRouteApi,
  isMatch,
  Link,
  Outlet,
  useChildMatches,
  useLocation,
  useMatch,
  useMatches,
  useMatchRoute,
  useParams,
  useRouterState,
} from "@tanstack/react-router"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "motion/react"
import { z } from "zod"

import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Button from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  SVGStarFill,
  SVGStarHalf,
  SVGStarLine,
} from "@/components/ui/svg-rating-icons"
import * as TabMenuHorizontal from "@/components/ui/tab-menu-horizontal"
import Image from "@/components/image"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"

export const Route = createFileRoute("/_learner/(communities)/communities")({
  component: RootComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.communities.all.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.communities.joined.queryOptions()
      ),
    ])
    return {
      crumb: "Communities",
    }
  },
})

function RootComponent() {
  const routerState = useRouterState()
  const matchRoute = useMatchRoute()
  const communityRouteApi = getRouteApi(
    "/_learner/(communities)/communities/$id"
  )
  const isSingleCommunity = useMemo(() => {
    return routerState.matches.find(
      (pattern) => communityRouteApi.id === pattern.routeId
    )
  }, [routerState, matchRoute])

  return (
    <>
      {!isSingleCommunity ? (
        <CommunitiesHeader />
      ) : (
        //
        <CommunityHeader />
      )}
      <Outlet />
    </>
  )
}

function CommunitiesHeader() {
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())
  const location = useLocation()
  return (
    <>
      <NavigationLearnerSubHeader>
        <TabMenuHorizontal.Root value={location.pathname} className="w-fit">
          <TabMenuHorizontal.List className="border-none">
            <TabMenuHorizontal.Trigger value="/communities/today" asChild>
              <Link to="/communities/today">
                <TabMenuHorizontal.Icon as={RiCalendarLine} />
                Today
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger value="/communities" asChild>
              <Link to="/communities">
                <TabMenuHorizontal.Icon as={RiCalendarLine} />
                Communities
              </Link>
            </TabMenuHorizontal.Trigger>
            <TabMenuHorizontal.Trigger value="/communities/explore" asChild>
              <Link to="/communities/explore">
                <TabMenuHorizontal.Icon as={RiCalendarLine} />
                Explore
              </Link>
            </TabMenuHorizontal.Trigger>
          </TabMenuHorizontal.List>
        </TabMenuHorizontal.Root>
        <Button.Root
          mode="filled"
          variant="primary"
          size="xxsmall"
          className="rounded-full"
        >
          <Button.Icon as={RiAddLine} />
          Create
        </Button.Root>
      </NavigationLearnerSubHeader>

      {!location.pathname.includes("explore") && (
        <CommunitiesCarousel
          communities={communities?.data?.slice(0, 6) || []}
        />
      )}
    </>
  )
}
function CommunityHeader() {
  const location = useLocation()
  const { id } = useParams({
    from: "/_learner/(communities)/communities/$id",
  })
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
    </>
  )
}

function CommunitiesCarousel({
  communities,
}: {
  communities: z.infer<typeof communitiesAllSchema>
}) {
  const trpc = useTRPC()
  const qc = useQueryClient()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

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
  return (
    <>
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent className="basis-full gap-0 space-x-0">
          {communities?.map((community) => (
            <CarouselItem
              style={{
                color: community.meta.colors.Vibrant?.titleTextColor,
              }}
              className="relative aspect-square max-h-[75dvh] w-full overflow-hidden p-0 *:z-10 lg:aspect-[16/7] lg:max-h-[45dvh]"
              key={community.id + "-carousel"}
            >
              <Image
                path={`community-${community.id}-image.jpg`}
                transformation={[{ quality: 100 }]}
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                sizes="100vw"
                className="absolute inset-0 z-0 h-full w-full object-cover"
                alt={`Community ${community.name} image`}
              />

              <div
                className="gutter relative flex h-full w-full flex-col items-start justify-between pb-20 pt-12 *:z-10"
                style={{
                  background: `linear-gradient(0deg, rgba(${community.meta.colors.Vibrant?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                }}
              >
                <header className="flex w-full flex-col">
                  <h1 className="text-title-h1 font-light">
                    {community?.name}
                  </h1>
                </header>
                <div
                  onMouseOver={() =>
                    qc.prefetchQuery({
                      ...trpc.communities.detail.queryOptions({
                        id: community.id,
                      }),
                      staleTime: 1000 * 60 * 2,
                    })
                  }
                  className="flex w-full flex-col gap-8"
                >
                  <div className="flex w-full items-end justify-between">
                    <div className="flex w-[40%] flex-col gap-3">
                      <AvatarGroupCompact.Root size="32">
                        <AvatarGroupCompact.Stack>
                          <Avatar.Root>
                            <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                          </Avatar.Root>
                          <Avatar.Root>
                            <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/sophia.png" />
                          </Avatar.Root>
                          <Avatar.Root>
                            <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/wei.png" />
                          </Avatar.Root>
                        </AvatarGroupCompact.Stack>
                        <AvatarGroupCompact.Overflow>
                          +9
                        </AvatarGroupCompact.Overflow>
                      </AvatarGroupCompact.Root>
                      <p className="w-full text-pretty text-label-sm font-light opacity-75">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Culpa quidem excepturi, quam porro consequatur
                        minima nihil tempora ut autem nam quo eum labore
                        perspiciatis accusamus?
                        {/* {community.headline} */}
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={4.5} />
                        <span
                          style={{
                            color:
                              community.meta.colors.Vibrant?.titleTextColor,
                          }}
                          className="pt-1 text-paragraph-xs"
                        >
                          4.5 ∙ 5.2K Ratings
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/communities/$id"
                      params={{
                        id: community?.id,
                      }}
                      style={{
                        background: `rgba(${community.meta.colors.DarkMuted?.rgb?.join(",")}, 0.3)`,
                        color:
                          community.meta?.colors?.DarkVibrant.titleTextColor,
                      }}
                      className="flex h-16 w-fit cursor-pointer items-center gap-4 rounded-full p-1 pe-8 backdrop-blur-md transition-colors hover:shadow-regular-md"
                    >
                      <div
                        style={{
                          background: community.meta?.colors?.LightVibrant.hex,
                        }}
                        className="flex aspect-square h-full items-center justify-center rounded-full"
                      >
                        <RiArrowRightLine />
                      </div>
                      <span className="shrink-0">Go to community</span>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <ul className="gutter relative z-10 -ml-4 -mt-8 mb-7 flex w-[calc(100%+1rem)] items-center gap-4">
        {communities?.map((c, i) => (
          <li
            key={c.id + "-dot"}
            className="relative h-1 grow cursor-pointer overflow-hidden rounded-full bg-white-alpha-24 bg-opacity-50"
            onClick={() => {
              if (i + 1 !== current) {
                api?.scrollTo(i)
              }
            }}
          >
            <AnimatePresence>
              {i + 1 === current && (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-r-full bg-bg-white-0"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: i + 1 === current ? 3 : 0.15 }}
                    layoutId={`dot-${i + 1}`}
                  />
                </>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </>
  )
}

function StarRating({ rating }: { rating: number }) {
  const getStarIcon = (i: number) => {
    if (rating >= i + 1) {
      return <SVGStarFill className="size-5 text-yellow-500" key={i} />
    } else if (rating >= i + 0.5) {
      return <SVGStarHalf className="size-5 text-yellow-500" key={i} />
    }
    return <SVGStarLine className="size-5 text-stroke-sub-300" key={i} />
  }

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => getStarIcon(i))}
    </div>
  )
}
