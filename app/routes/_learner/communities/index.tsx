import { Suspense, useEffect, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communitiesAllSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import {
  RiArrowRightLine,
  RiAwardLine,
  RiBook2Line,
  RiBriefcaseLine,
  RiBuildingLine,
  RiCameraLine,
  RiChat1Line,
  RiClockwiseLine,
  RiComputerLine,
  RiFireLine,
  RiGlobeLine,
  RiHammerLine,
  RiHeartLine,
  RiInfinityLine,
  RiKanbanView,
  RiMusic2Line,
  RiPaletteLine,
  RiPencilLine,
  RiSearchLine,
  RiSparkling2Line,
  RiTranslate,
  RiUserLine,
  RiUserStarLine,
  RiVideoLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import type { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import * as DotStepper from "@/components/ui/dot-stepper"
import { Input } from "@/components/ui/input"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

const LENGTH = 11

const rows = [
  [1],
  [2, 3],
  [4, 5, 6],
  [7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [25, 26, 27, 28],
  [29, 30, 31],
  [32, 33],
  [34],
]
const filters: {
  title: string
  icon: RemixiconComponentType
}[] = [
  { title: "Most Active", icon: RiFireLine },
  { title: "Recently Created", icon: RiClockwiseLine },
  { title: "Beginner Friendly", icon: RiSparkling2Line },
  { title: "Professional", icon: RiBriefcaseLine },
  { title: "Creative Arts", icon: RiPaletteLine },
  { title: "Technology", icon: RiComputerLine },
  { title: "Business", icon: RiBuildingLine },
  { title: "Language Learning", icon: RiTranslate },
  { title: "Health & Wellness", icon: RiHeartLine },
  { title: "Science", icon: RiInfinityLine },
  { title: "Music", icon: RiMusic2Line },
  { title: "Photography", icon: RiCameraLine },
  { title: "Writing", icon: RiPencilLine },
  { title: "Digital Marketing", icon: RiComputerLine },
  { title: "Personal Development", icon: RiUserLine },
  { title: "Certification Available", icon: RiAwardLine },
  { title: "Project Based", icon: RiKanbanView },
  { title: "Mentorship", icon: RiUserLine },
  { title: "Live Sessions", icon: RiVideoLine },
  { title: "Self-Paced", icon: RiClockwiseLine },
  { title: "Discussion Active", icon: RiChat1Line },
  { title: "Resource Rich", icon: RiBook2Line },
  { title: "Collaboration", icon: RiUserStarLine },
  { title: "Workshop Style", icon: RiHammerLine },
  { title: "International", icon: RiGlobeLine },
]

export const Route = createFileRoute("/_learner/communities/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery({
      ...context.trpc.communities.all.queryOptions(),
      staleTime: 1000 * 60 * 2,
    })
    context.queryClient.prefetchQuery({
      ...context.trpc.communities.joined.queryOptions(),
      staleTime: 1000 * 60 * 2,
    })
  },
})

