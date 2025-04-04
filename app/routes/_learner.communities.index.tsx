import { useEffect, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communitiesAllSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { RiArrowRightLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "motion/react"
import type { z } from "zod"

import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import * as LinkButton from "@/components/ui/link-button"
import {
  SVGStarFill,
  SVGStarHalf,
  SVGStarLine,
} from "@/components/ui/svg-rating-icons"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

export const Route = createFileRoute("/_learner/communities/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.communities.all.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.communities.joined.queryOptions()
      ),
    ])
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())
  const joined = useQuery(trpc.communities.joined.queryOptions())
  return (
    <>
      <CommunitiesCarousel communities={communities?.data?.slice(0, 6) || []} />
      <Section className="flex flex-col">
        <h2 className="gutter mt-8 text-paragraph-sm text-text-sub-600 lg:mt-0">
          Your Communities
        </h2>
        <DraggableScrollContainer>
          <section className="few no-scrollbar gutter flex w-max items-start space-x-4 py-3">
            {joined?.data?.map((community, i) => {
              const opts = [
                "online",
                "offline",
                "busy",
                "away",
                undefined,
              ] as const

              const randomIndex = Math.floor(Math.random() * opts.length)
              const randomOpt = opts[randomIndex]

              return (
                <button
                  key={community?.id + "-joined"}
                  className="flex aspect-[13/16] max-h-[240px] w-[40vw] max-w-[230px] flex-col justify-between gap-2 rounded-10 p-2 pt-4 md:w-[25vw] lg:w-[15vw]"
                  style={{
                    backgroundColor: community.meta.colors.DarkVibrant.hex,
                    color: community.meta.colors.DarkVibrant.titleTextColor,
                  }}
                >
                  <h3 className="line-clamp-2 px-2 text-left text-title-h6 font-light">
                    {community?.name}
                  </h3>
                  <Image
                    path={`community-${community.id}-image.jpg`}
                    transformation={[{ quality: 100 }]}
                    lqip={{
                      active: true,
                      quality: 1,
                      blur: 50,
                    }}
                    sizes="33vw"
                    className="aspect-video max-h-[115px] w-full overflow-hidden rounded-md object-cover"
                    alt={`Community ${community.name} image`}
                  />
                </button>
              )
            })}
          </section>
        </DraggableScrollContainer>
      </Section>
      <Section className="gutter flex flex-col gap-5">
        <h3 className="text-title-h3 font-light text-text-strong-950">
          Editor Picks
        </h3>
        <Grid>
          <Image
            path="community-wvxnO56olQ8TdQAA0Vco-image.jpg"
            className="col-span-6 overflow-hidden rounded-20 object-contain"
            lqip={{
              active: true,
              quality: 1,
              blur: 50,
            }}
          />
          <div className="col-span-6 flex flex-col items-start justify-center gap-6">
            <div className="flex items-center gap-3">
              <Avatar.Root size="24">
                <Avatar.Image src={communities?.data?.[0]?.featureImageUrl} />
              </Avatar.Root>
              <span className="text-label-sm font-light">
                {communities?.data?.[0]?.name}
              </span>
              <span className="text-label-sm font-light text-text-sub-600">
                {" "}
                • 12 Mins Ago
              </span>
            </div>
            <h3 className="text-pretty text-title-h2 font-light">
              The Ultimate Digital Detox: How to Unplug Without Falling Behind
            </h3>
            <p className="text-pretty text-paragraph-md text-text-sub-600">
              Struggling to balance screen time with real life? A digital detox
              doesn’t mean going off the grid—it’s about using technology
              intentionally. Learn how to unplug, recharge, and stay productive
              without missing out. Your mind (and focus) will thank you!
            </p>
            <div className="flex items-center gap-2.5">
              <LinkButton.Root className="text-warning-base">
                Tech
              </LinkButton.Root>
              <span className="text-label-sm text-text-sub-600">
                {" "}
                • 4 Min Read
              </span>
            </div>
          </div>
        </Grid>
        {/* <div className="col-span-6 aspect-[16/11]"></div> */}
      </Section>
    </>
  )
}

function CommunitiesCarousel({
  communities,
}: {
  communities: z.infer<typeof communitiesAllSchema>
}) {
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
                <div className="flex w-full flex-col gap-8">
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
