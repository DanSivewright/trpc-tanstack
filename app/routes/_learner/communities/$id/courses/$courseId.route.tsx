import { Suspense, useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { communityCourseSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { faker } from "@faker-js/faker"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiBookmarkLine,
  RiCalendarLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiErrorWarningFill,
  RiEyeLine,
  RiGlobalLine,
  RiGroupLine,
  RiInformationFill,
  RiLayoutGridLine,
  RiLoaderLine,
  RiLockLine,
  RiMoreLine,
  RiSettings2Line,
} from "@remixicon/react"
import { useForm, useStore } from "@tanstack/react-form"
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  retainSearchParams,
  stripSearchParams,
  useLocation,
} from "@tanstack/react-router"
import { isBefore } from "date-fns"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CompactButton } from "@/components/ui/compact-button"
import * as Datepicker from "@/components/ui/datepicker"
import { Divider } from "@/components/ui/divider"
import { Drawer } from "@/components/ui/drawer"
import { Dropdown } from "@/components/ui/dropdown"
import { FancyButton } from "@/components/ui/fancy-button"
import * as FileFormatIcon from "@/components/ui/file-format-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Radio } from "@/components/ui/radio"
import { StarRating } from "@/components/ui/svg-rating-icons"
import { Switch } from "@/components/ui/switch"
import { TabMenuHorizontal } from "@/components/ui/tab-menu-horizontal"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip } from "@/components/ui/tooltip"
import FieldInfo from "@/components/field-info"
import { Grid, gridVariants } from "@/components/grid"
import Image from "@/components/image"
import VerifiedIcon from "@/components/verified-icon"

import { communityTags } from "../../create/$id/community"

