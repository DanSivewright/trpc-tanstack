import { useTRPC } from "@/integrations/trpc/react"
import { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import {
  RiAddCircleLine,
  RiArrowRightSLine,
  RiGlobalLine,
  RiInformationFill,
  RiLoaderLine,
  RiUserAddLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { FancyButton } from "@/components/ui/fancy-button"
import { Label } from "@/components/ui/label"
import { Radio } from "@/components/ui/radio"
import FieldInfo from "@/components/field-info"
import { gridVariants } from "@/components/grid"
import { Section } from "@/components/section"

import { useGoToNextStep } from "./-hooks/use-go-to-next-step"
import { communitySteps } from "./route"

export const Route = createFileRoute(
  "/_learner/communities/create/$id/community/settings"
)({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      step: "settings",
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
  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())

  const schema = communitySchema.pick({
    accessibile: true,
  })
  const form = useForm({
    defaultValues: {
      accessibile: community.data?.accessibile || "public",
    },
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmitInvalid: () => {
      notification({
        title: "Invalid Form",
        description: "Please fill out all fields correctly.",
        variant: "filled",
        status: "error",
      })
    },
    onSubmit: async (data) => {
      const currentStep = communitySteps.find((x) => x.step === step)
      const nextStep = communitySteps?.[Number(currentStep?.indicator)]

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
    },
  })
  const accessibile: {
    label: string
    description: string
    value: z.infer<typeof schema>["accessibile"]
    icon: RemixiconComponentType
  }[] = [
    {
      label: "Anyone",
      description: "Anyone can join the community without approval",
      value: "public",
      icon: RiGlobalLine,
    },
    {
      label: "Request to Join",
      description: "People need to be approved by the community admin",
      value: "approval",
      icon: RiUserAddLine,
    },
    {
      label: "Invite Only",
      description: "Only people invited by the community admin can join",
      value: "invite",
      icon: RiAddCircleLine,
    },
  ]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="h-[calc(100dvh-93px)] max-h-[calc(100dvh-93px)] w-screen justify-center overflow-x-hidden overflow-y-scroll pt-12 lg:pt-[20dvh]">
        <Section
          className="gutter mx-auto flex w-full max-w-screen-xl flex-col gap-2 2xl:px-0"
          spacer="p"
          side="b"
        >
          <form.Field
            name="accessibile"
            children={(field) => (
              <>
                <h1 className="text-title-h6 font-normal">
                  Who can join this community?
                </h1>
                <Radio.Group
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as z.infer<typeof schema>["accessibile"]
                    )
                  }
                  className={cn(gridVariants({ gap: "xs" }), "")}
                >
                  {accessibile.map((item) => (
                    <div className="group/radio col-span-12 aspect-video md:col-span-6 xl:col-span-3 xl:aspect-square">
                      <Radio.Item
                        checked={field.state.value === item.value}
                        className="hidden"
                        value={item.value}
                        id={item.value}
                      />
                      <Label.Root
                        htmlFor={item.value}
                        className={cn([
                          "flex h-full w-full flex-col items-start justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md",
                          "group-has-[[data-state=checked]]/radio:border-primary-base",
                          "group-has-[[data-state=checked]]/radio:shadow-primary-alpha-24",
                        ])}
                      >
                        <Avatar.Root className="hidden sm:flex sm:group-has-[[data-state=checked]]/radio:hidden">
                          <item.icon className="size-12 opacity-50" />
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          <item.icon className="size-12 opacity-50" />
                        </Avatar.Root>
                        <div className="flex flex-col gap-1">
                          <p className="text-paragraph-lg font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                            {item.label}
                          </p>
                          <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                            {item.description}
                          </p>
                        </div>
                      </Label.Root>
                    </div>
                  ))}
                </Radio.Group>
                <FieldInfo
                  field={field}
                  fallback="Select how you want people to join the community"
                  fallbackIcon={RiInformationFill}
                />
              </>
            )}
          />
        </Section>
      </div>
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
  )
}
