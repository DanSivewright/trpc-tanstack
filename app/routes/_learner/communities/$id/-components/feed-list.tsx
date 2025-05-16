import { useTRPC } from "@/integrations/trpc/react"
import type { communityFeedSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { RiAddLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import type { z } from "zod"

import { FancyButton } from "@/components/ui/fancy-button"
import { Section } from "@/components/section"

import FeedComment from "./feed-comment"
import FeedCourse from "./feed-course"
import FeedThread from "./feed-thread"

type Props = {}

type communityFeedItem = z.infer<typeof communityFeedSchema>[number]
const components: {
  [K in communityFeedItem["type"]]?: React.ComponentType<
    Extract<communityFeedItem, { type: K }>
  >
} = {
  thread: FeedThread,
  course: FeedCourse,
  comment: FeedComment,
}

const FeedList: React.FC<Props> = ({}) => {
  const trpc = useTRPC()
  const params = useParams({
    from: "/_learner/communities/$id/",
  })
  const feed = useSuspenseQuery(
    trpc.communities.feed.all.queryOptions({
      communityId: params.id,
    })
  )

  if (!feed.data || !feed.data?.length) {
    return (
      <Section className="gutter">
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
            >
              <FancyButton.Icon as={RiAddLine} />
              Create a thread
            </FancyButton.Root>
            <FancyButton.Root
              size="xsmall"
              variant="basic"
              className="relative z-10"
            >
              <FancyButton.Icon as={RiAddLine} />
              Create a article
            </FancyButton.Root>
            <FancyButton.Root
              size="xsmall"
              variant="basic"
              className="relative z-10"
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
      {feed?.data?.map((item) => {
        const Block = components[item.type]
        if (!Block) return null
        return <Block key={item.id} {...item} />
      })}
    </Section>
  )
}
export default FeedList
