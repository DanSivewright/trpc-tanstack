import { useTRPC } from "@/integrations/trpc/react"
import {
  RiArrowRightSLine,
  RiChat3Line,
  RiLayoutMasonryLine,
  RiListCheck,
  RiTimeLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import * as Avatar from "@/components/ui/avatar"
import * as CompactButton from "@/components/ui/compact-button"
import * as Select from "@/components/ui/select"
import Image from "@/components/image"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Feed",
  }),
})

function RouteComponent() {
  const trpc = useTRPC()

  const communities = useQuery(trpc.communities.all.queryOptions())
  return (
    <>
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
