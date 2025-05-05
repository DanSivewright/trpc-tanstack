import { useTRPC } from "@/integrations/trpc/react"
import { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import {
  RiArrowRightSLine,
  RiAwardLine,
  RiBook2Line,
  RiBriefcaseLine,
  RiBuildingLine,
  RiCameraLine,
  RiChat1Line,
  RiClockwiseLine,
  RiComputerLine,
  RiGlobeLine,
  RiHammerLine,
  RiHeartLine,
  RiInfinityLine,
  RiInformationFill,
  RiKanbanView,
  RiLoaderLine,
  RiMusic2Line,
  RiPaletteLine,
  RiPencilLine,
  RiTranslate,
  RiUserLine,
  RiUserStarLine,
  RiVideoLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { z } from "zod"

import { cn } from "@/lib/utils"
import { useNotification } from "@/hooks/use-notification"
import { Checkbox } from "@/components/ui/checkbox"
import { FancyButton } from "@/components/ui/fancy-button"
import { Label } from "@/components/ui/label"
import * as Textarea from "@/components/ui/textarea"
import { AutoGrowTextarea } from "@/components/auto-grow-textarea"
import FieldInfo from "@/components/field-info"
import { Grid } from "@/components/grid"
import { Section } from "@/components/section"

import { useGoToNextStep } from "./-hooks/use-go-to-next-step"
import { communitySteps } from "./route"

export const communityTags: {
  title: string
  icon: RemixiconComponentType
}[] = [
  { title: "Professional", icon: RiBriefcaseLine },
  { title: "Creative Arts", icon: RiPaletteLine },
  { title: "Technology", icon: RiComputerLine },
  { title: "Business", icon: RiBuildingLine },
  { title: "Language Learning", icon: RiTranslate },
  { title: "Health & Wellness", icon: RiHeartLine },
  { title: "Science", icon: RiInfinityLine },
  { title: "Music", icon: RiMusic2Line },
  { title: "Photography", icon: RiCameraLine },
  { title: "Writing", icon: RiPencilLine },
  { title: "Digital Marketing", icon: RiComputerLine },
  { title: "Personal Development", icon: RiUserLine },
  { title: "Certification Available", icon: RiAwardLine },
  { title: "Project Based", icon: RiKanbanView },
  { title: "Mentorship", icon: RiUserLine },
  { title: "Live Sessions", icon: RiVideoLine },
  { title: "Self-Paced", icon: RiClockwiseLine },
  { title: "Discussion Active", icon: RiChat1Line },
  { title: "Resource Rich", icon: RiBook2Line },
  { title: "Collaboration", icon: RiUserStarLine },
  { title: "Workshop Style", icon: RiHammerLine },
  { title: "International", icon: RiGlobeLine },
]

export const Route = createFileRoute(
  "/_learner/communities/create/$id/community/"
)({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      step: "details",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { notification } = useNotification()
  const { step } = Route.useLoaderData()
  const { goToStep } = useGoToNextStep({ id })

  const qc = useQueryClient()
  const trpc = useTRPC()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const me = useQuery(trpc.people.me.queryOptions())

  const createCommunity = useMutation(trpc.communities.create.mutationOptions())
  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())
  const schema = communitySchema.pick({
    name: true,
    headline: true,
    tags: true,
  })
  const form = useForm({
    defaultValues: {
      name: community.data?.name || "",
      headline: community.data?.headline || "",
      tags: community.data?.tags || [],
    } as z.infer<typeof schema>,
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmit: async (data) => {
      const currentStep = communitySteps.find((x) => x.step === step)
      const nextStep = communitySteps?.[Number(currentStep?.indicator)]

      if (community?.data) {
        if (!form.state.isDirty) {
          goToStep(nextStep.step)
          return
        }
        await updateCommunity.mutateAsync(
          {
            id,
            ...data?.value,
          },
          {
            onSuccess: async () => {
              await Promise.all([
                qc.invalidateQueries({
                  queryKey: trpc.communities.joined.queryKey(),
                }),
                qc.invalidateQueries({
                  queryKey: trpc.communities.detail.queryKey({ id }),
                }),
              ])

              goToStep(nextStep.step)
            },
          }
        )
      } else {
        await createCommunity.mutateAsync(
          {
            id,
            authorUid: me.data?.uid!,
            author: {
              uid: me.data?.uid!,
              firstName: me.data?.firstName!,
              lastName: me.data?.lastName,
              email: me.data?.companyPerson?.email,
              avatarUrl: me.data?.imageUrl,
            },
            name: data?.value?.name,
            headline: data?.value?.headline,
            tags: data?.value?.tags,
          },
          {
            onSettled: () => {
              qc.invalidateQueries({
                queryKey: trpc.communities.joined.queryKey(),
              })
            },
            onSuccess: () => {
              goToStep(nextStep.step)
            },
            onError: () => {
              notification({
                title: "Error",
                description:
                  "Something went wrong while creating the community. Please try again",
                variant: "filled",
                status: "error",
              })
            },
          }
        )
      }
    },
  })
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <Section
          spacer="p"
          side="b"
          className="h-[calc(100dvh-93px)] max-h-[calc(100dvh-93px)] w-screen justify-center overflow-x-hidden overflow-y-scroll pt-12 lg:pt-[20dvh]"
        >
          <div className="gutter mx-auto flex w-full max-w-screen-xl flex-col gap-12 2xl:px-0">
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex flex-col gap-2">
                  <Label.Root
                    className="text-title-h6 font-normal"
                    htmlFor={field.name}
                  >
                    Give your community a name
                    <Label.Asterisk />
                  </Label.Root>
                  <AutoGrowTextarea
                    autoFocus
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    value={field.state.value}
                    placeholder="Community Name"
                    minHeight={0}
                  />
                  <FieldInfo
                    field={field}
                    fallback="This is the name of the community. Pick a good one!"
                    fallbackIcon={RiInformationFill}
                  />
                </div>
              )}
            />
            <form.Field
              name="headline"
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label.Root
                    className="text-title-h6 font-normal"
                    htmlFor={field.name}
                  >
                    Community Headline
                    <Label.Asterisk />
                  </Label.Root>

                  <Textarea.Root
                    placeholder="Community Headline"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id={field.name}
                    name={field.name}
                  >
                    <Textarea.CharCounter
                      current={field.state.value.length}
                      max={200}
                    />
                  </Textarea.Root>

                  <FieldInfo
                    field={field}
                    fallback="Tell us what the community is about in 1 - 2 sentences."
                    fallbackIcon={RiInformationFill}
                  />
                </div>
              )}
            />
            <form.Field
              name="tags"
              mode="array"
              children={(field) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label.Root>Tags</Label.Root>
                    <FieldInfo
                      field={field}
                      fallback="Select the tags that best describe the community. At least 1 tag is required."
                      fallbackIcon={RiInformationFill}
                    />
                    <Grid gap="xs">
                      {communityTags.map((f) => (
                        <Label.Root className="col-span-4 flex items-center gap-2">
                          <Checkbox.Root
                            checked={field.state.value.includes(f.title)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.pushValue(f.title)
                              } else {
                                const index = field.state.value.indexOf(f.title)
                                if (index !== -1) {
                                  field.removeValue(index)
                                }
                              }
                            }}
                          />
                          {f.title}
                        </Label.Root>
                      ))}
                    </Grid>
                  </div>
                )
              }}
            />
          </div>
        </Section>
        <footer className="dark:bg-gray-950/80 gutter fixed inset-x-0 bottom-0 border-t border-bg-soft-200 bg-white/80 backdrop-blur-sm 2xl:px-0">
          <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
            <span></span>
            <div className="flex items-center gap-4">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <FancyButton.Root
                    variant="primary"
                    type="submit"
                    disabled={!canSubmit}
                  >
                    Next
                    <FancyButton.Icon
                      className={cn(isSubmitting && "animate-spin")}
                      as={isSubmitting ? RiLoaderLine : RiArrowRightSLine}
                    />
                  </FancyButton.Root>
                )}
              />
            </div>
          </div>
        </footer>
      </form>
    </>
  )
}
