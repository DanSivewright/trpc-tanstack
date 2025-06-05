import { useTRPC } from "@/integrations/trpc/react"
import type { communityItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { RiAddLine } from "@remixicon/react"
import { useSuspenseQueries } from "@tanstack/react-query"
import type { z } from "zod"

import { FancyButton } from "@/components/ui/fancy-button"
import { toast } from "@/components/ui/toast"
import { AlertToast } from "@/components/ui/toast-alert"
import { Section } from "@/components/section"

import FeaturedThread from "./featured-thread"

type Props = {
  communityId: string
}

type communityFeedItem = z.infer<typeof communityItemSchema>
const components: {
  [K in communityFeedItem["type"]]?: React.ComponentType<{
    source: Extract<communityFeedItem, { type: K }>
    size: "small" | "large"
    className?: string
  }>
} = {
  thread: FeaturedThread,
}

const FeedList: React.FC<Props> = ({ communityId }) => {
  const trpc = useTRPC()

  const feed = useSuspenseQueries({
    queries: [
      trpc.communities.courses.all.queryOptions({
        communityId,
      }),
      trpc.communities.threads.all.queryOptions({
        communityId,
      }),
      trpc.communities.articles.all.queryOptions({
        communityId,
      }),
    ],
  })

  if (!feed || !feed?.length || feed.every((x) => x?.data?.length === 0)) {
    return (
      <Section>
        <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
          <h1 className="relative z-10 text-title-h4">
            Your community has no posts
          </h1>
          <p className="relative z-10 text-label-sm font-light text-text-soft-400">
            Be the first to post in this community.
          </p>
          <div className="flex items-center gap-3">
            <FancyButton.Root
              size="xsmall"
              variant="primary"
              className="relative z-10"
              onClick={() => {
                toast.custom((t) => (
                  <AlertToast.Root
                    t={t}
                    status="success"
                    message="Feature coming soon"
                  />
                ))
              }}
            >
              <FancyButton.Icon as={RiAddLine} />
              Create a thread
            </FancyButton.Root>
            <FancyButton.Root
              size="xsmall"
              variant="basic"
              className="relative z-10"
              onClick={() => {
                toast.custom((t) => (
                  <AlertToast.Root
                    t={t}
                    status="success"
                    message="Feature coming soon"
                  />
                ))
              }}
            >
              <FancyButton.Icon as={RiAddLine} />
              Create a article
            </FancyButton.Root>
            <FancyButton.Root
              size="xsmall"
              variant="basic"
              className="relative z-10"
              onClick={() => {
                toast.custom((t) => (
                  <AlertToast.Root
                    t={t}
                    status="success"
                    message="Feature coming soon"
                  />
                ))
              }}
            >
              <FancyButton.Icon as={RiAddLine} />
              Create a course
            </FancyButton.Root>
          </div>

          <RiAddLine
            className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
            size={450}
          />
        </div>
      </Section>
    )
  }
  return (
    <Section side="b" className="mt-6 flex flex-col gap-12">
      {feed?.flatMap((group) => {
        return group?.data?.map((item) => {
          const Block = components[item.type]
          if (!Block) return null
          return (
            <Block
              key={"featured-" + item.id}
              // @ts-ignore
              source={item}
              // className="aspect-video"
              size="large"
            />
          )
        })
      })}
      {/* {feed?.data?.map((item) => {
        const Block = components[item.type]
        if (!Block) return null
        return <Block key={item.id} {...item} />
      })} */}
    </Section>
  )
}
export default FeedList
