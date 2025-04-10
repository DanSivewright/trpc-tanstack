import { useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { dateFormatter } from "@/utils/date-formatter"
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiChat3Line,
  RiCircleLine,
  RiClockwiseLine,
  RiLayoutMasonryLine,
  RiListCheck,
  RiListSettingsLine,
  RiMessage2Line,
  RiSearchLine,
  RiSunLine,
  RiTimeLine,
  RiUserSmileLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  retainSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import useDebouncedCallback from "@/hooks/use-debounced-callback"
import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as CompactButton from "@/components/ui/compact-button"
import * as Input from "@/components/ui/input"
import * as Select from "@/components/ui/select"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import Image from "@/components/image"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/"
)({
  validateSearch: z.object({
    q: z.string().optional(),
    scope: z
      .array(
        z.enum(["all", "articles", "members", "events", "threads", "courses"])
      )
      .default(["all"])
      .optional(),
  }),
  search: {
    middlewares: [retainSearchParams(["q", "scope"])],
  },
  loader: async (opts) => {
    console.log("opts:::", opts.deps)
  },
  component: RouteComponent,
  // loader: ({ context }) => {
  //   context.queryClient.prefetchQuery(context.trpc.people.me.queryOptions())
  // }
})

function RouteComponent() {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const { id } = Route.useParams()
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || "")
  const nvaigate = useNavigate({
    from: Route.fullPath,
  })

  const handleSearch = useDebouncedCallback(async (query: string) => {
    nvaigate({
      search: (old) => ({
        ...old,
        q: query,
      }),
      replace: true,
    })
  }, 500)

  const community = useQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const handleScope = (
    scope: "all" | "articles" | "members" | "events" | "threads" | "courses"
  ) => {
    if (scope == "all") {
      nvaigate({
        search: (old) => ({
          ...old,
          scope: ["all"],
        }),
        replace: true,
      })
      return
    }

    if (searchParams.scope?.includes(scope)) {
      nvaigate({
        search: (old) => ({
          ...old,
          scope: old.scope?.filter((x) => x !== "all" && x !== scope) || [
            "all",
          ],
        }),
        replace: true,
      })
      return
    }
    nvaigate({
      search: (old) => ({
        ...old,
        scope: [...(old.scope?.filter((x) => x !== "all") || []), scope],
      }),
      replace: true,
    })
    // nvaigate({
    //   search: (old) => ({
    //     ...old,
    //     scope: [...(old.scope?.filter((x) => x !== "all") || []), scope],
    //   }),
    //   replace: true,
    // })
  }

  const communities = useQuery(trpc.communities.all.queryOptions())
  return (
    <>
      <header className="border-b border-bg-soft-200 px-4 py-3">x</header>
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
                {dateFormatter(new Date().toISOString(), {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {/* {dateFormatter(new Date().toISOString(), {
                dateStyle: "medium",
                month: "short",
                timeStyle: "medium",
              })} */}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-10 bg-bg-weak-50 p-2">
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                value={q}
                onInput={(e) => {
                  const value = e.currentTarget.value
                  setQ(value)
                  handleSearch(value)
                }}
                // onInput={(e) =>
                //   nvaigate({
                //     search: (old) => ({
                //       ...old,
                //       q: e.currentTarget.value,
                //     }),
                //     replace: true,
                //   })
                // }
                type="text"
                placeholder="Placeholder text..."
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
                    !searchParams.scope?.includes("all"),
                })}
                onClick={() => handleScope("all")}
              >
                Everything
                <Badge.Root square color="green">
                  66
                </Badge.Root>
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !searchParams.scope?.includes("articles"),
                })}
                onClick={() => handleScope("articles")}
              >
                Articles
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !searchParams.scope?.includes("events"),
                })}
                onClick={() => handleScope("events")}
              >
                Events
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !searchParams.scope?.includes("threads"),
                })}
                onClick={() => handleScope("threads")}
              >
                Threads
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    !searchParams.scope?.includes("courses"),
                })}
                onClick={() => handleScope("courses")}
              >
                Courses
              </Button.Root>
            </div>
            <span className="text-subheading-xs font-normal text-text-soft-400">
              Searching everywhere in: <strong>{community?.data?.name}</strong>
            </span>
          </div>
        </div>
      </Section>
      <div className="sticky top-0 z-20 flex items-center justify-between bg-bg-white-0 px-10 py-2">
        <Link className="flex items-center gap-3" to="/">
          <h2 className="text-title-h6 font-light text-text-soft-400">
            <span className="text-text-strong-950">Your </span>Feed
          </h2>
          <RiArrowRightSLine />
        </Link>
        <div className="flex items-center gap-1.5">
          <Select.Root defaultValue="All" variant="inline" size="xsmall">
            <Select.Trigger>
              <Select.Value placeholder="Select a payment..." />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="All">Everything</Select.Item>
              <Select.Item value="Articles">Articles</Select.Item>
              <Select.Item value="Events">Events</Select.Item>
              <Select.Item value="Threads">Threads</Select.Item>
              <Select.Item value="Courses">Courses</Select.Item>
            </Select.Content>
          </Select.Root>
          <CompactButton.Root>
            <CompactButton.Icon className="size-4" as={RiListCheck} />
          </CompactButton.Root>
          <CompactButton.Root>
            <CompactButton.Icon className="size-4" as={RiLayoutMasonryLine} />
          </CompactButton.Root>
        </div>
      </div>

      <div className="columns-1 gap-1.5 md:columns-2">
        {communities?.data?.map((community) => (
          <div
            className="relative mb-1.5 w-full break-inside-avoid"
            key={community.id + "today"}
          >
            <Image
              path={`community-${community.id}-image.jpg`}
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
                  <Avatar.Image src={community?.logoUrl} />
                </Avatar.Root>
                <span className="text-label-xs opacity-65">
                  {community?.tags?.[0]}
                </span>
              </div>
              {/* < */}
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
        ))}
      </div>
    </>
  )
}
