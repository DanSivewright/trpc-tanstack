import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { useTRPC } from "@/lib/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icon"
import { Section } from "@/components/section"
import { Title } from "@/components/title"

export const Route = createFileRoute("/_learner/communities")({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const comms = useQuery(trpc.communities.all.queryOptions())
  const joinedComms = useQuery(trpc.communities.joined.queryOptions())
  return (
    <>
      <Section
        spacer="p"
        size="sm"
        side="b"
        className="bg-foreground gutter flex h-[45dvh] w-full flex-col items-start justify-end"
      >
        <Title
          className="text-background w-3/5 font-light"
          showAs={2}
          margin="b"
        >
          Our communities
          <br /> will take it from here
        </Title>
        <div className="bg-background relative flex h-16 w-3/5 overflow-hidden rounded-lg p-2">
          <Input
            placeholder="Search for a community..."
            className="h-full w-full border-none shadow-none"
            style={{
              background: "none",
            }}
          />
          <Button className="aspect-square h-full">
            <Icon name="Search" />
          </Button>
        </div>
      </Section>
    </>
  )
}
