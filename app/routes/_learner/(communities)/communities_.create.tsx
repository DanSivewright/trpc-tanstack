import { useState } from "react"
import { storage } from "@/integrations/firebase/client"
import { useTRPC } from "@/integrations/trpc/react"
import { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { paletteSchema } from "@/integrations/trpc/routers/palette/schemas/palette-schema"
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiAwardLine,
  RiBook2Line,
  RiBriefcaseLine,
  RiBuildingLine,
  RiCameraLine,
  RiChat1Line,
  RiClockwiseLine,
  RiComputerLine,
  RiGlobalLine,
  RiGlobeLine,
  RiHammerLine,
  RiHeartLine,
  RiHomeSmile2Line,
  RiInfinityLine,
  RiInformationFill,
  RiKanbanView,
  RiLoaderLine,
  RiMusic2Line,
  RiPaletteLine,
  RiPencilLine,
  RiTranslate,
  RiUploadCloud2Line,
  RiUserLine,
  RiUserStarLine,
  RiVideoLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useForm, type AnyFieldApi } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useNotification } from "@/hooks/use-notification"
import * as Avatar from "@/components/ui/avatar"
import * as Breadcrumb from "@/components/ui/breadcrumb"
import * as Button from "@/components/ui/button"
import * as Checkbox from "@/components/ui/checkbox"
import * as FancyButton from "@/components/ui/fancy-button"
import * as FileUpload from "@/components/ui/file-upload"
import * as Hint from "@/components/ui/hint"
import * as Input from "@/components/ui/input"
import * as Label from "@/components/ui/label"
import * as Radio from "@/components/ui/radio"
import * as Textarea from "@/components/ui/textarea"
import { Grid, gridVariants } from "@/components/grid"
import Image from "@/components/image"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { notification } = useNotification()

  const [files, setFiles] = useState<File[]>([])

  const schema = communitySchema.pick({
    name: true,
    headline: true,
    tags: true,
  })

  const trpc = useTRPC()

  const createCommunity = useMutation(trpc.communities.create.mutationOptions())
  const qc = useQueryClient()
  const navigate = Route.useNavigate()

  const form = useForm({
    defaultValues: {
      name: "",
      headline: import.meta.env.DEV
        ? "This is the community headline of the stuff that I want you to read at a glance when you first come across my community"
        : "",
      tags: [],
    } as z.infer<typeof schema>,
    validators: {
      onChange: schema,
    },
    // onSubmitInvalid: (errors) => {
    //   console.log("errors:::", errors)
    //   notification({
    //     title: "Invalid Form",
    //     description: "Please fill out all fields correctly.",
    //     variant: "filled",
    //     status: "error",
    //   })
    // },
    onSubmit: async (data) => {
      const id = crypto.randomUUID()
      const [feature, logo] = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `communities/${id}/${file.name}`)
          const uploadTask = await uploadBytes(storageRef, file)
          const url = await getDownloadURL(uploadTask.ref)
          return url
        })
      )
      const palette = (await qc.ensureQueryData(
        trpc.palette.get.queryOptions({
          url: feature,
        })
      )) as z.infer<typeof paletteSchema>
      await createCommunity.mutateAsync(
        {
          id,
          name: data.value.name,
          headline: data.value.headline,
          tags: data.value.tags,
          featureImageUrl: feature,
          featureImagePath: `communities/${id}/${files[0].name}`,
          logoUrl: logo,
          logoPath: `communities/${id}/${files[1].name}`,
          meta: {
            colors: palette,
          },
        },
        {
          onSettled: () => {
            qc.invalidateQueries({
              queryKey: trpc.communities.all.queryKey(),
            })
            qc.invalidateQueries({
              queryKey: trpc.communities.joined.queryKey(),
            })
          },
          onSuccess: () => {
            navigate({
              to: "/communities/$id/about",
              params: {
                id,
              },
            })
          },
        }
      )
    },
  })

  const filters: {
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

  const me = useQuery(trpc.people.me.queryOptions())

  return (
    <>
      <NavigationLearnerSubHeader
        hideBreadcrumbs
        mode="light"
        className="border-b border-bg-soft-200"
      >
        <div className="flex h-12 w-full items-center justify-between">
          <Breadcrumb.Root>
            <Breadcrumb.Item>
              <Breadcrumb.Icon as={RiHomeSmile2Line} />
            </Breadcrumb.Item>
            <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
            <Breadcrumb.Item active>Create</Breadcrumb.Item>
          </Breadcrumb.Root>
        </div>
      </NavigationLearnerSubHeader>
      <div className="h-[calc(100dvh-92px)] w-screen justify-center overflow-x-hidden overflow-y-scroll pt-[30dvh]">
        <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-5">
          <h1 className="text-title-h6 font-normal">
            Hi {me.data?.firstName}! What are you creating today?
          </h1>
          <Radio.Group className={cn(gridVariants({ gap: "xs" }), "")}>
            <Label.Root className="col-span-3 flex aspect-square flex-col justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md">
              <Radio.Item value="community" />
              {/* <Avatar.Root placeholderType="company"></Avatar.Root> */}
              <div className="flex flex-col gap-1">
                <p className="text-paragraph-lg font-light">Community</p>
                <p className="text-paragraph-xs text-text-soft-400">
                  Create a community to share your ideas, projects, and
                  collaborate with others.
                </p>
              </div>
            </Label.Root>
            <Label.Root className="col-span-3 flex aspect-square flex-col justify-between rounded-20 border border-bg-soft-200 bg-bg-white-0 p-6 shadow-regular-md data-[state=checked]:bg-red-400">
              <Radio.Item value="thread" className="" />
              {/* <Avatar.Root placeholderType="company"></Avatar.Root> */}
              <div className="flex flex-col gap-1">
                <p className="text-paragraph-lg font-light">Thread</p>
                <p className="text-paragraph-xs text-text-soft-400">
                  Create a community to share your ideas, projects, and
                  collaborate with others.
                </p>
              </div>
            </Label.Root>
          </Radio.Group>
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
