import { useTRPC } from "@/integrations/trpc/react"
import {
  RiAddLine,
  RiAttachmentLine,
  RiBookmarkLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiVideoAddLine,
  RiVoiceAiLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import * as Avatar from "@/components/ui/avatar"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Input from "@/components/ui/input"
import * as Tooltip from "@/components/ui/tooltip"
import { BounceCards } from "@/components/bounce-cards"
import { Section } from "@/components/section"

const images = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
]

const transformStyles = [
  "rotate(5deg) translate(-200px, 0)",
  "rotate(0deg) translate(-100px, 0)",
  "rotate(-5deg) translate(0, 0)",
  "rotate(5deg) translate(100px, 0)",
  "rotate(-5deg) translate(200px, 0)",
]

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
      <div className="sticky top-14 mx-auto mt-2 flex w-full max-w-screen-lg flex-col gap-2 px-6 xl:px-0">
        <Avatar.Root className="absolute -left-12 top-0" size="40">
          <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
        </Avatar.Root>
        <div className="flex w-full flex-col gap-1 rounded-10 bg-bg-soft-200 p-1 pb-1.5 shadow-regular-md">
          <Input.Root className="shadow-none">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input type="text" placeholder="What's on your mind?" />
            </Input.Wrapper>
          </Input.Root>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiAttachmentLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Attach</span>
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiVideoAddLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Video</span>
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiVoiceAiLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Voice</span>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <FancyButton.Root size="xsmall" variant="neutral">
              Share
              <FancyButton.Icon as={RiSendPlaneLine} />
            </FancyButton.Root>
          </div>
        </div>
      </div>
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
    </>
  )
}
