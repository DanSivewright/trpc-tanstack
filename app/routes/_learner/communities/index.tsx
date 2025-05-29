import { Suspense, useEffect, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type {
  communitiesAllSchema,
  communityArticleSchema,
  communityCourseSchema,
  communitySchema,
  communityThreadSchema,
} from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiAwardLine,
  RiBook2Line,
  RiBriefcaseLine,
  RiBuildingLine,
  RiCameraLine,
  RiChat1Line,
  RiChat3Line,
  RiClockwiseLine,
  RiComputerLine,
  RiFireLine,
  RiGlobeLine,
  RiHammerLine,
  RiHeartLine,
  RiInfinityLine,
  RiKanbanView,
  RiLayoutMasonryLine,
  RiListCheck,
  RiLoader3Line,
  RiMusic2Line,
  RiPaletteLine,
  RiPencilLine,
  RiSearchLine,
  RiSparkling2Line,
  RiSunLine,
  RiTimeLine,
  RiTranslate,
  RiUserLine,
  RiUserSmileLine,
  RiUserStarLine,
  RiVideoLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import {
  useQueries,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from "@tanstack/react-router"
import { format } from "date-fns"
import { motion } from "motion/react"
import { z } from "zod"

import useDebouncedCallback from "@/hooks/use-debounced-callback"
import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { CompactButton } from "@/components/ui/compact-button"
import * as DotStepper from "@/components/ui/dot-stepper"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
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
  validateSearch: z.object({
    q: z.string().optional(),
    scope: z
      .array(
        z.enum([
          "communities",
          "articles",
          "members",
          "events",
          "threads",
          "courses",
        ])
      )
      .default(["communities"])
      .optional(),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        scope: ["communities"],
      }),
    ],
  },
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        ...context.trpc.communities.all.queryOptions(),
        staleTime: 1000 * 60 * 2,
      }),
      context.queryClient.ensureQueryData({
        ...context.trpc.communities.joined.queryOptions(),
        staleTime: 1000 * 60 * 2,
      }),
    ])
    context.queryClient.ensureQueryData({
      ...context.trpc.communities.joined.queryOptions(),
      staleTime: 1000 * 60 * 2,
    })
  },
  pendingComponent: () => {
    return (
      <>
        <div className="h-[20vh] w-screen animate-pulse bg-bg-weak-50"></div>
        <Section
          spacer="p"
          side="t"
          className="relative z-10 rounded-t-20 border-t border-bg-weak-50 bg-white/80 shadow-regular-md backdrop-blur-lg"
        >
          <div className="mx-auto flex max-w-screen-lg flex-col gap-2 px-6 2xl:px-0">
            <h1 className="text-title-h1 font-light">
              <span className="text-text-sub-600">Discover</span> communities.
            </h1>
            <p className="text-pretty text-subheading-sm font-light text-text-soft-400">
              Looking for a community? We have {100}+ communities.
            </p>
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
          <Grid className="mx-auto max-w-screen-2xl">
            <AllCommunitiesSkeleton />
            <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
              <h3 className="text-title-h6 font-light text-text-soft-400">
                Your Communities
              </h3>
              <JoinedCommunitiesSkeleton />
            </div>
          </Grid>
        </Section>
      </>
    )
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [q, setQ] = useState(search.q || "")

  const me = useSuspenseQuery(trpc.people.me.queryOptions())
  const communities = useSuspenseQuery(trpc.communities.all.queryOptions())
  const joined = useSuspenseQuery(trpc.communities.joined.queryOptions())
  const articles = useQueries({
    queries: communities.data?.map((community) => {
      return {
        ...trpc.communities.articles.all.queryOptions({
          communityId: community.id,
        }),
      }
    }),
  })
  const threads = useQueries({
    queries: communities.data?.map((community) => {
      return {
        ...trpc.communities.threads.all.queryOptions({
          communityId: community.id,
        }),
      }
    }),
  })
  const courses = useQueries({
    queries: communities.data?.map((community) => {
      return {
        ...trpc.communities.courses.all.queryOptions({
          communityId: community.id,
        }),
      }
    }),
  })

  const handleSearch = useDebouncedCallback(async (query: string) => {
    navigate({
      search: (old) => ({
        ...old,
        q: query,
      }),
      replace: true,
    })
  }, 500)
  const handleScope = (
    scope:
      | "communities"
      | "articles"
      | "members"
      | "events"
      | "threads"
      | "courses"
  ) => {
    if (scope == "communities") {
      navigate({
        search: (old) => ({
          ...old,
          scope: ["communities"],
        }),
        replace: true,
      })
      return
    }

    if (search.scope?.includes(scope)) {
      navigate({
        search: (old) => ({
          ...old,
          scope: old.scope?.filter(
            (x) => x !== "communities" && x !== scope
          ) || ["communities"],
        }),
        replace: true,
      })
      return
    }
    navigate({
      search: (old) => ({
        ...old,
        scope: [
          ...(old.scope?.filter((x) => x !== "communities") || []),
          scope,
        ],
      }),
      replace: true,
    })
  }

  const loading = useMemo(() => {
    return (
      articles?.some((x) => x?.isLoading) ||
      threads?.some((x) => x?.isLoading) ||
      courses?.some((x) => x?.isLoading)
    )
  }, [articles, threads, courses])

  const map: {
    communities: typeof communities.data
    articles: z.infer<typeof communityArticleSchema>[]
    threads: z.infer<typeof communityThreadSchema>[]
    courses: z.infer<typeof communityCourseSchema>[]
  } = useMemo(() => {
    let map: {
      communities: typeof communities.data
      articles: z.infer<typeof communityArticleSchema>[]
      threads: z.infer<typeof communityThreadSchema>[]
      courses: z.infer<typeof communityCourseSchema>[]
    } = {
      communities: [
        ...(joined.data || []),
        ...(communities?.data?.filter(
          (x) => !joined.data?.find((y) => y.id !== x.id)
        ) || []),
      ],
      articles: [],
      threads: [],
      courses: [],
    }

    if (loading) return map

    map.articles =
      articles
        ?.flatMap((x) => x?.data || [])
        .filter((x): x is NonNullable<typeof x> => x !== undefined) || []
    map.threads =
      threads
        ?.flatMap((x) => x?.data || [])
        .filter((x): x is NonNullable<typeof x> => x !== undefined) || []
    map.courses =
      courses
        ?.flatMap((x) => x?.data || [])
        .filter((x): x is NonNullable<typeof x> => x !== undefined) || []

    return map
  }, [articles, threads, courses, joined, communities])

  const smartJoin = (arr: string[]) => {
    if (!arr?.length) return ""
    if (arr.length === 1) return arr[0]
    if (arr.length === 2) return `${arr[0]} & ${arr[1]}`
    return `${arr.slice(0, -1).join(", ")} & ${arr[arr.length - 1]}`
  }

  return (
    <>
      <Section
        side="t"
        className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-8 pb-8"
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
        <div className="flex flex-col gap-2 rounded-10 bg-bg-weak-50 p-2">
          <Input.Root>
            <Input.Wrapper>
              <Input.Field
                value={q}
                onInput={(e) => {
                  const value = e.currentTarget.value
                  setQ(value)
                  handleSearch(value)
                }}
                type="text"
                placeholder="Search your communities..."
              />
              <Input.Icon as={RiSearchLine} />
            </Input.Wrapper>
          </Input.Root>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    search.scope !== undefined,
                })}
                onClick={() => handleScope("communities")}
              >
                Communities
                <Badge.Root square color="green">
                  {joined.data?.length}
                </Badge.Root>
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !search.scope?.includes("articles"),
                })}
                onClick={() => handleScope("articles")}
              >
                Articles
                <Badge.Root
                  square
                  {...(articles?.some((x) => x?.isLoading) && {
                    color: "gray",
                  })}
                  {...(articles?.flatMap((x) => x?.data).length > 0
                    ? {
                        color: "green",
                      }
                    : {
                        color: "gray",
                      })}
                >
                  {articles?.some((x) => x?.isLoading) ? (
                    <Badge.Icon
                      as={RiLoader3Line}
                      className="size-3 animate-spin"
                    />
                  ) : (
                    articles?.flatMap((x) => x?.data).length
                  )}
                </Badge.Root>
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !search.scope?.includes("threads"),
                })}
                onClick={() => handleScope("threads")}
              >
                Threads
                <Badge.Root
                  square
                  {...(threads?.some((x) => x?.isLoading) && {
                    color: "gray",
                  })}
                  {...(threads?.flatMap((x) => x?.data).length > 0
                    ? {
                        color: "green",
                      }
                    : {
                        color: "gray",
                      })}
                >
                  {threads?.some((x) => x?.isLoading) ? (
                    <Badge.Icon
                      as={RiLoader3Line}
                      className="size-3 animate-spin"
                    />
                  ) : (
                    threads?.flatMap((x) => x?.data).length
                  )}
                </Badge.Root>
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !search.scope?.includes("courses"),
                })}
                onClick={() => handleScope("courses")}
              >
                Courses
                <Badge.Root
                  square
                  {...(courses?.some((x) => x?.isLoading) && {
                    color: "gray",
                  })}
                  {...(courses?.flatMap((x) => x?.data).length > 0
                    ? {
                        color: "green",
                      }
                    : {
                        color: "gray",
                      })}
                >
                  {courses?.some((x) => x?.isLoading) ? (
                    <Badge.Icon
                      as={RiLoader3Line}
                      className="size-3 animate-spin"
                    />
                  ) : (
                    courses?.flatMap((x) => x?.data).length
                  )}
                </Badge.Root>
              </Button.Root>
            </div>
            <span className="text-subheading-xs font-normal text-text-soft-400">
              {search.scope === undefined ? (
                "Searching your communities"
              ) : (
                <>
                  Searching everywhere in:{" "}
                  <strong>{smartJoin(search.scope)}</strong>
                </>
              )}
            </span>
          </div>
        </div>
      </Section>
      <div className="sticky top-0 z-20 flex items-center justify-between bg-bg-white-0 px-10 py-2">
        <h2 className="text-title-h6 font-light text-text-soft-400">
          <span className="text-text-strong-950">Your </span>
          {search.scope === undefined ? (
            "Communities"
          ) : (
            <strong className="capitalize">{smartJoin(search.scope)}</strong>
          )}
        </h2>
        <div className="flex items-center gap-1.5">
          <CompactButton.Root>
            <CompactButton.Icon className="size-4" as={RiListCheck} />
          </CompactButton.Root>
          <CompactButton.Root>
            <CompactButton.Icon className="size-4" as={RiLayoutMasonryLine} />
          </CompactButton.Root>
        </div>
      </div>
      <div className="columns-1 gap-1.5 md:columns-2 lg:columns-3 xl:columns-4">
        {Object.entries(map).map(([key, value]) => {
          if (search.scope === undefined && key !== "communities") return null

          if (search.scope && !search.scope.includes(key as keyof typeof map))
            return null

          return (
            <>
              {value?.map((item) => {
                if (key === "communities") {
                  const community = item as z.infer<typeof communitySchema>
                  const logo = community?.images?.find((x) => x.logo)
                  const featured = community?.images?.find((x) => x.featured)
                  if (
                    search.q &&
                    !community.name
                      .toLowerCase()
                      .includes(search.q.toLowerCase())
                  )
                    return null
                  return (
                    <Link
                      to="/communities/$id"
                      params={{ id: community.id }}
                      preload="intent"
                      className="relative mb-1.5 w-full break-inside-avoid"
                      key={community.id + "today"}
                    >
                      <Image
                        path={featured?.path!}
                        lqip={{
                          active: true,
                          quality: 1,
                          blur: 50,
                        }}
                        className="block rounded-sm"
                        alt={`Community ${community.name} image`}
                      />
                      <div
                        style={{
                          background: `linear-gradient(0deg, rgba(${community?.meta?.colors?.LightMuted.rgb.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                        }}
                        className="absolute inset-x-0 bottom-0 h-[65%]"
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
                      <header className="absolute inset-x-0 top-0 z-10 p-3">
                        <div className="flex w-fit items-center gap-1.5 rounded-full border-white/80 bg-white/70 p-1 pr-2.5 backdrop-blur">
                          <Avatar.Root className="shadow-regular-md" size="20">
                            <Avatar.Image src={logo?.url!} />
                          </Avatar.Root>
                          <span className="text-label-xs opacity-65">
                            {community?.tags?.[0]}
                          </span>
                        </div>
                      </header>
                      <footer
                        style={{
                          color:
                            community?.meta?.colors?.LightMuted.titleTextColor,
                        }}
                        className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6"
                      >
                        <h4 className="mb-1.5 text-pretty text-title-h5 font-light lg:mb-2 xl:mb-2.5">
                          {community?.name}
                        </h4>
                        <div className="flex items-center gap-4 *:text-label-xs *:font-light *:opacity-75">
                          <div className="flex items-center gap-2">
                            <RiChat3Line className="size-4" />
                            <span>25 Comments</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiTimeLine className="size-4" />
                            <span>About 4 mins</span>
                          </div>
                        </div>
                      </footer>
                    </Link>
                  )
                }
                if (key === "threads") {
                  const thread = item as z.infer<typeof communityThreadSchema>
                  const featured = thread?.images?.find((x) => x.featured)
                  if (
                    search.q &&
                    !thread.title.toLowerCase().includes(search.q.toLowerCase())
                  )
                    return null
                  return (
                    <Link
                      to="/communities/$id/threads/$threadId"
                      params={{ id: thread.communityId, threadId: thread.id }}
                      preload="intent"
                      className="relative mb-1.5 w-full break-inside-avoid"
                      key={thread.id + "today"}
                    >
                      <Image
                        path={featured?.path!}
                        lqip={{
                          active: true,
                          quality: 1,
                          blur: 50,
                        }}
                        className="block rounded-sm"
                        alt={`Thread ${thread.title} image`}
                      />
                      <div
                        style={{
                          background: `linear-gradient(0deg, rgba(${thread?.meta?.colors?.LightMuted.rgb.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                        }}
                        className="absolute inset-x-0 bottom-0 h-[65%]"
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
                      <header className="absolute inset-x-0 top-0 z-10 p-3">
                        <div className="flex w-fit items-center gap-1.5 rounded-full border-white/80 bg-white/70 p-1 pr-2.5 backdrop-blur">
                          <Avatar.Root className="shadow-regular-md" size="20">
                            {thread?.author?.avatarUrl && (
                              <Avatar.Image src={thread?.author?.avatarUrl} />
                            )}
                          </Avatar.Root>
                          <span className="text-label-xs opacity-65">
                            {thread?.tags?.[0]}
                          </span>
                        </div>
                      </header>
                      <footer
                        style={{
                          color:
                            thread?.meta?.colors?.LightMuted.titleTextColor,
                        }}
                        className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6"
                      >
                        <h4 className="mb-1.5 text-pretty text-title-h5 font-light lg:mb-2 xl:mb-2.5">
                          {thread?.title}
                        </h4>
                        <div className="flex items-center gap-4 *:text-label-xs *:font-light *:opacity-75">
                          <div className="flex items-center gap-2">
                            <RiChat3Line className="size-4" />
                            <span>25 Comments</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiTimeLine className="size-4" />
                            <span>About 4 mins</span>
                          </div>
                        </div>
                      </footer>
                    </Link>
                  )
                }
                if (key === "courses") {
                  const course = item as z.infer<typeof communityCourseSchema>
                  const imagePath = getPathFromGoogleStorage(
                    course?.content?.featureImageUrl || ""
                  )

                  if (
                    search.q &&
                    !course.title.toLowerCase().includes(search.q.toLowerCase())
                  )
                    return null
                  return (
                    <Link
                      to="/communities/$id/courses/$courseId"
                      params={{ id: course.communityId, courseId: course.id }}
                      search={{
                        type: course?.typeAccessor,
                        typeUid: course?.typeUid,
                      }}
                      preload="intent"
                      className={cn(
                        "relative mb-1.5 min-h-[25vh] w-full break-inside-avoid",
                        {
                          "bg-primary-base *:text-static-white":
                            !course?.content?.featureImageUrl || !imagePath,
                        }
                      )}
                      key={course.id + "today"}
                    >
                      {/* {course?.content?.featureImageUrl && imagePath && (
                        <Image
                          path={imagePath}
                          lqip={{
                            active: true,
                            quality: 1,
                            blur: 50,
                          }}
                          className="block min-h-[25vh] rounded-sm object-cover"
                          alt={`Course ${course.title} image`}
                        />
                      )}

                      <header className="absolute inset-x-0 top-0 z-10 p-3">
                        <div className="flex w-fit items-center gap-1.5 rounded-full border-white/80 bg-white/70 p-1 pr-2.5 backdrop-blur">
                          <Avatar.Root className="shadow-regular-md" size="20">
                            {course?.author?.avatarUrl && (
                              <Avatar.Image src={course?.author?.avatarUrl} />
                            )}
                          </Avatar.Root>
                          <span className="text-label-xs opacity-65">
                            {course?.tags?.[0]}
                          </span>
                        </div>
                      </header>
                      <footer
                        style={{
                          color:
                            course?.meta?.colors?.LightMuted.titleTextColor,
                        }}
                        className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6"
                      >
                        <h4 className="mb-1.5 text-pretty text-title-h5 font-light lg:mb-2 xl:mb-2.5">
                          {course?.title}
                        </h4>
                        <div className="flex items-center gap-4 *:text-label-xs *:font-light *:opacity-75">
                          <div className="flex items-center gap-2">
                            <RiChat3Line className="size-4" />
                            <span>25 Comments</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiTimeLine className="size-4" />
                            <span>About 4 mins</span>
                          </div>
                        </div>
                      </footer> */}
                    </Link>
                  )
                }
              })}
            </>
          )
        })}
        {/* {communities?.data?.map((community) => {
          const logo = community.images?.find((x) => x.logo)
          const featured = community.images?.find((x) => x.featured)
          return (
            <div
              className="relative mb-1.5 w-full break-inside-avoid"
              key={community.id + "today"}
            >
              <Image
                path={featured?.path!}
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                className="block rounded-sm"
                alt={`Community ${community.name} image`}
              />
              <div
                style={{
                  background: `linear-gradient(0deg, rgba(${community?.meta?.colors?.LightMuted.rgb.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                }}
                className="absolute inset-x-0 bottom-0 h-[65%]"
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
              <header className="absolute inset-x-0 top-0 z-10 p-3">
                <div className="flex w-fit items-center gap-1.5 rounded-full border-white/80 bg-white/70 p-1 pr-2.5 backdrop-blur">
                  <Avatar.Root className="shadow-regular-md" size="20">
                    <Avatar.Image src={logo?.url!} />
                  </Avatar.Root>
                  <span className="text-label-xs opacity-65">
                    {community?.tags?.[0]}
                  </span>
                </div>
              </header>
              <footer
                style={{
                  color: community?.meta?.colors?.LightMuted.titleTextColor,
                }}
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6"
              >
                <h4 className="mb-1.5 text-pretty text-title-h5 font-light lg:mb-2 xl:mb-2.5">
                  {community?.name}
                </h4>
                <div className="flex items-center gap-4 *:text-label-xs *:font-light *:opacity-75">
                  <div className="flex items-center gap-2">
                    <RiChat3Line className="size-4" />
                    <span>25 Comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiTimeLine className="size-4" />
                    <span>About 4 mins</span>
                  </div>
                </div>
              </footer>
            </div>
          )
        })} */}
      </div>
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
