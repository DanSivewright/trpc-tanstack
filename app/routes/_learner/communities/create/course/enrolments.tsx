import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import {
  RiArrowRightSLine,
  RiCloseCircleLine,
  RiGlobalLine,
  RiInformationFill,
  RiLoaderLine,
  RiUserAddLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { FancyButton } from "@/components/ui/fancy-button"
import { Label } from "@/components/ui/label"
import { Radio } from "@/components/ui/radio"
import FieldInfo from "@/components/field-info"
import { gridVariants } from "@/components/grid"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/communities/create/course/enrolments"
)({
  validateSearch: z.object({
    communityIds: z
      .array(z.string())
      .min(1, "Please select at least one community"),
    content: z.array(
      z.object({
        type: z.string(),
        typeUid: z.string(),
      })
    ),
  }),
  beforeLoad: ({ search }) => {
    if (!search.communityIds?.length) {
      throw redirect({
        to: "/communities/create/course",
      })
    }
    if (!search.content?.length) {
      throw redirect({
        to: "/communities/create/course/select-courses",
        search: { communityIds: search.communityIds },
      })
    }
  },
  loaderDeps: ({ search }) => ({
    communityIds: search.communityIds,
    content: search.content,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      ...deps.content.map((c) =>
        context.queryClient.ensureQueryData(
          context.trpc.content.detail.queryOptions({
            params: { type: c.type + "s", typeUid: c.typeUid },
          })
        )
      ),
      ...deps.communityIds.map((id) =>
        context.queryClient.ensureQueryData(
          context.trpc.communities.detail.queryOptions({ id })
        )
      ),
    ])
    return {
      step: "enrolments",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { content, communityIds } = Route.useSearch()

  const { notification } = useNotification()
  const navigate = useNavigate()

  const learning = useSuspenseQueries({
    queries: content.map((c) =>
      trpc.content.detail.queryOptions({
        params: { type: c.type + "s", typeUid: c.typeUid },
      })
    ),
  })
  const communities = useSuspenseQueries({
    queries: communityIds.map((id) =>
      trpc.communities.detail.queryOptions({ id })
    ),
  })

  const enrolmentOptions: {
    label: string
    description: string
    value: "none" | "all" | string
    icon?: RemixiconComponentType | string
    count?: string
  }[] = [
    {
      label: "Self Enrol",
      description: `Let all members from ${
        learning.length === 1
          ? learning[0].data?.content.title
          : learning.length === 2
            ? `${learning[0].data?.content.title} and ${learning[1].data?.content.title}`
            : `${learning
                .slice(0, -1)
                .map((l) => l.data?.content.title)
                .join(
                  ", "
                )} and ${learning[learning.length - 1].data?.content.title}`
      } enrol themselves`,
      value: "self",
      icon: RiUserAddLine,
    },
    {
      label: "All",
      description: `Enrol all members from ${
        learning.length === 1
          ? learning[0].data?.content.title
          : learning.length === 2
            ? `${learning[0].data?.content.title} and ${learning[1].data?.content.title}`
            : `${learning
                .slice(0, -1)
                .map((l) => l.data?.content.title)
                .join(
                  ", "
                )} and ${learning[learning.length - 1].data?.content.title}`
      }`,
      value: "all",
      icon: RiGlobalLine,
      count: `Enrol ${communities.reduce((acc, curr) => acc + (curr?.data?.members?.length || 0), 0)} members`,
    },
  ]

  const form = useForm({
    defaultValues: {
      enrolment: "self" as (typeof enrolmentOptions)[number]["value"],
    },
    validators: {
      onSubmit: z.object({
        enrolment: z.enum(
          enrolmentOptions.map((o) => o.value) as [string, ...string[]]
        ),
      }),
      onChange: z.object({
        enrolment: z.enum(
          enrolmentOptions.map((o) => o.value) as [string, ...string[]]
        ),
      }),
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
      navigate({
        to: "/communities/create/course/publish",
        search: {
          communityIds: communityIds,
          content: content,
          enrolmentType: data.value.enrolment as "all" | "self",
        },
      })
    },
  })

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
            name="enrolment"
            children={(field) => (
              <>
                <h1 className="text-pretty text-title-h6 font-normal">
                  Would you like to automatically enrol members into{" "}
                  {learning?.length > 1 ? "these courses" : "this course"}?
                </h1>
                <Radio.Group
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  className={cn(gridVariants({ gap: "xs" }), "")}
                >
                  {enrolmentOptions.map((item) => (
                    <div className="group/radio col-span-12 aspect-video md:col-span-6 xl:col-span-4 xl:aspect-square">
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
                          {typeof item.icon === "string" ? (
                            <Avatar.Image
                              src={item.icon}
                              alt={item.label}
                              className="size-12"
                            />
                          ) : item.icon ? (
                            <item.icon className="size-12 opacity-50" />
                          ) : (
                            <RiCloseCircleLine className="size-12 opacity-50" />
                          )}
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          {typeof item.icon === "string" ? (
                            <Avatar.Image
                              src={item.icon}
                              alt={item.label}
                              className="size-12"
                            />
                          ) : item.icon ? (
                            <item.icon className="size-12 opacity-50" />
                          ) : (
                            <RiCloseCircleLine className="size-12 opacity-50" />
                          )}
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
                  fallback="Select how you would like to enrol members into this course"
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
