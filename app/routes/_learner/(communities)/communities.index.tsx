import { useTRPC } from "@/integrations/trpc/react"
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
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

import { useElementSize } from "@/hooks/use-element-size"
import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import * as Input from "@/components/ui/input"
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

export const Route = createFileRoute("/_learner/(communities)/communities/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery({
        ...context.trpc.communities.all.queryOptions(),
        staleTime: 1000 * 60 * 2,
      }),
      context.queryClient.prefetchQuery({
        ...context.trpc.communities.joined.queryOptions(),
        staleTime: 1000 * 60 * 2,
      }),
    ])
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())
  const joined = useQuery(trpc.communities.joined.queryOptions())
  const qc = useQueryClient()

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
          <p className="text-pretty text-subheading-sm font-light text-text-soft-400">
            Looking for a community? We have {communities.data?.length}+
            communities.
          </p>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                // value={q}
                // onInput={(e) => {
                //   const value = e.currentTarget.value
                //   setQ(value)
                //   handleSearch(value)
                // }}
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
          <Grid gap="xs" className="col-span-12 gap-8 lg:col-span-9">
            {communities?.data?.map((c) => (
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
                key={"all-" + c.id}
                className="relative col-span-12 flex flex-col gap-2 lg:col-span-6"
              >
                <Image
                  path={`community-${c.id}-image.jpg`}
                  lqip={{
                    active: true,
                    quality: 1,
                    blur: 50,
                  }}
                  sizes="(min-width: 1536px) 50vw, (min-width: 1024px) 100vw"
                  className="aspect-video w-full overflow-hidden rounded-10 object-cover"
                  alt={`Community ${c.name} image`}
                />
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar.Root size="24">
                        <Avatar.Image
                          src={c.logoUrl}
                          alt={`Community ${c.name} image`}
                        />
                      </Avatar.Root>
                      <h2 className="line-clamp-2 text-title-h6 font-light">
                        {c.name}
                      </h2>
                    </div>
                    <p className="line-clamp-3 text-pretty text-subheading-sm font-light text-text-soft-400">
                      {c.headline}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {c.tags?.map((t) => (
                        <Badge.Root
                          variant="lighter"
                          size="small"
                          key={c.id + t}
                        >
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
                </div>
              </Link>
            ))}
          </Grid>
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            <h3 className="text-title-h6 font-light text-text-soft-400">
              Your Communities
            </h3>
            <div className="flex flex-col gap-2">
              {joined?.data?.map((c) => {
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
                      <Avatar.Image src={c?.logoUrl} />
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
          </div>
        </Grid>
      </Section>
    </>
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
