import React, { Suspense, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { dateFormatter } from "@/utils/date-formatter"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiGraduationCapLine,
  RiHashtag,
  RiSearchLine,
  RiSunLine,
  RiUserSmileLine,
} from "@remixicon/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  isMatch,
  Link,
  Outlet,
  retainSearchParams,
  useMatches,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import useDebouncedCallback from "@/hooks/use-debounced-callback"
import * as Accordion from "@/components/ui/accordion"
import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import * as Breadcrumb from "@/components/ui/breadcrumb"
import * as Button from "@/components/ui/button"
import * as Datepicker from "@/components/ui/datepicker"
import * as Input from "@/components/ui/input"
import * as TabMenuVertical from "@/components/ui/tab-menu-vertical"
import * as Tooltip from "@/components/ui/tooltip"
import { Section } from "@/components/section"

export const Route = createFileRoute("/_learner/(communities)/communities/$id")(
  {
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
    loader: async ({ context, params: { id } }) => {
      const community = await context.queryClient.ensureQueryData(
        context.trpc.communities.detail.queryOptions({
          id,
        })
      )
      context.queryClient.prefetchQuery(
        context.trpc.communities.joined.queryOptions()
      )
      return {
        community,
        crumb: community.name,
      }
    },
    component: RouteComponent,
  }
)

