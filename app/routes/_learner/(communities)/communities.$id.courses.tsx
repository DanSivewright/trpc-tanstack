import { RiAddLine } from "@remixicon/react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { FancyButton } from "@/components/ui/fancy-button"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/courses"
)({
  component: RouteComponent,
  loader: () => ({
    leaf: "Courses",
  }),
})

function RouteComponent() {
  const params = Route.useParams()
  return (
    <>
      <Section className="gutter">
        <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
          <h1 className="relative z-10 text-title-h4">
            Your community has no courses
          </h1>
          <p className="relative z-10 text-label-sm font-light text-text-soft-400">
            Be the first to create a course in this community.
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
      {/* <Link
        to="/communities/$id/threads/$threadId"
        params={{
          id: params.id,
          threadId: crypto.randomUUID(),
        }}
      >
        Go to test thread
      </Link> */}
    </>
  )
}
