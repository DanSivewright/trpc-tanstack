import { useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import {
  RiArrowRightSLine,
  RiBookLine,
  RiHashtag,
  RiInformationFill,
  RiLoaderLine,
  RiNewsLine,
  RiUserCommunityLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useForm, type AnyFieldApi } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useNotification } from "@/hooks/use-notification"
import * as Avatar from "@/components/ui/avatar"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Hint from "@/components/ui/hint"
import * as Label from "@/components/ui/label"
import * as Radio from "@/components/ui/radio"
import { gridVariants } from "@/components/grid"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { notification } = useNotification()

  const trpc = useTRPC()
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
      navigate({
        to: `/communities/create/${data.value.type}/$id`,
        params: {
          id,
        },
      })
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
                    onValueChange={(value) => field.handleChange(value)}
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
                        value="thread"
                        id="thread"
                      />
                      <Label.Root
                        htmlFor="thread"
                        className={cn([
                          "flex h-full w-full flex-col items-start justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md",
                          "group-has-[[data-state=checked]]/radio:border-primary-base",
                          "group-has-[[data-state=checked]]/radio:shadow-primary-alpha-24",
                        ])}
                      >
                        <Avatar.Root className="hidden sm:flex sm:group-has-[[data-state=checked]]/radio:hidden">
                          <RiHashtag className="size-12 opacity-50" />
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          <RiHashtag className="size-12 opacity-50" />
                        </Avatar.Root>
                        <div className="flex flex-col gap-1">
                          <p className="text-paragraph-lg font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                            Thread
                          </p>
                          <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                            Create a thread to share your ideas, projects, and
                            collaborate with others.
                          </p>
                        </div>
                      </Label.Root>
                    </div>
                    <div className="group/radio col-span-12 aspect-video md:col-span-6 xl:col-span-3 xl:aspect-square">
                      <Radio.Item
                        className="hidden"
                        value="article"
                        id="article"
                      />
                      <Label.Root
                        htmlFor="article"
                        className={cn([
                          "flex h-full w-full flex-col items-start justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md",
                          "group-has-[[data-state=checked]]/radio:border-primary-base",
                          "group-has-[[data-state=checked]]/radio:shadow-primary-alpha-24",
                        ])}
                      >
                        <Avatar.Root className="hidden sm:flex sm:group-has-[[data-state=checked]]/radio:hidden">
                          <RiNewsLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <Avatar.Root
                          className="hidden sm:hidden sm:group-has-[[data-state=checked]]/radio:flex"
                          color="blue"
                        >
                          <RiNewsLine className="size-12 opacity-50" />
                        </Avatar.Root>
                        <div className="flex flex-col gap-1">
                          <p className="text-paragraph-lg font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                            Article
                          </p>
                          <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                            Create an article to share your ideas, projects, and
                            collaborate with others.
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

          {/* <Section className="mx-auto flex w-full max-w-screen-md flex-col">
        <h1 className="text-title-h1 font-normal">Create Community</h1>
        <Image
          path="/communities/9deedec6-0d0e-43fa-838f-6e9548274b20"
          width={100}
          height={100}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-8"
        >
          <form.Field
            name="name"
            children={(field) => {
              return (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="email">
                    Name
                    <Label.Asterisk />
                  </Label.Root>

                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Icon as={RiGlobalLine} />
                      <Input.Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Community"
                      />
                    </Input.Wrapper>
                  </Input.Root>

                  <FieldInfo
                    field={field}
                    fallback="This is the name of the community. Pick a good one!"
                    fallbackIcon={RiInformationFill}
                  />
                </div>
              )
            }}
          />
          <form.Field
            name="headline"
            children={(field) => {
              return (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="email">
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
              )
            }}
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
                    {filters.map((f) => (
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
          <FileUpload.Root
            files={files}
            setFiles={setFiles}
            fileTypes={["images"]}
            maxFiles={2}
          >
            <input multiple type="file" tabIndex={-1} className="hidden" />
            <FileUpload.Icon as={RiUploadCloud2Line} />

            <div className="space-y-1.5">
              <div className="text-label-sm text-text-strong-950">
                Choose your feature image and logo and drop it here
              </div>
              <div className="text-paragraph-xs text-text-sub-600">
                Only images are supported.
              </div>
            </div>
            <FileUpload.Button>Browse File</FileUpload.Button>
          </FileUpload.Root>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <FancyButton.Root type="submit" disabled={!canSubmit}>
                Submit
                <FancyButton.Icon
                  className={cn(isSubmitting && "animate-spin")}
                  as={isSubmitting ? RiLoaderLine : RiArrowRightLine}
                />
              </FancyButton.Root>
            )}
          />
        </form>
      </Section> */}
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
    </>
  )
}

function FieldInfo({
  field,
  fallback,
  fallbackIcon,
}: {
  field: AnyFieldApi
  fallback?: string
  fallbackIcon?: RemixiconComponentType
}) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <Hint.Root hasError>
          <Hint.Icon as={RiInformationFill} />
          {field.state.meta.errors.map((err) => err.message).join(",")}
        </Hint.Root>
      ) : fallback ? (
        <Hint.Root>
          {fallbackIcon && <Hint.Icon as={fallbackIcon} />}
          {fallback}
        </Hint.Root>
      ) : null}
    </>
  )
}
