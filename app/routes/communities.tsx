import { useEffect, useRef, useState } from "react"
import { RiArrowRightLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "motion/react"
import type { z } from "zod"

import { useTRPC } from "@/lib/trpc/react"
import type { communitiesAllSchema } from "@/lib/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/lib/utils"
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
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid, gridVariants } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

export const Route = createFileRoute("/communities")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.all.queryOptions()
    )
  },
})
const filters = [
  { title: "Most Active", icon: "Flame" },
  { title: "Recently Created", icon: "Clock" },
  { title: "Beginner Friendly", icon: "Sparkles" },
  { title: "Professional", icon: "Briefcase" },
  { title: "Creative Arts", icon: "Palette" },
  { title: "Technology", icon: "Laptop" },
  { title: "Business", icon: "Building" },
  { title: "Language Learning", icon: "Languages" },
  { title: "Health & Wellness", icon: "Heart" },
  { title: "Science", icon: "Atom" },
  { title: "Music", icon: "Music" },
  { title: "Photography", icon: "Camera" },
  { title: "Writing", icon: "PenTool" },
  { title: "Digital Marketing", icon: "TrendingUp" },
  { title: "Personal Development", icon: "UserPlus" },
  { title: "Certification Available", icon: "Award" },
  { title: "Project Based", icon: "FolderKanban" },
  { title: "Mentorship", icon: "Users" },
  { title: "Live Sessions", icon: "Video" },
  { title: "Self-Paced", icon: "Clock3" },
  { title: "Discussion Active", icon: "MessageCircle" },
  { title: "Resource Rich", icon: "Library" },
  { title: "Collaboration", icon: "UsersRound" },
  { title: "Workshop Style", icon: "Hammer" },
  { title: "International", icon: "Globe" },
]
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
          <section className="no-scrollbar gutter few flex w-max items-start space-x-4 py-3">
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

                    <button
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
                    </button>
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

function CustomVerifiedIconSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.3431 5.51481L20.1212 3.29299C18.9497 2.12141 17.0502 2.12141 15.8786 3.29299L13.6568 5.51481H10.5146C8.85778 5.51481 7.51463 6.85796 7.51463 8.51481V11.6569L5.2928 13.8788C4.12123 15.0503 4.12123 16.9498 5.2928 18.1214L7.51463 20.3432V23.4854C7.51463 25.1422 8.85777 26.4854 10.5146 26.4854H13.6568L15.8786 28.7072C17.0502 29.8788 18.9497 29.8788 20.1212 28.7072L22.3431 26.4854H25.4852C27.142 26.4854 28.4852 25.1422 28.4852 23.4854V20.3432L30.707 18.1214C31.8786 16.9498 31.8786 15.0503 30.707 13.8788L28.4852 11.6569V8.51481C28.4852 6.85796 27.142 5.51481 25.4852 5.51481H22.3431ZM21.2217 7.22192C21.4093 7.40946 21.6636 7.51481 21.9288 7.51481H25.4852C26.0375 7.51481 26.4852 7.96253 26.4852 8.51481V12.0712C26.4852 12.3364 26.5905 12.5907 26.7781 12.7783L29.2928 15.293C29.6833 15.6835 29.6833 16.3167 29.2928 16.7072L26.7781 19.2219C26.5905 19.4095 26.4852 19.6638 26.4852 19.929V23.4854C26.4852 24.0377 26.0375 24.4854 25.4852 24.4854H21.9288C21.6636 24.4854 21.4093 24.5907 21.2217 24.7783L18.707 27.293C18.3165 27.6835 17.6833 27.6835 17.2928 27.293L14.7781 24.7783C14.5905 24.5907 14.3362 24.4854 14.071 24.4854H10.5146C9.96234 24.4854 9.51463 24.0377 9.51463 23.4854V19.929C9.51463 19.6638 9.40927 19.4095 9.22174 19.2219L6.70702 16.7072C6.31649 16.3167 6.31649 15.6835 6.70702 15.293L9.22174 12.7783C9.40927 12.5907 9.51463 12.3364 9.51463 12.0712V8.51481C9.51463 7.96253 9.96234 7.51481 10.5146 7.51481H14.071C14.3362 7.51481 14.5905 7.40946 14.7781 7.22192L17.2928 4.7072C17.6833 4.31668 18.3165 4.31668 18.707 4.7072L21.2217 7.22192Z"
        className="fill-bg-white-0"
      />
      <path
        d="M21.9288 7.51457C21.6636 7.51457 21.4092 7.40921 21.2217 7.22167L18.707 4.70696C18.3164 4.31643 17.6833 4.31643 17.2927 4.70696L14.778 7.22167C14.5905 7.40921 14.3361 7.51457 14.0709 7.51457H10.5146C9.96228 7.51457 9.51457 7.96228 9.51457 8.51457V12.0709C9.51457 12.3361 9.40921 12.5905 9.22167 12.778L6.70696 15.2927C6.31643 15.6833 6.31643 16.3164 6.70696 16.707L9.22167 19.2217C9.40921 19.4092 9.51457 19.6636 9.51457 19.9288V23.4851C9.51457 24.0374 9.96228 24.4851 10.5146 24.4851H14.0709C14.3361 24.4851 14.5905 24.5905 14.778 24.778L17.2927 27.2927C17.6833 27.6833 18.3164 27.6833 18.707 27.2927L21.2217 24.778C21.4092 24.5905 21.6636 24.4851 21.9288 24.4851H25.4851C26.0374 24.4851 26.4851 24.0374 26.4851 23.4851V19.9288C26.4851 19.6636 26.5905 19.4092 26.778 19.2217L29.2927 16.707C29.6833 16.3164 29.6833 15.6833 29.2927 15.2927L26.778 12.778C26.5905 12.5905 26.4851 12.3361 26.4851 12.0709V8.51457C26.4851 7.96228 26.0374 7.51457 25.4851 7.51457H21.9288Z"
        fill="#47C2FF"
      />
      <path
        d="M23.3737 13.3739L16.6666 20.081L13.2928 16.7073L14.707 15.2931L16.6666 17.2526L21.9595 11.9597L23.3737 13.3739Z"
        className="fill-text-white-0"
      />
    </svg>
  )
}