const searchDefaultValues = {
  replyToCommentId: "",
  replyContent: "",
}
export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId"
)({
  validateSearch: z.object({
    type: z.string(),
    typeUid: z.string(),
    settingsOpen: z.boolean().default(false),
    deleteCourseOpen: z.boolean().default(false),
    replyToCommentId: z.string().default(searchDefaultValues.replyToCommentId),
    replyContent: z.string().default(searchDefaultValues.replyContent),
  }),
  loaderDeps: ({ search }) => ({
    type: search.type,
    typeUid: search.typeUid,
  }),
  search: {
    middlewares: [
      retainSearchParams(true),
      stripSearchParams(searchDefaultValues),
    ],
  },
  beforeLoad: ({ search, params }) => {
    if (!search.type || !search.typeUid) {
      throw redirect({
        to: "/communities/$id/courses",
        params: {
          id: params.id,
        },
      })
    }
  },
  loader: async ({ context, deps, params: { id, courseId } }) => {
    context.queryClient.prefetchQuery(
      context.trpc.communities.courseDetail.queryOptions({
        communityId: id,
        courseId,
      })
    )
    context.queryClient.prefetchQuery(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    context.queryClient.prefetchQuery(
      context.trpc.content.modules.queryOptions({
        params: {
          type: deps.type,
          typeUid: deps.typeUid,
        },
      })
    )
  },
  component: RouteComponent,
})
function RouteComponent() {
  const params = Route.useParams()
  const trpc = useTRPC()
  const location = useLocation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { notification } = useNotification()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: params.id,
    })
  )

  const picks = useMemo(
    () =>
      Array.from({ length: 2 }, () => ({
        id: faker.string.uuid(),
        author: {
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
        },
        category: faker.helpers.arrayElement([
          "Technology",
          "Science",
          "Business",
          "Health",
          "Environment",
        ]),
        title: faker.lorem.sentence(),
        date: faker.date.recent(),
        readTime: faker.number.int({ min: 1, max: 10 }),
        likes: faker.number.int({ min: 0, max: 1000 }),
      })),
    []
  )

  const resources = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
        title: faker.book.title(),
        status: faker.helpers.shuffle(["PDF", "DOC"])[0],
        color: faker.helpers.shuffle([
          "red",
          "orange",
          "sky",
          "blue",
          "green",
          "yellow",
          "purple",
          "pink",
        ])[0],
        date: faker.date.recent(),
      })),
    []
  )

  return (
    <>
      <CourseSettings />
      <DeleteCourseModal />
      <Suspense
        fallback={
          <div className="h-[500px] w-full animate-pulse bg-bg-soft-200" />
        }
      >
        <CourseHeader />
      </Suspense>
      <div className="sticky top-12 z-10 border-b border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="mx-auto flex max-w-screen-lg items-center justify-between gap-8 px-8 xl:px-0">
          <TabMenuHorizontal.Root className="" defaultValue={location.pathname}>
            <TabMenuHorizontal.List className="border-none">
              <TabMenuHorizontal.Trigger
                value={`/communities/${params.id}/courses/${params.courseId}`}
                asChild
              >
                <Link
                  to="/communities/$id/courses/$courseId"
                  params={params}
                  search={search}
                  resetScroll={false}
                  preload="intent"
                >
                  <TabMenuHorizontal.Icon as={RiLayoutGridLine} />
                  Overview
                </Link>
              </TabMenuHorizontal.Trigger>
              <TabMenuHorizontal.Trigger
                value={`/communities/${params.id}/courses/${params.courseId}/enrolments`}
                asChild
              >
                <Link
                  disabled={course?.isLoading}
                  to="/communities/$id/courses/$courseId/enrolments"
                  params={params}
                  resetScroll={false}
                  search={search}
                  preload="intent"
                >
                  <TabMenuHorizontal.Icon as={RiGroupLine} />
                  Enrolments
                </Link>
              </TabMenuHorizontal.Trigger>
            </TabMenuHorizontal.List>
          </TabMenuHorizontal.Root>
          <div className="flex items-center">
            {community?.data?.membership?.role === "admin" && (
              <Dropdown.Root>
                <Dropdown.Trigger>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <CompactButton.Root>
                        <CompactButton.Icon as={RiMoreLine} />
                      </CompactButton.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content side="bottom">
                      <p>Course Settings</p>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Dropdown.Trigger>
                <Dropdown.Content align="start">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar.Root color="sky" size="40">
                      {community?.data?.membership?.avatarUrl ? (
                        <Avatar.Image
                          src={community?.data?.membership?.avatarUrl}
                        />
                      ) : (
                        community?.data?.membership?.firstName?.[0]
                      )}
                      <Avatar.Indicator position="top">
                        <VerifiedIcon />
                      </Avatar.Indicator>
                    </Avatar.Root>
                    <div className="flex-1">
                      <div className="text-label-sm text-text-strong-950">
                        {community?.data?.membership?.firstName}{" "}
                        {community?.data?.membership?.lastName}
                      </div>
                      <div className="mt-1 text-paragraph-xs text-text-sub-600">
                        {community?.data?.membership?.email}
                      </div>
                    </div>
                    <Badge.Root variant="light" color="green" size="small">
                      Admin
                    </Badge.Root>
                  </div>

                  <Dropdown.Group>
                    <Dropdown.Item
                      onClick={() => {
                        notification({
                          title: "Coming Soon",
                          description: "This feature is coming soon.",
                          variant: "light",
                          status: "information",
                        })
                      }}
                    >
                      <Dropdown.ItemIcon as={RiLayoutGridLine} />
                      Go to Admin
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        navigate({
                          resetScroll: false,
                          search: (prev) => ({
                            ...prev,
                            settingsOpen: true,
                          }),
                        })
                      }}
                    >
                      <Dropdown.ItemIcon as={RiSettings2Line} />
                      Course Settings
                    </Dropdown.Item>
                    <Dropdown.Item asChild>
                      <Link
                        search={{
                          communityIds: [params.id],
                        }}
                        to="/communities/create/course/select-courses"
                      >
                        <Dropdown.ItemIcon as={RiAddLine} />
                        Add New Course
                      </Link>
                    </Dropdown.Item>
                  </Dropdown.Group>
                  <Divider.Root variant="line-spacing" />
                  <Dropdown.Group>
                    <Dropdown.Item
                      className="bg-error-lighter text-error-dark"
                      onClick={() => {
                        navigate({
                          resetScroll: false,
                          search: (prev) => ({
                            ...prev,
                            deleteCourseOpen: true,
                          }),
                        })
                      }}
                    >
                      <Dropdown.ItemIcon as={RiDeleteBinLine} />
                      Delete Course
                    </Dropdown.Item>
                  </Dropdown.Group>
                </Dropdown.Content>
              </Dropdown.Root>
            )}
          </div>
        </div>
      </div>
      <Grid
        gap="none"
        className="mx-auto mt-8 max-w-screen-lg gap-8 px-8 xl:px-0"
      >
        <div className="col-span-9">
          <Outlet />
        </div>
        <div className="col-span-3 flex flex-col gap-7">
          <div className="flex flex-col gap-5">
            <h2 className="text-title-h6 font-normal">Currated Picks</h2>

            {picks.map((pick, i) => (
              <article
                key={pick.id}
                className={cn("flex flex-col gap-1.5 pb-5", {
                  "border-b border-stroke-soft-200": i < picks.length - 1,
                })}
              >
                <div className="flex items-start gap-2">
                  <Avatar.Root size="20">
                    <Avatar.Image src={pick.author.avatar} />
                  </Avatar.Root>
                  <p className="pt-0.5 text-label-xs font-light text-text-soft-400">
                    {pick.author.name} • {pick.category}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <p className="text-label-sm font-light text-text-strong-950">
                    {pick.title}
                  </p>
                  <div className="aspect-video h-12 rounded-xl">
                    <Image
                      path={`${i + 1}.webp`}
                      alt={pick.title}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-label-xs font-light text-text-soft-400">
                      <RiCalendarLine className="size-5" />
                      {pick.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-label-xs font-light text-text-soft-400">
                      <RiEyeLine className="size-5" />
                      {pick.readTime} Min Read
                    </span>
                  </div>
                  <RiBookmarkLine className="size-5 text-text-soft-400" />
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-label-md font-normal">Enrolled Members</h2>
            <ul className="flex flex-wrap items-center gap-1">
              {community.data?.members?.map((m, i) => (
                <Tooltip.Root delayDuration={10} key={m.id}>
                  <Tooltip.Trigger asChild>
                    <Avatar.Root size="32">
                      {m.avatarUrl ? (
                        <Avatar.Image src={m.avatarUrl ?? undefined} />
                      ) : (
                        m.firstName?.[0]
                      )}
                      {i === 1 && (
                        <Avatar.Indicator position="top">
                          <VerifiedIcon />
                        </Avatar.Indicator>
                      )}
                    </Avatar.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>
                      {m.firstName} {m.lastName}
                    </p>
                  </Tooltip.Content>
                </Tooltip.Root>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-label-md font-normal">Resources</h2>
            <ul className="flex flex-col gap-2">
              {resources.map((r) => (
                <li
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-10 py-2 transition-all hover:bg-bg-weak-50 hover:px-3"
                  key={r.id}
                >
                  <div className="flex items-center gap-2">
                    <FileFormatIcon.Root
                      size="small"
                      format={r.status}
                      color={r.color}
                    />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-label-sm font-light text-text-sub-600">
                        {r.title}
                      </p>
                      <p className="text-label-xs font-light text-text-soft-400">
                        {r.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <RiDownloadLine className="size-4 text-text-soft-400" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Grid>
    </>
  )
}

function CourseHeader() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const trpc = useTRPC()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const modules = useSuspenseQuery({
    ...trpc.content.modules.queryOptions({
      params: {
        type: search.type,
        typeUid: search.typeUid,
      },
    }),
  })
  const badges = useMemo(() => {
    return modules?.data?.filter((m: any) => m?.badge?.uid).length
  }, [modules?.data])

  return (
    <header className="relative h-[500px] w-full">
      {course.data.content?.featureImageUrl ? (
        <img
          src={course.data.content?.featureImageUrl || undefined}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          alt={course.data.title + " featured image"}
        />
      ) : (
        <div className="absolute inset-0 z-0 h-full w-full bg-primary-darker" />
      )}
      <div className="absolute bottom-0 left-1/2 top-0 z-10 flex w-full max-w-screen-lg -translate-x-1/2 items-end px-8 pb-12 xl:px-0">
        <div className="flex w-full items-end justify-between">
          <div className="flex w-3/4 flex-col gap-2">
            <div className="flex items-center gap-5">
              {course.data?.enrolments &&
                course.data?.enrolments.length > 0 && (
                  <>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <AvatarGroupCompact.Root size="24">
                          <AvatarGroupCompact.Stack>
                            {course.data?.enrolments
                              ?.slice(0, 3)
                              .map((enrolment) => (
                                <Avatar.Root color="sky">
                                  {enrolment.enrollee.avatarUrl ? (
                                    <Avatar.Image
                                      src={enrolment.enrollee.avatarUrl}
                                    />
                                  ) : (
                                    enrolment?.enrollee?.firstName?.[0]
                                  )}
                                </Avatar.Root>
                              ))}
                          </AvatarGroupCompact.Stack>
                          {course.data?.enrolments.length > 3 && (
                            <AvatarGroupCompact.Overflow>
                              +{course.data?.enrolments.length - 3}
                            </AvatarGroupCompact.Overflow>
                          )}
                        </AvatarGroupCompact.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Community Enrolments</Tooltip.Content>
                    </Tooltip.Root>
                    <div className="h-4 w-px rotate-12 bg-white opacity-45"></div>
                  </>
                )}

              <div className="flex items-center gap-2">
                <StarRating rating={4.5} />
                <span className="pt-1 text-paragraph-xs text-white">
                  4.5 ∙ 5.2K Ratings
                </span>
              </div>
            </div>
            <h1 className="text-pretty text-title-h2 text-white">
              {course.data.title}
            </h1>
            <p className="text-label-md text-white opacity-70">
              {course.data.caption}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Badge.Root
                    className="capitalize"
                    color={badges === 0 ? "red" : "blue"}
                    variant="filled"
                  >
                    Earns:
                    {modules?.isLoading ? (
                      <Badge.Icon className="animate-spin" as={RiLoaderLine} />
                    ) : (
                      <> {badges === 0 ? "No" : badges} </>
                    )}
                    Badge{badges === 1 ? "" : "s"}
                  </Badge.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Badges</Tooltip.Content>
              </Tooltip.Root>
              {course.data?.tags?.map((tag) => (
                <Badge.Root className="capitalize" key={tag}>
                  {tag}
                </Badge.Root>
              ))}
            </div>
          </div>
          <div className="flex w-1/4 items-center gap-2">
            <CourseEnrolmentButton />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-0 h-[85%] bg-gradient-to-t from-black to-transparent"></div>
    </header>
  )
}

function CourseSettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { notification } = useNotification()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )

  const updateCourse = useMutation({
    ...trpc.communities.updateCourse.mutationOptions(),
    // @ts-ignore
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
      })

      const previousCourse = queryClient.getQueryData(
        trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey
      )!

      const update = {
        ...previousCourse,
        ...newCourse,
      }

      queryClient.setQueryData(
        trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
        update
      )
      return { previousCourse }
    },
    onError: (_, previousCourse) => {
      queryClient.setQueryData(
        trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
        // @ts-ignore
        previousCourse
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courses.queryOptions({
          communityId: params.id,
        }).queryKey,
      })
    },
  })

  const formSchema = communityCourseSchema
    .pick({
      id: true,
      status: true,
      accessibile: true,
      title: true,
      tags: true,
      caption: true,
      communityId: true,
      isFeatured: true,
      isFeaturedUntil: true,
    })
    .extend({
      tags: z.array(z.string()).min(1, "At least one tag is required"),
      title: z.string().min(1, "Title is required"),
      caption: z.string().min(10).max(200),
    })

  const form = useForm({
    defaultValues: {
      communityId: course.data?.communityId,
      id: course.data?.id,
      status: course.data?.status,
      accessibile: course.data?.accessibile,
      title: course.data?.title,
      tags: course.data?.tags,
      caption: course.data?.caption,
      isFeatured: course.data?.isFeatured,
      isFeaturedUntil: course.data?.isFeaturedUntil,
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
    onSubmit: async (args) => {
      if (!args.formApi.state.isDirty) {
        navigate({
          resetScroll: false,
          search: (prev) => ({
            ...prev,
            settingsOpen: false,
          }),
        })
        return
      }

      if (
        args.value.isFeatured &&
        args.value.isFeaturedUntil &&
        isBefore(new Date(args.value.isFeaturedUntil), new Date())
      ) {
        notification({
          title: "Invalid Date",
          description: "Featured until date must be in the future.",
          variant: "filled",
          status: "error",
        })
        return
      }

      await updateCourse.mutateAsync(args.value)
      navigate({
        resetScroll: false,
        search: (prev) => ({
          ...prev,
          settingsOpen: false,
        }),
      })
    },
  })

  const watchedTitle = useStore(form.store, (state) => state.values.title)
  const watchedAccessibile = useStore(
    form.store,
    (state) => state.values.accessibile
  )
  const watchedStatus = useStore(form.store, (state) => state.values.status)

  return (
    <Drawer.Root
      open={search.settingsOpen}
      onOpenChange={(open) => {
        console.log(open)
        navigate({
          resetScroll: false,
          search: (prev) => ({
            ...prev,
            settingsOpen: open,
          }),
        })
      }}
    >
      <Drawer.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <Drawer.Header>
            <Drawer.Title>Course Settings</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-4 pb-12">
            <Divider.Root variant="solid-text">Settings</Divider.Root>

            <div className="flex flex-col gap-8 px-4">
              <form.Field name="status">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root
                        htmlFor={field.name}
                        className={cn(
                          "flex items-center justify-between rounded-10 bg-bg-weak-50 p-3",
                          {
                            "bg-primary-alpha-24":
                              field.state.value === "published",
                          }
                        )}
                      >
                        <p>
                          <span className="font-normal opacity-70">
                            Status:{" "}
                          </span>
                          {field.state.value}
                        </p>
                        <Switch.Root
                          id={field.name}
                          name={field.name}
                          checked={field.state.value === "published"}
                          onCheckedChange={(value) => {
                            field.handleChange(value ? "published" : "draft")
                          }}
                        />
                      </Label.Root>
                      <FieldInfo
                        field={field}
                        fallback={
                          watchedStatus === "draft" &&
                          course.data?.status === "published"
                            ? "This course will be hidden but all enrolments will stay enrolled."
                            : `This course will be published and visible to members${
                                watchedAccessibile === "community"
                                  ? " only."
                                  : " and the public."
                              }`
                        }
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              <form.Field name="isFeatured">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root
                        htmlFor={field.name}
                        className={cn(
                          "flex items-center justify-between rounded-10 bg-bg-weak-50 p-3",
                          {
                            "bg-primary-alpha-24": field.state.value,
                          }
                        )}
                      >
                        <p>
                          <span className="font-normal opacity-70">
                            Featured:{" "}
                          </span>
                          {field.state.value ? "Yes" : "No"}
                        </p>
                        <Switch.Root
                          id={field.name}
                          name={field.name}
                          checked={field.state.value ?? false}
                          onCheckedChange={(value) => {
                            field.handleChange(value)
                          }}
                        />
                      </Label.Root>

                      {field.state.value && (
                        <form.Field name="isFeaturedUntil">
                          {(subField) => {
                            return (
                              <div className="flex w-full flex-col items-center justify-center gap-2">
                                <Datepicker.Calendar
                                  disabled={{
                                    before: new Date(),
                                  }}
                                  style={{
                                    padding: 0,
                                  }}
                                  selected={
                                    subField.state.value
                                      ? new Date(subField.state.value)
                                      : undefined
                                  }
                                  mode="single"
                                  onSelect={(date) => {
                                    subField.handleChange(date?.toISOString())
                                  }}
                                />
                              </div>
                            )
                          }}
                        </form.Field>
                      )}
                      <FieldInfo
                        field={field}
                        // fallback={
                        //   watchedStatus === "draft" &&
                        //   course.data?.status === "published"
                        //     ? "This course will be hidden but all enrolments will stay enrolled."
                        //     : `This course will be published and visible to members${
                        //         watchedAccessibile === "community"
                        //           ? " only."
                        //           : " and the public."
                        //       }`
                        // }
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              {/* <form.Subscribe selector={(state) => state.values.isFeatured}>
                {(isFeatured) =>
                  !!isFeatured && (
                    <form.Field name="isFeaturedUntil">
                      {(field) => {
                        return (
                          <div className="flex flex-col gap-2">
                            <Datepicker.Calendar
                              className="w-full"
                              selected={
                                field.state.value
                                  ? new Date(field.state.value)
                                  : undefined
                              }
                              mode="single"
                              onSelect={(date) => {
                                field.handleChange(date?.toISOString())
                              }}
                            />
                          </div>
                        )
                      }}
                    </form.Field>
                  )
                }
              </form.Subscribe> */}

              <form.Field name="title">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root htmlFor={field.name}>
                        Course Name
                        <Label.Asterisk />
                      </Label.Root>
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Field
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                            placeholder="Community Name"
                            type="text"
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      <FieldInfo
                        field={field}
                        fallback={`This is the name of the course. ${field?.state?.value !== course?.data?.title ? `Previously: ${course?.data?.title}` : ""}`}
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              <form.Field name="caption">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root htmlFor={field.name}>
                        Course Caption
                        <Label.Asterisk />
                      </Label.Root>
                      <Textarea.Root
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        value={field.state.value}
                        placeholder={`Describe '${watchedTitle}' in 1 - 2 sentences`}
                        rows={7}
                      >
                        <Textarea.CharCounter
                          current={field.state.value.length}
                          max={200}
                        />
                      </Textarea.Root>

                      <FieldInfo
                        field={field}
                        fallback="Tell us what the course is about in 1 - 2 sentences."
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              <form.Field name="accessibile">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root>
                        Course Visibility
                        <Label.Asterisk />
                      </Label.Root>
                      <Radio.Group
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value as "public" | "community")
                          console.log(value)
                        }}
                        className={cn(gridVariants({ gap: "xs" }), "")}
                      >
                        {[
                          {
                            label: "Publicly Visible",
                            value: "public",
                            description: "Anyone can view this course",
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
                            key={index + item.value}
                            className="group/radio col-span-6 grow"
                          >
                            <Radio.Item
                              checked={field.state.value === item.value}
                              className="hidden"
                              value={item.value}
                              id={index + item.value}
                            />
                            <Label.Root
                              htmlFor={index + item.value}
                              className={cn([
                                "flex h-full w-full flex-col items-start gap-1 rounded-20 border border-bg-soft-200 bg-bg-white-0 p-4",
                                "border-2 border-stroke-soft-200 group-has-[[data-state=checked]]/radio:border-primary-base",
                                "group-has-[[data-state=checked]]/radio:outline group-has-[[data-state=checked]]/radio:outline-2 group-has-[[data-state=checked]]/radio:outline-offset-1 group-has-[[data-state=checked]]/radio:outline-primary-alpha-24",
                              ])}
                            >
                              <p className="text-paragraph-md font-light group-has-[[data-state=checked]]/radio:text-primary-base">
                                {item.label}
                              </p>
                              <p className="text-paragraph-xs text-text-soft-400 group-has-[[data-state=checked]]/radio:border-primary-alpha-24">
                                {item.description}
                              </p>
                            </Label.Root>
                          </div>
                        ))}
                      </Radio.Group>

                      <FieldInfo
                        field={field}
                        // fallback="All members already enrolled will stay enrolled."
                        fallback={
                          watchedAccessibile === "community" &&
                          course.data?.accessibile === "public"
                            ? "All public enrolments will stay enrolled."
                            : "All members already enrolled will stay enrolled."
                        }
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              <form.Field name="tags" mode="array">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root>Tags</Label.Root>
                      <FieldInfo
                        field={field}
                        fallback="Select the tags that best describe the course. At least 1 tag is required."
                        fallbackIcon={RiInformationFill}
                      />
                      <Grid className="mt-4" gap="xs">
                        {communityTags.map((f) => (
                          <Label.Root className="col-span-6 flex items-center gap-2">
                            <Checkbox.Root
                              checked={field.state.value.includes(f.title)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.pushValue(f.title)
                                } else {
                                  const index = field.state.value.indexOf(
                                    f.title
                                  )
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
              </form.Field>
            </div>
          </Drawer.Body>

          <Drawer.Footer className="sticky bottom-0 z-10 border-t bg-bg-white-0">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <FancyButton.Root
                  variant="primary"
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  Save Changes
                  <FancyButton.Icon
                    className={cn(isSubmitting && "animate-spin")}
                    as={isSubmitting ? RiLoaderLine : RiArrowRightSLine}
                  />
                </FancyButton.Root>
              )}
            />
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  )
}

function DeleteCourseModal() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const deleteCourse = useMutation({
    ...trpc.communities.deleteCourse.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courses.queryOptions({
          communityId: params.id,
        }).queryKey,
      })
      navigate({
        to: "/communities/$id/courses",
        params: {
          id: params.id,
        },
      })
    },
  })

  return (
    <Modal.Root
      open={search.deleteCourseOpen}
      onOpenChange={(open) => {
        console.log(open)
        navigate({
          resetScroll: false,
          search: (prev) => ({
            ...prev,
            deleteCourseOpen: open,
          }),
        })
      }}
    >
      <Modal.Content className="max-w-[440px]">
        <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-error-lighter">
            <RiErrorWarningFill className="size-6 text-error-base" />
          </div>
          <div className="space-y-1">
            <div className="text-label-md text-text-strong-950">
              Delete Course
            </div>
            <div className="text-paragraph-sm text-text-sub-600">
              Are you sure you want to delete this course? This action cannot be
              undone. <br />
              <span className="font-bold">Enrolments will not be deleted</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="small"
              className="w-full"
            >
              Cancel
            </Button.Root>
          </Modal.Close>
          <Button.Root
            size="small"
            variant="error"
            className="w-full"
            disabled={deleteCourse.isPending}
            onClick={async () => {
              await deleteCourse.mutateAsync({
                communityId: params.id,
                courseId: params.courseId,
              })
            }}
          >
            {deleteCourse.isPending ? (
              <RiLoaderLine className="animate-spin" />
            ) : (
              <Button.Icon as={RiDeleteBinLine} />
            )}
            Delete Course
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

function CourseEnrolmentButton() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const { notification } = useNotification()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: params.id,
    })
  )
  const me = useQuery(trpc.people.me.queryOptions())

  const selfEnrolMutation = useMutation({
    ...trpc.communities.selfEnrolToCourse.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courseDetail.queryOptions({
          communityId: params.id,
          courseId: params.courseId,
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: trpc.communities.courses.queryOptions({
          communityId: params.id,
        }).queryKey,
      })
    },
    onSuccess: () => {
      notification({
        title: "Enrolment Successful",
        description: "You have been enrolled in the course",
        variant: "filled",
        color: "success",
      })
    },
  })

  const buttonText = useMemo(() => {
    if (course?.data?.enrolments?.length === 0) {
      return "Be the first to enrol"
    }
    return "Enrol Now"
  }, [course.data])

  if (
    course?.data?.enrolments?.some(
      (enrolment) => enrolment.enrolleeUid === community?.data?.membership?.uid
    )
  ) {
    return null
  }
  return (
    <Button.Root
      size="medium"
      variant="neutral"
      mode="lighter"
      className="rounded-full"
      disabled={selfEnrolMutation.isPending}
      onClick={async () => {
        await selfEnrolMutation.mutateAsync({
          communityId: params?.id,
          courseDocId: params.courseId,
          enrollee: {
            communityId: params?.id,
            id: me.data?.uid ?? "",
            firstName: me.data?.firstName ?? "",
            lastName: me.data?.lastName ?? "",
            email:
              me.data?.companyPerson?.email || me?.data?.contact?.email || "",
            avatarUrl: me.data?.imageUrl ?? "",
            uid: me.data?.uid ?? "",
          },
          publicationUid: course?.data?.publicationUid,
          enrolleeUid: me.data?.uid ?? "",
        })
      }}
    >
      {buttonText}
      {selfEnrolMutation.isPending && (
        <Button.Icon as={RiLoaderLine} className="animate-spin" />
      )}
      {buttonText === "Enrol Now" &&
      course?.data?.enrolments?.length &&
      course?.data?.enrolments?.length > 0 ? (
        <AvatarGroupCompact.Root size="24">
          <AvatarGroupCompact.Stack>
            {course.data?.enrolments
              ?.slice(0, 3)
              .map((enrolment) => (
                <Avatar.Root color="sky">
                  {enrolment.enrollee.avatarUrl ? (
                    <Avatar.Image src={enrolment.enrollee.avatarUrl} />
                  ) : (
                    enrolment?.enrollee?.firstName?.[0]
                  )}
                </Avatar.Root>
              ))}
          </AvatarGroupCompact.Stack>
          <AvatarGroupCompact.Overflow>
            +{course?.data?.enrolments?.length - 3}
          </AvatarGroupCompact.Overflow>
        </AvatarGroupCompact.Root>
      ) : null}
    </Button.Root>
  )
}
