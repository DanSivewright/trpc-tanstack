import { useTRPC } from "@/integrations/trpc/react"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiAttachmentLine,
  RiBookmarkLine,
  RiLayoutMasonryLine,
  RiListCheck,
  RiSearchLine,
  RiSendPlaneLine,
  RiVideoAddLine,
  RiVoiceAiLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import * as Avatar from "@/components/ui/avatar"
import * as CompactButton from "@/components/ui/compact-button"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Input from "@/components/ui/input"
import * as Select from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
      <div className="h-[calc(100svh-48px)] max-h-[calc(100svh-48px)] w-screen overflow-hidden">
        <SidebarProvider
          style={{
            "--sidebar-width": `${Math.floor((window.innerWidth - 1024) / 2)}px`,
          }}
          className="items-start"
        >
          <Sidebar collapsible="none" className="flex flex-col items-end">
            <div className="w-3/4 bg-blue-50">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Option</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <label htmlFor="">Label</label>
                    <SidebarInput placeholder="search the dosc" />
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Label One</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Button one</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarRail />
            </div>
          </Sidebar>
          <main className="flex h-[calc(100svh-48px)] w-full max-w-screen-lg flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col overflow-y-auto px-2">
              <div className="relative mx-auto mt-2 flex w-full max-w-screen-lg flex-col gap-2 px-6 xl:px-0">
                <Avatar.Root className="absolute -left-12 top-0" size="40">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                </Avatar.Root>
                <div className="flex w-full flex-col gap-1 rounded-10 bg-bg-soft-200 p-1 pb-1.5 shadow-regular-md">
                  <Input.Root className="shadow-none">
                    <Input.Wrapper>
                      <Input.Icon as={RiSearchLine} />
                      <Input.Input
                        type="text"
                        placeholder="What's on your mind?"
                      />
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

              <div className="sticky top-0 z-20 mx-auto flex w-full max-w-screen-lg items-center justify-between bg-red-50 px-6 py-2 xl:px-0">
                <Link className="flex items-center gap-3" to="/">
                  <h2 className="text-title-h6 font-light text-text-soft-400">
                    <span className="text-text-strong-950">Pinned </span>Threads
                  </h2>
                  <RiArrowRightSLine className="size-5" />
                </Link>
              </div>

              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video max-w-3xl rounded-xl bg-pink-100"
                />
              ))}

              {/* <Section className="gutter">
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
            </Section> */}
            </div>

            {/* <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video max-w-3xl rounded-xl bg-pink-100"
                />
              ))}
            </div> */}
          </main>
        </SidebarProvider>
      </div>
    </>
  )
}
