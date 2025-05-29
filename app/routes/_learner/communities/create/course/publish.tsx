import { useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { communityCourseSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import {
  RiArrowRightSLine,
  RiCheckDoubleLine,
  RiGlobalLine,
  RiInformationFill,
  RiLoaderLine,
  RiLockLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import {
  useMutation,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FancyButton } from "@/components/ui/fancy-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Radio } from "@/components/ui/radio"
import { Textarea } from "@/components/ui/textarea"
import FieldInfo from "@/components/field-info"
import { Grid, gridVariants } from "@/components/grid"
import { Section } from "@/components/section"

import { communityTags } from "../$id/community"

export const Route = createFileRoute(
  "/_learner/communities/create/course/publish"
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
    enrolmentType: z.enum(["all", "self"]),
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
    if (!search.enrolmentType) {
      throw redirect({
        to: "/communities/create/course/enrolments",
        search: { communityIds: search.communityIds, content: search.content },
      })
    }
  },
  loaderDeps: ({ search }) => ({
    communityIds: search.communityIds,
    content: search.content,
    enrolmentType: search.enrolmentType,
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
      step: "publish",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { content, communityIds, enrolmentType } = Route.useSearch()

  const { notification } = useNotification()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

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

  const me = useSuspenseQuery(trpc.people.me.queryOptions())

  const createCourses = useMutation(
    trpc.communities.courses.create.mutationOptions()
  )

  const formSchema = z.object({
    courses: z.array(
      communityCourseSchema
        .pick({
          status: true,
          accessibile: true,
          authorUid: true,
          author: true,
          title: true,
          typeUid: true,
          type: true,
          typeAccessor: true,
          enrolments: true,
          publicationUid: true,
        })
        .extend({
          belongsTo: z.array(z.string()),
          tags: z.array(z.string()).min(1, "At least one tag is required"),
          caption: z.string().min(10).max(200),
        })
    ),
  })

  const form = useForm({
    defaultValues: {
      courses: learning?.map((learning, li) => ({
        publicationUid: learning?.data?.publication?.uid ?? "",
        title: learning.data?.content?.title ?? "",
        caption: learning.data?.content?.summary ?? "",
        tags: [],
        status: "published",
        accessibile: "community",
        authorUid: me.data?.uid ?? "",
        author: {
          id: me.data?.uid ?? "",
          name: `${me.data?.firstName} ${me.data?.lastName}`.trim(),
          avatarUrl: me.data?.imageUrl ?? "",
        },
        type: "course",
        typeUid: learning?.data?.uid ?? "",
        typeAccessor: content?.[li]?.type + "s",
        belongsTo: communityIds,
      })),
    } as z.infer<typeof formSchema>,
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
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
      const payload =
        data?.value?.courses.flatMap((c) => {
          const { belongsTo, ...course } = c
          return (
            belongsTo?.map((comId) => {
              const newCourseId = crypto.randomUUID()
              const community = communities.find((c) => c.data?.id === comId)
              return {
                ...course,
                id: newCourseId,
                ...(enrolmentType === "all" &&
                  community?.data?.members &&
                  community?.data?.members?.length && {
                    enrolments: community?.data?.members?.map((m) => {
                      const { joinedAt, role, ...member } = m
                      return {
                        id: crypto.randomUUID(),
                        enrolmentUid: null,
                        publicationUid: course?.publicationUid,
                        courseDocId: newCourseId,
                        enrolleeUid: member.uid!,
                        enrollee: member,
                        createdAt: new Date().toISOString(),
                        authorUid: course?.authorUid,
                        author: course?.author,
                      }
                    }),
                  }),
                communityId: comId,
              }
            }) ?? []
          )
        }) ?? []
      await createCourses.mutateAsync(payload)
      if (communityIds.length === 1) {
        navigate({
          to: "/communities/$id/courses",
          params: {
            id: communityIds[0],
          },
        })
      } else {
        setOpen(true)
      }
    },
  })

  return (
    <>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content>
          <Modal.Header
            icon={RiCheckDoubleLine}
            title="Success"
            description="Your courses has been published successfully. Select which communities you would like to add go to."
          />
          <Modal.Body>
            <div className="space-y-5">
              {communities?.map((c) => {
                const logo = c.data?.images?.find((image) => image.logo)?.url
                return (
                  <Link
                    className="flex items-center gap-3.5 rounded-20 py-3 transition-all hover:bg-bg-weak-50 hover:px-4"
                    to="/communities/$id/courses"
                    params={{
                      id: c.data?.id!,
                    }}
                  >
                    <Avatar.Root size="40">
                      {logo ? <Avatar.Image src={logo} /> : c.data?.name?.[0]}
                    </Avatar.Root>
                    <div className="flex-1 space-y-1">
                      <div className="text-label-sm text-text-strong-950">
                        {c.data?.name}
                      </div>
                      <div className="line-clamp-2 text-paragraph-xs text-text-sub-600">
                        {c.data?.headline}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root size="small" className="w-full" asChild>
              <Link
                to="/communities/$id/courses"
                params={{
                  id: communityIds[0],
                }}
              >
                Done
              </Link>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
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
            <div className="flex flex-col gap-2">
              <h1 className="text-title-h6 font-normal">
                Before publishing your course{content.length > 1 ? "s" : ""}
              </h1>
              <p className="text-label-sm font-normal text-text-soft-400">
                Please review the following details
              </p>
            </div>
            <form.Field
              name="courses"
              mode="array"
              children={(field) => {
                return (
                  <div className="flex flex-col gap-8">
                    {field.state?.value?.map((_, i) => {
                      return (
                        <div
                          className="rounded-20 bg-bg-weak-50 ring-1 ring-stroke-soft-200 drop-shadow-xl"
                          key={learning?.[i]?.data?.uid}
                        >
                          <header className="flex items-center gap-2 px-4 py-3">
                            <form.Subscribe
                              selector={(state) =>
                                state.values?.courses?.[i]?.title
                              }
                              children={(value) => {
                                const course = learning?.[i]?.data
                                return (
                                  <>
                                    <Avatar.Root size="20">
                                      {course?.featureImageUrl ? (
                                        <Avatar.Image
                                          src={course?.featureImageUrl}
                                        />
                                      ) : (
                                        value?.[0]
                                      )}
                                    </Avatar.Root>
                                    {value} Settings
                                  </>
                                )
                              }}
                            />
                          </header>
                          <div className="flex flex-col gap-8 rounded-20 bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200">
                            <form.Field name={`courses[${i}].title`}>
                              {(subField) => {
                                return (
                                  <div className="flex flex-col gap-2">
                                    <Label.Root htmlFor={subField.name}>
                                      Course Name
                                      <Label.Asterisk />
                                      <Label.Sub>
                                        ( Leave this field blank to use the
                                        default course title )
                                      </Label.Sub>
                                    </Label.Root>
                                    <Input.Root>
                                      <Input.Wrapper>
                                        <Input.Field
                                          name={subField.name}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) =>
                                            subField.handleChange(
                                              e.target.value
                                            )
                                          }
                                          value={subField.state.value}
                                          placeholder="Community Name"
                                          type="text"
                                        />
                                      </Input.Wrapper>
                                    </Input.Root>
                                    <FieldInfo
                                      field={subField}
                                      fallback={`This is the name of the course. ${subField?.state?.value !== learning?.[i]?.data?.content?.title ? `Previously: ${learning?.[i]?.data?.content?.title}` : ""}`}
                                      fallbackIcon={RiInformationFill}
                                    />
                                  </div>
                                )
                              }}
                            </form.Field>
                            <form.Field name={`courses[${i}].caption`}>
                              {(subField) => {
                                return (
                                  <div className="flex flex-col gap-2">
                                    <Label.Root htmlFor={subField.name}>
                                      Course Caption
                                      <Label.Asterisk />
                                    </Label.Root>
                                    <Textarea.Root
                                      id={subField.name}
                                      name={subField.name}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      value={subField.state.value}
                                      placeholder={`Describe '${learning?.[i]?.data?.content?.title}' in 1 - 2 sentences`}
                                    >
                                      <Textarea.CharCounter
                                        current={subField.state.value.length}
                                        max={200}
                                      />
                                    </Textarea.Root>

                                    <FieldInfo
                                      field={subField}
                                      fallback="Tell us what the course is about in 1 - 2 sentences."
                                      fallbackIcon={RiInformationFill}
                                    />
                                  </div>
                                )
                              }}
                            </form.Field>
                            <form.Field name={`courses[${i}].accessibile`}>
                              {(subField) => {
                                return (
                                  <div className="flex flex-col gap-2">
                                    <Label.Root>
                                      Course Visibility
                                      <Label.Asterisk />
                                    </Label.Root>
                                    <Radio.Group
                                      id={subField.name}
                                      name={subField.name}
                                      value={subField.state.value}
                                      onValueChange={(value) => {
                                        subField.handleChange(
                                          value as "public" | "community"
                                        )
                                        console.log(value)
                                      }}
                                      className={cn(
                                        gridVariants({ gap: "xs" }),
                                        ""
                                      )}
                                    >
                                      {[
                                        {
                                          label: "Publicly Visible",
                                          value: "public",
                                          description:
                                            "Anyone can view this course",
                                          icon: RiGlobalLine,
                                        },
                                        {
                                          label: "Community Only",
                                          value: "community",
                                          description:
                                            "Only members of the community can view this course",
                                          icon: RiLockLine,
                                        },
                                      ].map((item, index) => (
                                        <div
                                          key={i + index + item.value}
                                          className="group/radio col-span-6 grow"
                                        >
                                          <Radio.Item
                                            checked={
                                              subField.state.value ===
                                              item.value
                                            }
                                            className="hidden"
                                            value={item.value}
                                            id={i + index + item.value}
                                          />
                                          <Label.Root
                                            htmlFor={i + index + item.value}
                                            className={cn([
                                              "flex h-full w-full flex-col items-start gap-1 rounded-20 border border-bg-soft-200 bg-bg-white-0 p-4",
                                              "border-2 border-stroke-soft-200 group-has-[[data-state=checked]]/radio:border-primary-base",
                                              "group-has-[[data-state=checked]]/radio:outline group-has-[[data-state=checked]]/radio:outline-2 group-has-[[data-state=checked]]/radio:outline-offset-1 group-has-[[data-state=checked]]/radio:outline-primary-alpha-24",
                                            ])}
                                          >
                                            <div className="flex items-center gap-2 group-has-[[data-state=checked]]/radio:text-primary-base">
                                              <item.icon className="size-4" />
                                              <p className="text-paragraph-lg font-light">
                                                {item.label}
                                              </p>
                                            </div>
                                            <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                                              {item.description}
                                            </p>
                                          </Label.Root>
                                        </div>
                                      ))}
                                    </Radio.Group>
                                  </div>
                                )
                              }}
                            </form.Field>
                            <form.Field
                              name={`courses[${i}].tags`}
                              mode="array"
                            >
                              {(subField) => {
                                return (
                                  <div className="flex flex-col gap-2">
                                    <Label.Root>Tags</Label.Root>
                                    <FieldInfo
                                      field={subField}
                                      fallback="Select the tags that best describe the course. At least 1 tag is required."
                                      fallbackIcon={RiInformationFill}
                                    />
                                    <Grid className="mt-4" gap="xs">
                                      {communityTags.map((f) => (
                                        <Label.Root className="col-span-4 flex items-center gap-2">
                                          <Checkbox.Root
                                            checked={subField.state.value.includes(
                                              f.title
                                            )}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                subField.pushValue(f.title)
                                              } else {
                                                const index =
                                                  subField.state.value.indexOf(
                                                    f.title
                                                  )
                                                if (index !== -1) {
                                                  subField.removeValue(index)
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
                            </form.Field>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </div>
        </Section>
        <footer className="bg-bg-white-0/80backdrop-blur-sm gutter fixed inset-x-0 bottom-0 border-t border-bg-soft-200 2xl:px-0">
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
                    Publish
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
