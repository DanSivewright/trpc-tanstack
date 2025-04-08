import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

import { useElementSize } from "@/hooks/use-element-size"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as Divider from "@/components/ui/divider"
import Image from "@/components/image"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/explore"
)({
  component: RouteComponent,
})

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
function RouteComponent() {
  const { ref, width } = useElementSize()
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())
  return (
    <>
      <header
        style={{
          marginTop: `-${width / 4}px`,
          width: `calc(100vw + ${width}px)`,
          marginLeft: `-${width / 2}px`,
        }}
        className="mx-auto flex w-full gap-6"
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
      <Divider.Root
        variant="line-text"
        className="my-6 text-label-sm font-light"
      >
        Explore Our 100+ Communities
      </Divider.Root>
      <Section spacer="p" side="b" className="gutter flex flex-col gap-8">
        <header className="flex flex-col">
          <div className="flex items-center gap-4">
            <Button.Root
              className="w-fit rounded-full"
              variant="neutral"
              size="small"
            >
              All
              <Badge.Root square color="green">
                66
              </Badge.Root>
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Articles
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Events
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Threads
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Courses
            </Button.Root>
          </div>
        </header>
        <div className="columns-1 gap-3 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5">
          {communities?.data?.map((community) => (
            <div
              className="mb-3 w-full break-inside-avoid"
              key={community.id + "today"}
            >
              <Image
                path={`community-${community.id}-image.jpg`}
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                className="block rounded-10"
                alt={`Community ${community.name} image`}
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
