import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { RiImageAddLine, RiImageLine } from "@remixicon/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { useNotification } from "@/hooks/use-notification"
import { DotPattern } from "@/components/dot-pattern"
import { Grid } from "@/components/grid"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/community/$id/publish"
)({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      step: "publish",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { notification } = useNotification()
  const navigate = useNavigate()
  const { step } = Route.useLoaderData()

  const qc = useQueryClient()
  const trpc = useTRPC()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())
  return (
    <Grid gap="none" className="h-[calc(100dvh-93px)] w-screen bg-bg-white-0">
      <div className="col-span-6 h-full w-full p-2">
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-20 bg-bg-weak-50 px-6">
          <DotPattern
            className={cn(
              "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
              "translate-x-[5%] translate-y-[15%]",
              "opacity-25"
            )}
          />
          <div className="mx-auto flex h-full w-full max-w-[500px] flex-col items-start justify-center gap-4">
            <header className="flex flex-col gap-1">
              <h2 className="text-title-h6 font-normal">Preview</h2>
              <p className="text-body-sm font-light text-text-soft-400">
                This is how your community will appear.
              </p>
            </header>

            <div className="relative z-10 h-[65%] w-full">
              <div className="relative z-10 h-full w-full rounded-20 border-stroke-sub-300 bg-bg-white-0 p-2 drop-shadow-2xl"></div>
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-20 bg-bg-weak-50"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-6 flex h-full w-full flex-col items-center justify-center bg-bg-white-0 p-2">
        <div className="mx-auto flex h-full w-full max-w-[500px] flex-col items-start justify-center gap-4">
          <RiImageAddLine className="size-10 fill-primary-base opacity-70" />
          <header className="flex flex-col gap-1.5">
            <h2 className="text-title-h5 font-normal">
              Add your community images
            </h2>
            <p className="text-body-xs font-light text-text-soft-400">
              Showcase your community with quality visuals
            </p>
          </header>
        </div>
      </div>
    </Grid>
  )
}
