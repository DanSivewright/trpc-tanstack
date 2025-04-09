import { useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { dateFormatter } from "@/utils/date-formatter"
import { RiSearchLine, RiSunLine, RiUserSmileLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  retainSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import useDebouncedCallback from "@/hooks/use-debounced-callback"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as Input from "@/components/ui/input"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/"
)({
  validateSearch: z.object({
    q: z.string().optional(),
    scope: z
      .array(
        z.enum(["all", "articles", "members", "events", "threads", "courses"])
      )
      .optional(),
  }),
  search: {
    middlewares: [retainSearchParams(["q", "scope"])],
  },
  loader: async (opts) => {
    console.log("opts:::", opts.deps)
  },
  component: RouteComponent,
  // loader: ({ context }) => {
  //   context.queryClient.prefetchQuery(context.trpc.people.me.queryOptions())
  // }
})

function RouteComponent() {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const { id } = Route.useParams()
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || "")
  const nvaigate = useNavigate({
    from: Route.fullPath,
  })

  const handleSearch = useDebouncedCallback(async (query: string) => {
    nvaigate({
      search: (old) => ({
        ...old,
        q: query,
      }),
      replace: true,
    })
  }, 500)

  const community = useQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  console.log("searchParams.scope:::", searchParams.scope)
  return (
    <>
      <header className="border-b border-bg-soft-200 px-4 py-3">x</header>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-title-h3 font-normal">
                Howdy {me?.data?.firstName}!
              </h1>
              <RiUserSmileLine className="size-10 fill-warning-base" />
            </div>
            <div className="flex items-center gap-2">
              <RiSunLine className="size-5 fill-warning-base" />
              <p className="text-subheading-sm font-light text-text-soft-400">
                {dateFormatter(new Date().toISOString(), {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {/* {dateFormatter(new Date().toISOString(), {
                dateStyle: "medium",
                month: "short",
                timeStyle: "medium",
              })} */}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-10 bg-bg-weak-50 p-2">
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                value={q}
                onInput={(e) => {
                  const value = e.currentTarget.value
                  setQ(value)
                  handleSearch(value)
                }}
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
                placeholder="Placeholder text..."
              />
              <Input.Icon as={RiSearchLine} />
            </Input.Wrapper>
          </Input.Root>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    searchParams.scope?.includes("all"),
                })}
                onClick={() => {
                  nvaigate({
                    search: (old) => ({
                      ...old,
                      scope: old.scope?.includes("all")
                        ? old.scope.filter((x) => x !== "all")
                        : [...(old.scope || []), "all"],
                    }),
                    replace: true,
                  })
                }}
              >
                Everything
                <Badge.Root square color="green">
                  66
                </Badge.Root>
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    searchParams.scope?.includes("articles"),
                })}
                onClick={() => {
                  nvaigate({
                    search: (old) => ({
                      ...old,
                      scope: old.scope?.includes("articles")
                        ? old.scope.filter((x) => x !== "articles")
                        : [...(old.scope || []), "articles"],
                    }),
                    replace: true,
                  })
                }}
              >
                Articles
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    searchParams.scope?.includes("events"),
                })}
                onClick={() => {
                  nvaigate({
                    search: (old) => ({
                      ...old,
                      scope: old.scope?.includes("events")
                        ? old.scope.filter((x) => x !== "events")
                        : [...(old.scope || []), "events"],
                    }),
                    replace: true,
                  })
                }}
              >
                Events
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    searchParams.scope?.includes("threads"),
                })}
                onClick={() => {
                  nvaigate({
                    search: (old) => ({
                      ...old,
                      scope: old.scope?.includes("threads")
                        ? old.scope.filter((x) => x !== "threads")
                        : [...(old.scope || []), "threads"],
                    }),
                    replace: true,
                  })
                }}
              >
                Threads
              </Button.Root>
              <Button.Root
                variant="neutral"
                size="xxsmall"
                className={cn("w-fit rounded-full", {
                  "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                    searchParams.scope?.includes("courses"),
                })}
                onClick={() => {
                  nvaigate({
                    search: (old) => ({
                      ...old,
                      scope: old.scope?.includes("courses")
                        ? old.scope.filter((x) => x !== "courses")
                        : [...(old.scope || []), "courses"],
                    }),
                    replace: true,
                  })
                }}
              >
                Courses
              </Button.Root>
            </div>
            <span className="text-subheading-xs font-normal text-text-soft-400">
              Searching everywhere in: <strong>{community?.data?.name}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
