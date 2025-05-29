import { useTRPC } from "@/integrations/trpc/react"
import {
  RiArrowRightSLine,
  RiBookLine,
  RiHashtag,
  RiInformationFill,
  RiLoaderLine,
  RiNewsLine,
  RiUserCommunityLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { FancyButton } from "@/components/ui/fancy-button"
import { Label } from "@/components/ui/label"
import { Radio } from "@/components/ui/radio"
import FieldInfo from "@/components/field-info"
import { gridVariants } from "@/components/grid"

export const Route = createFileRoute("/_learner/communities/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { notification } = useNotification()

  const trpc = useTRPC()
  const qc = useQueryClient()
  const me = useQuery(trpc.people.me.queryOptions())

  const navigate = Route.useNavigate()
  const form = useForm({
    defaultValues: {
      type: "",
    },
    validators: {
      onSubmit: z.object({
        type: z.enum(["community", "thread", "article", "course"], {
          message: "Please choose what you want to create",
        }),
      }),
    },
    onSubmitInvalid: (errors) => {
      console.log("errors:::", errors)
      notification({
        title: "Invalid Form",
        description: "Please fill out all fields correctly.",
        variant: "filled",
        status: "error",
      })
    },
    onSubmit: (data) => {
      const id = crypto.randomUUID()
      // switch (data.value.type) {
      //   case "community":
      //     navigate({
      //       to: "/communities/create/$id/community",
      //       params: {
      //         id,
      //       },
      //     })
      //     break
      //   case "course":
      //     navigate({
      //       to: "/communities/create/course",
      //       params: {
      //         id,
      //       },
      //     })
      //     break
      //   default:
      //     notification({
      //       title: "Support coming soon",
      //       description: "We are working on this feature.",
      //       variant: "light",
      //       status: "information",
      //     })
      // }
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
        <div className="h-[calc(100dvh-92px)] w-screen justify-center overflow-x-hidden overflow-y-scroll pt-12 lg:pt-[calc(20dvh+49px)]">
          <div className="gutter mx-auto flex w-full max-w-screen-xl flex-col gap-5 2xl:px-0">
            <h1 className="text-title-h6 font-normal">
              Hi {me.data?.firstName}! What are you creating today?
            </h1>
            <form.Field
              name="type"
              children={(field) => (
                <>
                  <Radio.Group
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value === "course") {
                        qc.prefetchQuery(
                          trpc.communities.adminOf.queryOptions()
                        )
                      }
                      field.handleChange(value)
                    }}
                    className={cn(gridVariants({ gap: "xs" }), "")}
                  >
                    <div className="group/radio col-span-12 aspect-video md:col-span-6 xl:col-span-3 xl:aspect-square">
                      <Radio.Item
                        checked={field.state.value === "community"}
                        className="hidden"
                        value="community"
                        id="community"
                      />
                      <Label.Root
                        htmlFor="community"
                        className={cn([
                          "flex h-full w-full flex-col items-start justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md",
                          "group-has-[[data-state=checked]]/radio:border-primary-base",
                          "group-has-[[data-state=checked]]/radio:shadow-primary-alpha-24",
                        ])}
                      >
                        <Avatar.Root className="hidden sm:flex sm:group-has-[[data-state=checked]]/radio:hidden">
                          <RiUserCommunityLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          <RiUserCommunityLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <div className="flex flex-col gap-1">
                          <p className="text-paragraph-lg font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                            Community
                          </p>
                          <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                            Create a community to share your ideas, projects,
                            and collaborate with others.
                          </p>
                        </div>
                      </Label.Root>
                    </div>

                    <div className="group/radio col-span-12 aspect-video md:col-span-6 xl:col-span-3 xl:aspect-square">
                      <Radio.Item
                        className="hidden"
                        value="course"
                        id="course"
                      />
                      <Label.Root
                        htmlFor="course"
                        className={cn([
                          "flex h-full w-full flex-col items-start justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md",
                          "group-has-[[data-state=checked]]/radio:border-primary-base",
                          "group-has-[[data-state=checked]]/radio:shadow-primary-alpha-24",
                        ])}
                      >
                        <Avatar.Root className="hidden sm:flex sm:group-has-[[data-state=checked]]/radio:hidden">
                          <RiBookLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          <RiBookLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <div className="flex flex-col gap-1">
                          <p className="text-paragraph-lg font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                            Course
                          </p>
                          <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                            Create a course to share your ideas, projects, and
                            collaborate with others.
                          </p>
                        </div>
                      </Label.Root>
                    </div>
                  </Radio.Group>
                  <FieldInfo
                    field={field}
                    fallback="Select the type of content you want to create."
                    fallbackIcon={RiInformationFill}
                  />
                </>
              )}
            />
          </div>
        </div>
        <footer className="gutter fixed inset-x-0 bottom-0 border-t border-bg-soft-200 bg-bg-white-0/80 backdrop-blur-sm 2xl:px-0">
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