function RouteComponent() {
  const { ref, width } = useElementSize()
  const header = useElementSize()

  return (
    <>
      <div className="h-fit w-screen overflow-hidden">
        <header
          ref={header.ref}
          style={{
            marginTop: `-${width / 4}px`,
            width: `calc(100vw + ${width}px)`,
            marginLeft: `-${width / 2}px`,
          }}
          className="relative mx-auto flex w-full gap-6"
        >
          {rows?.map((row, ri) => (
            <ul
              {...(ri === 0 ? { ref } : {})}
              {...(ri < LENGTH / 2 - 1
                ? {
                    style: {
                      marginTop: `-${Math.round(width / 2) * ri + 1}px`,
                      // background: "brown",
                    },
                  }
                : {})}
              {...(ri > LENGTH / 2
                ? {
                    style: {
                      marginTop: `-${Math.round(width / 2) * (LENGTH - ri - 1)}px`,
                      // background: "red",
                    },
                  }
                : {})}
              {...(Math.ceil(LENGTH / 2) === ri + 1
                ? {
                    style: {
                      marginTop: `-${Math.round(width / 2) * (LENGTH / 2 - 2)}px`,
                      // background: "blue",
                    },
                  }
                : {})}
              className="flex grow flex-col gap-6"
              key={"row" + ri}
            >
              {row.map((cell, ci) => (
                <motion.div
                  key={"row" + ri + "cell" + ci}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: (ri + ci) * 0.1, // stagger based on row and column
                    ease: "easeOut",
                  }}
                  className="relative aspect-square w-full overflow-hidden rounded-20 bg-bg-soft-200"
                >
                  <Image
                    path={`${cell}.${cell == 26 || cell == 27 ? "png" : "webp"}`}
                    lqip={{
                      active: true,
                      quality: 1,
                      blur: 50,
                    }}
                    transformation={[
                      {
                        height: width,
                        width,
                      },
                    ]}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </ul>
          ))}
        </header>
      </div>
      <Section
        spacer="p"
        side="t"
        style={{
          marginTop: `-${header.height / 2}px`,
        }}
        className="relative z-10 rounded-t-20 border-t border-bg-weak-50 bg-white/80 shadow-regular-md backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-screen-lg flex-col gap-2 px-6 2xl:px-0">
          <h1 className="text-title-h1 font-light">
            <span className="text-text-sub-600">Discover</span> communities.
          </h1>
          {/* <p className="text-pretty text-subheading-sm font-light text-text-soft-400">
            Looking for a community? We have {communities.data?.length}+
            communities.
          </p> */}
          <Input.Root>
            <Input.Wrapper>
              <Input.Field
                type="text"
                placeholder="Search for a community..."
              />
              <Input.Icon as={RiSearchLine} />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </Section>
      <Section
        spacer="p"
        size="sm"
        className="relative z-10 bg-bg-white-0 px-6 2xl:px-0"
      >
        <DraggableScrollContainer className="bg-background shadow sticky top-0 z-10 mb-4 bg-bg-white-0 px-6">
          <ul className="flex w-max items-center gap-8">
            {filters.map((filter, i) => {
              const Icon = filter.icon
              return (
                <li
                  key={filter.title}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-2 py-4 text-center",
                    {
                      "text-text-soft-400": i !== 0,
                    }
                  )}
                >
                  <Icon className="size-6" />
                  <span className="shrink-0 text-label-xs">{filter.title}</span>
                  {i === 0 ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-bg-strong-950"></span>
                  ) : (
                    <span className="bg-foreground/30 absolute inset-x-0 bottom-0 h-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></span>
                  )}
                </li>
              )
            })}
          </ul>
        </DraggableScrollContainer>
        <Grid className="mx-auto max-w-screen-2xl">
          <Suspense fallback={<AllCommunitiesSkeleton />}>
            <AllCommunities />
          </Suspense>
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            <h3 className="text-title-h6 font-light text-text-soft-400">
              Your Communities
            </h3>
            <Suspense fallback={<JoinedCommunitiesSkeleton />}>
              <JoinedCommunities />
            </Suspense>
          </div>
        </Grid>
      </Section>
    </>
  )
}

function AllCommunities() {
  const trpc = useTRPC()
  const communities = useSuspenseQuery(trpc.communities.all.queryOptions())
  return (
    <Grid gap="xs" className="col-span-12 gap-8 lg:col-span-9">
      {communities?.data?.map((c) => {
        return <CommunityCard key={c.id} c={c} />
      })}
    </Grid>
  )
}

function JoinedCommunities() {
  const trpc = useTRPC()
  const joined = useSuspenseQuery(trpc.communities.joined.queryOptions())
  const qc = useQueryClient()
  return (
    <div className="flex flex-col gap-2">
      {joined?.data?.map((c) => {
        const logo = c.images?.find((x) => x.logo)
        return (
          <Link
            onMouseOver={() =>
              qc.prefetchQuery(
                trpc.communities.detail.queryOptions({ id: c.id })
              )
            }
            preload="intent"
            to="/communities/$id"
            params={{
              id: c.id,
            }}
            key={c.id}
            className="flex w-full items-center gap-3 rounded-xl py-2 text-left transition-all duration-200 ease-out hover:bg-[#E9E9E9] hover:px-3 dark:hover:bg-[#191919]"
          >
            <Avatar.Root size="40">
              <Avatar.Image src={logo?.url!} />
            </Avatar.Root>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="line-clamp-2 text-label-md font-light">
                {c.name}
              </div>
              <div className="line-clamp-1 truncate text-pretty text-subheading-xs font-light text-text-soft-400">
                {c.headline}
              </div>
            </div>

            <RiArrowRightLine className="size-4 fill-text-soft-400" />
          </Link>
        )
      })}
    </div>
  )
}