function RouteComponent() {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const loaderData = Route.useLoaderData()
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const community = useQuery({
    ...trpc.communities.detail.queryOptions({
      id,
    }),
    initialData: loaderData.community,
  })
  const communities = useQuery(trpc.communities.joined.queryOptions())
  const leafMatches = useMatches()
  const matchesWithLeaves = leafMatches.filter((match) =>
    isMatch(match, "loaderData.leaf")
  )

  const leaves = matchesWithLeaves.map(({ pathname, loaderData, routeId }) => {
    return {
      routeId,
      href: pathname,
      label: loaderData?.leaf,
    }
  })

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
  }

  const items = [
    {
      label: `Welcome to ${community?.data?.name}`,
      icon: RiHashtag,
      value: 12,
    },
    {
      label: "FAQ and Rules",
      icon: RiHashtag,
    },
    {
      label: "Onboarding Course",
      icon: RiGraduationCapLine,
    },
  ]
  console.log("leaves:::", leaves)

  return (
    <div className="flex h-full w-full rounded-t-20 bg-bg-white-0">
      <aside className="hidden h-[calc(100vh-92px)] w-full max-w-96 border-r border-bg-soft-200 md:flex">
        <nav className="h-full w-16 min-w-16 pb-3 pt-2">
          <ul className="flex flex-col">
            {communities.data?.map((c) => (
              <Tooltip.Root key={`aside-list-${c.id}`}>
                <Tooltip.Trigger asChild>
                  <Link
                    onMouseOver={() => {
                      queryClient.prefetchQuery({
                        ...trpc.communities.detail.queryOptions({
                          id: c.id,
                        }),
                        staleTime: 1000 * 60 * 3,
                      })
                    }}
                    role="listitem"
                    to="/communities/$id"
                    params={{
                      id: c.id,
                    }}
                    className={cn(
                      "group relative flex w-full items-center justify-center py-1",
                      {
                        "bg-primary-alpha-16": c.id === id,
                      }
                    )}
                  >
                    <span
                      className={cn(
                        "absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary-base transition-all group-hover:h-4",
                        {
                          "h-[75%] group-hover:h-[75%]": c.id === id,
                        }
                      )}
                    ></span>
                    <Avatar.Root size="40">
                      <Avatar.Image src={c.logoUrl} />
                    </Avatar.Root>
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content
                  showArrow={false}
                  size="small"
                  variant="light"
                  side="right"
                  align="center"
                  sideOffset={0}
                >
                  {c.name}
                </Tooltip.Content>
              </Tooltip.Root>
            ))}
          </ul>
        </nav>
        <div className="no-scrollbar relative flex h-[calc(100vh-92px)] max-h-[calc(100vh-92px)] flex-1 flex-col overflow-y-scroll border-l border-bg-soft-200">
          <div className="flex flex-col gap-4 px-6 pt-8">
            <Avatar.Root
              size="80"
              className="aspect-square h-full max-h-48 w-full max-w-48"
              placeholderType="company"
            >
              <Avatar.Image src={community?.data?.logoUrl} />
            </Avatar.Root>
            <h1 className="text-pretty text-title-h3 font-light">
              {community?.data?.name}
            </h1>
          </div>
          <div className="flex flex-col gap-4 p-2 px-6">
            <div className="flex items-center gap-2">
              <AvatarGroupCompact.Root
                size="24"
                className="bg-bg-weak-50 shadow-regular-sm"
              >
                <AvatarGroupCompact.Stack>
                  <Avatar.Root>
                    <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/emma.png" />
                  </Avatar.Root>
                  <Avatar.Root>
                    <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                  </Avatar.Root>
                  <Avatar.Root>
                    <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/sophia.png" />
                  </Avatar.Root>
                </AvatarGroupCompact.Stack>
                <AvatarGroupCompact.Overflow>+9</AvatarGroupCompact.Overflow>
              </AvatarGroupCompact.Root>
              {/* <Button.Root size="xsmall" variant="neutral" mode="lighter">
                <Button.Icon as={RiAccountCircleLine} />+ 5
              </Button.Root> */}
              <Button.Root size="xsmall" variant="neutral" mode="ghost">
                <Button.Icon as={RiAddLine} />
                <span>Add Member</span>
              </Button.Root>
            </div>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  type="text"
                  value={community?.data?.headline}
                  placeholder="Placeholder text..."
                />
              </Input.Wrapper>
            </Input.Root>
            <div className="flex flex-wrap items-center gap-1.5">
              {community?.data?.tags?.map((t) => (
                <Badge.Root
                  color="purple"
                  size="medium"
                  key={community?.data?.id + t}
                >
                  {t}
                </Badge.Root>
              ))}
              <Badge.Root
                className="cursor-pointer"
                size="medium"
                variant="light"
              >
                <Badge.Icon as={RiAddLine} /> Add Tag
              </Badge.Root>
            </div>
          </div>

          <Accordion.Root
            type="multiple"
            className="mt-4"
            defaultValue={["information", "pinned"]}
          >
            <Accordion.Item
              className="w-full rounded-none border-none bg-transparent bg-none px-0 ring-0 data-[state=open]:bg-bg-white-0"
              value="pinned"
            >
              <Accordion.Trigger className="rounded-none border-none bg-bg-weak-50 py-1.5 text-subheading-xs uppercase text-text-soft-400 ring-0">
                <span></span>
                <span className="grow">📌 Pinned</span>
                <Accordion.Arrow />
              </Accordion.Trigger>
              <Accordion.Content className="flex flex-col gap-3 bg-transparent bg-none px-2 pt-6">
                <TabMenuVertical.Root defaultValue="Profile Settings">
                  <TabMenuVertical.List>
                    {items.map(({ label, icon: Icon, ...rest }) => (
                      <TabMenuVertical.Trigger key={label} value={label}>
                        <TabMenuVertical.Icon as={Icon} />
                        {label}
                        {rest.value && (
                          <Badge.Root
                            square
                            size="medium"
                            variant="filled"
                            color="green"
                          >
                            {rest.value}
                          </Badge.Root>
                        )}

                        <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
                      </TabMenuVertical.Trigger>
                    ))}
                  </TabMenuVertical.List>
                </TabMenuVertical.Root>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
          <Datepicker.Calendar
            showOutsideDays={true}
            className="-ml-2 -mt-2"
            mode="single"
          />
        </div>
      </aside>
      <div className="h-full grow overflow-auto md:h-[calc(100vh-92px)] md:max-h-[calc(100vh-92px)] md:overflow-y-scroll">
        <header className="border-b border-bg-soft-200 px-4 py-3">
          <Breadcrumb.Root>
            {leaves?.map((leaf, i) => {
              const isLast = items?.length - 1 === i
              return (
                <React.Fragment key={leaf.href + leaf.label}>
                  <Breadcrumb.Item
                    key={leaf.href + leaf.label}
                    active={isLast}
                    asChild
                  >
                    <Link to={leaf.href}>{leaf.label}</Link>
                  </Breadcrumb.Item>
                  {!isLast && leaves?.length > 1 && (
                    <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
                  )}
                </React.Fragment>
              )
            })}
          </Breadcrumb.Root>
        </header>
        <Section
          side="t"
          size="sm"
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
                Searching everywhere in:{" "}
                <strong>{community?.data?.name}</strong>
              </span>
            </div>
          </div>
        </Section>
        <Suspense>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
