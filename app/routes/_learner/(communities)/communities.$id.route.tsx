import { useRef } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import {
  RiArrowDropDownLine,
  RiArrowRightSLine,
  RiGraduationCapLine,
  RiHashtag,
  RiShareForwardBoxLine,
} from "@remixicon/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { useInView } from "motion/react"

import * as Accordion from "@/components/ui/accordion"
import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import * as Datepicker from "@/components/ui/datepicker"
import * as StatusBadge from "@/components/ui/status-badge"
import * as TabMenuVertical from "@/components/ui/tab-menu-vertical"
import * as Tooltip from "@/components/ui/tooltip"
import Image from "@/components/image"
import VerifiedIcon from "@/components/verified-icon"

export const Route = createFileRoute("/_learner/(communities)/communities/$id")(
  {
    component: RouteComponent,
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
  }
)

function RouteComponent() {
  const trpc = useTRPC()
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
  const blurHeaderRef = useRef(null)
  const isInView = useInView(blurHeaderRef, {
    initial: true,
    amount: 1,
  })

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

  return (
    <div className="flex h-full w-full rounded-t-20 bg-bg-white-0 pr-2">
      <aside className="flex h-[calc(100vh-92px)] w-full max-w-96 border-r border-bg-soft-200">
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
        <div className="no-scrollbar relative h-[calc(100vh-92px)] max-h-[calc(100vh-92px)] flex-1 overflow-y-scroll border-l border-bg-soft-200">
          <header
            style={{
              color: community?.data?.meta?.colors?.Vibrant?.titleTextColor,
              background: `linear-gradient(180deg, rgba(${community?.data.meta.colors.Vibrant?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
            }}
            className={cn(
              "sticky top-0 z-10 flex cursor-pointer items-center justify-between p-4 transition-all hover:backdrop-blur",
              {
                "shadow-regular-md backdrop-blur": !isInView,
              }
            )}
          >
            <div className="flex items-center gap-2">
              <VerifiedIcon className="size-4" />
              <h1>{community?.data?.name}</h1>
            </div>
            <RiArrowDropDownLine />
          </header>
          <div
            ref={blurHeaderRef}
            className="relative -mt-14 aspect-video w-full bg-red-50"
          >
            <Image
              key={`community-${community?.data?.id}-image.jpg-loader`}
              path={`community-${community?.data?.id}-image.jpg`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
              alt={`Community ${community?.data?.name} image`}
            />
          </div>
          <Accordion.Root
            type="multiple"
            defaultValue={["information", "pinned"]}
          >
            <Accordion.Item
              className="w-full rounded-none border-none bg-transparent bg-none px-0 ring-0 data-[state=open]:bg-bg-white-0"
              value="information"
            >
              <Accordion.Trigger className="rounded-none border-none bg-bg-weak-50 py-1.5 text-subheading-xs uppercase text-text-soft-400 ring-0">
                <span></span>
                <span className="grow">Information</span>
                <Accordion.Arrow />
              </Accordion.Trigger>
              <Accordion.Content className="flex flex-col gap-3 bg-transparent bg-none px-2 pt-6">
                <p className="line-clamp-3 text-label-xs font-normal text-text-sub-600">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laboriosam quidem vitae atque, reiciendis commodi qui fuga
                  recusandae et, eaque consequuntur nihil nesciunt? Eos, quod
                  harum? Harum laudantium corrupti quos natus.
                </p>
                <div className="flex items-center gap-2">
                  <AvatarGroupCompact.Root
                    size="32"
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
                    <AvatarGroupCompact.Overflow>
                      +9
                    </AvatarGroupCompact.Overflow>
                  </AvatarGroupCompact.Root>
                  <StatusBadge.Root className="ring-0" status="completed">
                    <StatusBadge.Dot />
                    25 Online
                  </StatusBadge.Root>
                </div>
                <Datepicker.Calendar
                  showOutsideDays={true}
                  className="-ml-2 -mt-2"
                  mode="single"
                />
              </Accordion.Content>
            </Accordion.Item>
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
        </div>
      </aside>
      <div className="h-[calc(100vh-92px)] max-h-[calc(100vh-92px)] grow overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  )
}
