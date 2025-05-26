import { useTRPC } from "@/integrations/trpc/react"
import {
  RiAddCircleLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiHashtag,
  RiMore2Line,
} from "@remixicon/react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/ui/dropdown"
import { FileFormatIcon } from "@/components/ui/file-format-icon"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tag } from "@/components/ui/tag"
import { toast } from "@/components/ui/toast"
import * as AlertToast from "@/components/ui/toast-alert"
import { Grid } from "@/components/grid"
import { Section } from "@/components/section"

export const Route = createFileRoute("/_learner/enrolments/$uid/")({
  validateSearch: z.object({
    type: z.enum(["courses", "programs", "externals"]),
    typeUid: z.string(),
  }),
  loaderDeps: ({ search }) => {
    return {
      type: search.type,
      typeUid: search.typeUid,
    }
  },
  loader: async ({ context, params, deps }) => {
    context.queryClient.prefetchQuery(
      context.trpc.enrolments.resources.queryOptions({
        params: {
          type: deps.type,
          typeUid: deps.typeUid,
        },
      })
    )
    await context.queryClient.ensureQueryData(
      context.trpc.enrolments.detail.queryOptions({
        params: {
          uid: params?.uid,
        },
        addOns: {
          withActivity: true,
        },
        query: {
          excludeMaterial: true,
        },
      })
    )
  },
  component: RouteComponent,
  pendingComponent: () => {
    return (
      <Section className="mx-auto flex w-full max-w-screen-lg flex-col gap-6 px-8 xl:px-0">
        <div className="h-12 w-3/4 animate-pulse rounded-10 bg-bg-soft-200"></div>

        <Grid gap="none" className="gap-y-7">
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Created
          </div>
          <div className="col-span-10 h-5 w-20 animate-pulse rounded-md bg-bg-soft-200"></div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Due
          </div>

          <div className="col-span-10 h-5 w-20 animate-pulse rounded-md bg-bg-soft-200"></div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Resources
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            <div className="h-5 w-48 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
          </div>

          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-sub-600">
            Topics
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
            <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
          </div>
        </Grid>
      </Section>
    )
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()
  const resourcesQuery = useQuery(
    trpc.enrolments.resources.queryOptions({
      params: {
        type: search.type,
        typeUid: search.typeUid,
      },
    })
  )
  const enrolmentQuery = useSuspenseQuery(
    trpc.enrolments.detail.queryOptions({
      params: {
        uid: params?.uid,
      },
      addOns: {
        withActivity: true,
      },
      query: {
        excludeMaterial: true,
      },
    })
  )
  const { data: enrolment } = enrolmentQuery
  return (
    <>
      <Section className="mx-auto flex w-full max-w-screen-lg flex-col gap-6 px-8 xl:px-0">
        <h1 className="text-title-h3">
          {enrolment?.publication?.featureImageUrl && (
            <Avatar.Root className="mr-3 inline-flex" size="32">
              <Avatar.Image src={enrolment?.publication?.featureImageUrl} />
            </Avatar.Root>
          )}
          {enrolment?.publication?.title}
        </h1>

        <Grid gap="none" className="gap-y-6">
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-strong-950">
            Created
          </div>
          <div className="col-span-10 shrink-0 text-label-sm text-text-sub-600/80">
            {format(enrolment?.createdAt, "EE, d MMMM yyyy, HH:mm")}
          </div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-strong-950">
            Due
          </div>
          <div className="col-span-10 flex items-center gap-2">
            {enrolment?.dueDate ? (
              <span className="shrink-0 text-label-sm text-text-sub-600/80">
                {format(enrolment?.dueDate, "EE, d MMMM yyyy, HH:mm")}
              </span>
            ) : (
              <Button.Root
                variant="neutral"
                mode="lighter"
                className="border border-dashed border-stroke-sub-300 ring-0"
                size="xxsmall"
              >
                <Button.Icon as={RiAddCircleLine} />
                <span>Set due date</span>
              </Button.Root>
            )}
          </div>
          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-strong-950">
            Resources
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            {resourcesQuery?.isLoading ? (
              <>
                <div className="h-5 w-48 animate-pulse rounded-md bg-bg-soft-200"></div>
                <div className="h-5 w-24 animate-pulse rounded-md bg-bg-soft-200"></div>
              </>
            ) : (
              <>
                {resourcesQuery?.data?.files?.map((file) => (
                  <Dropdown.Root key={file.uid}>
                    <Dropdown.Trigger asChild>
                      <Tag.Root key={file.uid}>
                        <Tag.Icon
                          as={FileFormatIcon.Root}
                          size="small"
                          format={file.media.type}
                        />
                        {file.media.title}
                        <Tag.Icon as={RiMore2Line} />
                      </Tag.Root>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                      <Dropdown.Group>
                        <Dropdown.Item
                          onClick={() => {
                            window.open(file?.media?.url, "_blank")
                          }}
                          className="justify-between"
                        >
                          View Resource
                          <Dropdown.ItemIcon as={RiExternalLinkLine} />
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            navigator.clipboard.writeText(file?.media?.url)
                            toast.custom((t) => (
                              <AlertToast.Root
                                t={t}
                                status="success"
                                message="Link copied to clipboard"
                              />
                            ))
                          }}
                          className="justify-between"
                        >
                          Copy Link
                          <Dropdown.ItemIcon as={RiFileCopyLine} />
                        </Dropdown.Item>
                      </Dropdown.Group>
                    </Dropdown.Content>
                  </Dropdown.Root>
                ))}
              </>
            )}
          </div>

          <div className="col-span-2 shrink-0 text-label-sm font-normal text-text-strong-950">
            Topics
          </div>
          <div className="col-span-10 flex flex-wrap items-center gap-2">
            {enrolment?.publication?.topics?.map((topic) => (
              <StatusBadge.Root
                variant="light"
                status="completed"
                className="bg-information-lighter text-label-xs *:text-primary-base"
              >
                <StatusBadge.Icon as={RiHashtag} /> <span>{topic}</span>
              </StatusBadge.Root>
            ))}
          </div>
        </Grid>
        <pre>{JSON.stringify(enrolment, null, 2)}</pre>
      </Section>
    </>
  )
}