function CommunityCard({
  c,
}: {
  c: z.infer<typeof communitiesAllSchema>[number]
}) {
  const trpc = useTRPC()
  const qc = useQueryClient()
  const images = c.images?.filter((x) => !x.logo)
  const logo = c.images?.find((x) => x.logo)

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
    <Link
      onMouseOver={() =>
        qc.prefetchQuery(trpc.communities.detail.queryOptions({ id: c.id }))
      }
      preload="intent"
      to="/communities/$id"
      params={{
        id: c.id,
      }}
      key={"all-" + c.id}
      className="relative col-span-12 flex flex-col gap-2 lg:col-span-6"
    >
      <Carousel
        opts={{
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {images
            ?.filter((x) => !x.logo)
            .map((image) => (
              <CarouselItem key={image.id}>
                <Image
                  path={image.path!}
                  lqip={{
                    active: true,
                    quality: 1,
                    blur: 50,
                  }}
                  sizes="(min-width: 1536px) 50vw, (min-width: 1024px) 100vw"
                  className="aspect-video w-full overflow-hidden rounded-10 object-cover"
                  alt={`Community ${c.name} image`}
                />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>

      <div className="relative flex items-start justify-between">
        <div className="absolute -top-8 left-1/2 w-fit -translate-x-1/2 rounded-full bg-white/60 px-1.5 py-1 backdrop-blur-md dark:bg-black/70">
          <DotStepper.Root>
            {images?.map((_, i) => (
              <DotStepper.Item
                key={"dot-" + i}
                aria-label={`Go to image ${i}`}
                active={i + 1 === current}
                onClick={() => {
                  if (i + 1 !== current) {
                    api?.scrollTo(i)
                  }
                }}
              />
            ))}
          </DotStepper.Root>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar.Root size="24">
              <Avatar.Image
                src={logo?.url!}
                alt={`Community ${c.name} image`}
              />
            </Avatar.Root>
            <h2 className="line-clamp-2 text-title-h6 font-light">{c.name}</h2>
          </div>
          <p className="line-clamp-3 text-pretty text-subheading-sm font-light text-text-soft-400">
            {c.headline}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {c.tags?.map((t) => (
              <Badge.Root variant="lighter" size="small" key={c.id + t}>
                {t}
              </Badge.Root>
            ))}
          </div>
        </div>
        <AvatarGroupCompact.Root
          size="24"
          className="bg-bg-weak-50 shadow-regular-sm"
        >
          <AvatarGroupCompact.Stack>
            {c.members
              ?.slice(0, 3)
              .map((m) => (
                <Avatar.Root>
                  {m.avatarUrl ? (
                    <Avatar.Image src={m.avatarUrl} />
                  ) : (
                    m.firstName?.[0] + m.lastName?.[0]
                  )}
                </Avatar.Root>
              ))}
          </AvatarGroupCompact.Stack>
          {c.members?.length && c.members?.length > 3 && (
            <AvatarGroupCompact.Overflow>
              +{c.members?.length - 3}
            </AvatarGroupCompact.Overflow>
          )}
        </AvatarGroupCompact.Root>
      </div>
    </Link>
  )
}

function AllCommunitiesSkeleton() {
  return (
    <Grid gap="xs" className="col-span-12 gap-8 lg:col-span-9">
      <div className="relative col-span-12 flex flex-col gap-2 lg:col-span-6">
        <div className="aspect-video w-full animate-pulse overflow-hidden rounded-10 bg-bg-weak-50 object-cover"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-bg-weak-50"></div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-bg-weak-50"></div>
        </div>
      </div>
      <div className="relative col-span-12 flex flex-col gap-2 lg:col-span-6">
        <div className="aspect-video w-full animate-pulse overflow-hidden rounded-10 bg-bg-weak-50 object-cover"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-bg-weak-50"></div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-bg-weak-50"></div>
        </div>
      </div>
      <div className="relative col-span-12 flex flex-col gap-2 lg:col-span-6">
        <div className="aspect-video w-full animate-pulse overflow-hidden rounded-10 bg-bg-weak-50 object-cover"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-bg-weak-50"></div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-bg-weak-50"></div>
        </div>
      </div>
      <div className="relative col-span-12 flex flex-col gap-2 lg:col-span-6">
        <div className="aspect-video w-full animate-pulse overflow-hidden rounded-10 bg-bg-weak-50 object-cover"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-bg-weak-50"></div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-bg-weak-50"></div>
        </div>
      </div>
      <div className="relative col-span-12 flex flex-col gap-2 lg:col-span-6">
        <div className="aspect-video w-full animate-pulse overflow-hidden rounded-10 bg-bg-weak-50 object-cover"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-bg-weak-50"></div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-bg-weak-50"></div>
        </div>
      </div>
    </Grid>
  )
}

function JoinedCommunitiesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-14 w-full animate-pulse rounded-xl bg-bg-weak-50"></div>
      <div className="h-14 w-full animate-pulse rounded-xl bg-bg-weak-50"></div>
      <div className="h-14 w-full animate-pulse rounded-xl bg-bg-weak-50"></div>
      <div className="h-14 w-full animate-pulse rounded-xl bg-bg-weak-50"></div>
      <div className="h-14 w-full animate-pulse rounded-xl bg-bg-weak-50"></div>
    </div>
  )
}
