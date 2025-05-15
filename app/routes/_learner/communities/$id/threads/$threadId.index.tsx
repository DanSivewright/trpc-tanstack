import { Suspense, useCallback, useEffect, useMemo, useRef } from "react"
import { storage } from "@/integrations/firebase/client"
import { useTRPC } from "@/integrations/trpc/react"
import { communityThreadSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { paletteSchema } from "@/integrations/trpc/routers/palette/schemas/palette-schema"
import { cn } from "@/utils/cn"
import { formatBytes } from "@/utils/format-bytes"
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiErrorWarningFill,
  RiGlobalLine,
  RiHashtag,
  RiInformationFill,
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
  stripSearchParams,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router"
import { format, formatDistance } from "date-fns"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { AnimatePresence, motion, useInView } from "motion/react"
import { Vibrant } from "node-vibrant/browser"
import { useDropzone, type Accept, type FileWithPath } from "react-dropzone"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CompactButton } from "@/components/ui/compact-button"
import * as Datepicker from "@/components/ui/datepicker"
import { Divider } from "@/components/ui/divider"
import { Drawer } from "@/components/ui/drawer"
import { Dropdown } from "@/components/ui/dropdown"
import { FancyButton } from "@/components/ui/fancy-button"
import { FileFormatIcon } from "@/components/ui/file-format-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Radio } from "@/components/ui/radio"
import { Switch } from "@/components/ui/switch"
import { Tag } from "@/components/ui/tag"
import { Tooltip } from "@/components/ui/tooltip"
import FieldInfo from "@/components/field-info"
import { Grid, gridVariants } from "@/components/grid"
import Image from "@/components/image"
import MultipleSelector, { type Option } from "@/components/multi-select"
import { Section } from "@/components/section"

import CommentWysiwyg from "../../-components/comment-wysiwyg"
import Comments from "../../-components/comments"
import LikesButton from "../../-components/likes-button"
import ThreadWysiwyg from "../../-components/thread-wysiwyg"
import { communityTags } from "../../create/$id/community"

const searchDefaultValues = {
  replyToCommentId: "",
  replyContent: "",
  settingsThreadOpen: false,
  deleteThreadOpen: false,
}
export const Route = createFileRoute(
  "/_learner/communities/$id/threads/$threadId/"
)({
  validateSearch: z.object({
    replyToCommentId: z.string().default(searchDefaultValues.replyToCommentId),
    replyContent: z.string().default(searchDefaultValues.replyContent),
    deleteThreadOpen: z.boolean().default(false),
    settingsThreadOpen: z.boolean().default(false),
  }),
  search: {
    middlewares: [stripSearchParams(searchDefaultValues)],
  },
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.threadDetail.queryOptions({
        communityId: params.id,
        threadId: params.threadId,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const queryClient = useQueryClient()
  const search = Route.useSearch()

  const navigate = Route.useNavigate()
  const onBack = useCallback(() => {
    return canGoBack
      ? router.history.back()
      : navigate({ to: "/communities/$id", params })
  }, [canGoBack])

  const onShowReply = useCallback((commentId: string, content?: string) => {
    navigate({
      resetScroll: false,
      replace: true,
      search: (old) => ({
        ...old,
        replyToCommentId: commentId,
        ...(content && { replyContent: content }),
      }),
    })
  }, [])

  const thread = useSuspenseQuery(
    trpc.communities.threadDetail.queryOptions({
      communityId: params.id,
      threadId: params.threadId,
    })
  )
  const me = useQuery(trpc.people.me.queryOptions())

  const commentMutation = useMutation({
    ...trpc.communities.comment.mutationOptions(),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
        (old) => [newComment, ...(old && old.length ? old : [])]
      )

      return undefined
    },
    onError: (_, previousComments) => {
      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
        // @ts-ignore
        previousComments
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
      })
    },
  })

  const handleComment = async ({
    htmlString,
    parentCommentId,
    rootParentCommentId,
  }: {
    htmlString: string
    parentCommentId: string | null
    rootParentCommentId: string | null
  }) => {
    const id = crypto.randomUUID()
    commentMutation.mutate({
      authorUid: me.data?.uid || "",
      author: {
        id: me.data?.uid || "",
        name: `${me.data?.firstName} ${me.data?.lastName}` || "",
        avatarUrl: me.data?.imageUrl || "",
      },
      id,
      content: htmlString,
      createdAt: new Date().toISOString(),
      status: "posted",
      communityId: params.id,
      collectionGroup: "threads",
      collectionGroupDocId: thread?.data?.id,
      rootParentCommentId: id,
      parentCommentId,
      likesCount: 0,
      deletedAt: null,
      byMe: true,
    })
  }

  const titleRef = useRef(null)
  const isFirstRender = useRef(true)

  const titleInView = useInView(titleRef, {
    initial: true,
    margin: "-100px 0px 0px 0px",
    amount: 0.5,
  })

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      <DeleteThreadModal />
      <ThreadSettings />
      <Section
        side="t"
        className="sticky top-12 z-20 mb-5 bg-white/70 backdrop-blur"
      >
        <nav className="mx-auto flex w-full max-w-screen-lg items-center gap-6 px-8 py-2 xl:px-0">
          <Link
            className="flex items-center gap-3"
            to="/communities/$id"
            params={params}
          >
            <RiArrowLeftSLine />
            <AnimatePresence mode="wait">
              {titleInView ? (
                <motion.h2
                  key="back"
                  initial={
                    isFirstRender.current ? false : { y: -20, opacity: 0 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="text-title-h6 font-light text-text-soft-400"
                >
                  <span className="text-text-strong-950">Your </span>Feed
                </motion.h2>
              ) : (
                <motion.div
                  key="title"
                  initial={
                    isFirstRender.current ? false : { y: 20, opacity: 0 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="flex items-center gap-2"
                >
                  <Avatar.Root size="20">
                    <Avatar.Image src={thread?.data?.author.avatarUrl} />
                  </Avatar.Root>
                  <h1 className="w-full truncate text-label-md font-normal">
                    {thread?.data?.title}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </nav>
      </Section>

      <header className="mx-auto flex w-full max-w-screen-lg flex-col items-start justify-end gap-4 px-8 xl:px-0">
        <div className="flex items-center gap-2">
          <Avatar.Root size="40">
            <Avatar.Image src={thread?.data?.author.avatarUrl} />
          </Avatar.Root>
          <div className="flex flex-col gap-0">
            <span className="text-label-lg font-normal">
              {thread?.data?.author.name}
            </span>
            <span className="text-label-sm font-light text-text-soft-400">
              {formatDistance(thread?.data?.createdAt!, new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex w-3/4 flex-wrap gap-2">
          <Badge.Root color="blue">
            <Badge.Icon as={RiHashtag} />
            Thread
          </Badge.Root>
          {thread?.data?.tags?.map((tag) => (
            <Badge.Root key={tag} variant="light">
              {tag}
            </Badge.Root>
          ))}
        </div>
        <h1 ref={titleRef} className="text-pretty text-title-h2">
          {thread?.data?.title}
        </h1>
        <div
          dangerouslySetInnerHTML={{
            __html: thread?.data?.content,
          }}
          className="tiptap ProseMirror"
        ></div>

        <div className="flex w-full flex-col gap-2">
          {thread?.data?.attachments?.length ? (
            <h2 className="text-label-sm font-normal">
              Attachments{" "}
              <span className="font-light text-text-soft-400">
                ({thread?.data?.attachments?.length || 0})
              </span>
            </h2>
          ) : null}
          <div className="flex w-3/4 flex-wrap gap-2">
            {thread?.data?.attachments?.map((att) => (
              <Tag.Root key={att.id}>
                <Tag.Icon
                  as={FileFormatIcon.Root}
                  size="small"
                  format={att.mimeType?.split("/")[1]}
                />
                {att.name}
              </Tag.Root>
            ))}
          </div>
        </div>
        <div className="w-full">
          {thread?.data?.images && thread?.data?.images?.length < 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread?.data?.images?.map((g, gi) => {
                const span = {
                  1: "col-span-12",
                  2: "col-span-6",
                }[thread?.data?.images?.length || 0]
                return (
                  <Image
                    key={g.id}
                    path={g.path!}
                    lqip={{
                      active: true,
                      quality: 1,
                      blur: 50,
                    }}
                    className={cn(
                      "aspect-video w-full overflow-hidden rounded-[4px] object-cover",
                      span
                    )}
                    // alt={`Community ${thread.name} image`}
                  />
                )
              })}
            </Grid>
          )}
          {thread?.data?.images && thread?.data?.images?.length >= 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread?.data?.images?.slice(0, 4).map((g, gi) => {
                let span = ""
                if (gi === 0) {
                  span = "col-span-12"
                } else {
                  if (
                    thread?.data?.images?.length &&
                    thread?.data?.images?.length - 1 === 2
                  ) {
                    span = "col-span-6"
                  } else {
                    span = "col-span-4"
                  }
                }

                const isLast = gi === 3
                const amountExtra =
                  thread?.data?.images?.length &&
                  thread?.data?.images?.length - 4

                return (
                  <div
                    className={cn(
                      "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[4px]",
                      span
                    )}
                    key={g.id}
                  >
                    {g.path}
                    {isLast && amountExtra && amountExtra > 0 && (
                      <div className="absolute z-10 flex h-full w-full items-center justify-center bg-black/60">
                        <span className="relative z-10 text-title-h4 text-bg-white-0">
                          +{amountExtra}
                        </span>
                      </div>
                    )}
                    <Image
                      key={g.id}
                      path={g.path!}
                      lqip={{
                        active: true,
                        quality: 1,
                        blur: 50,
                      }}
                      className="absolute inset-0 z-0 h-full w-full object-cover"
                    />
                  </div>
                )
              })}
            </Grid>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LikesButton
            collectionGroup="threads"
            collectionGroupDocId={thread?.data?.id}
            communityId={params.id}
          />

          <ThreadDropdown />
        </div>
      </header>
      <Section
        side="b"
        className="mx-auto mt-8 flex w-full max-w-screen-lg flex-col items-start justify-end gap-10 px-8 xl:px-0"
      >
        <CommentWysiwyg
          placeholder="Join the conversation..."
          handleComment={handleComment}
          isPending={commentMutation.isPending}
          parentCommentId={null}
          rootParentCommentId={null}
        />
        <Suspense fallback={<div>Loading comments...</div>}>
          <Comments
            opUid={thread?.data?.authorUid}
            communityId={params.id}
            collectionGroup="threads"
            collectionGroupDocId={params.threadId}
            onShowReply={onShowReply}
            {...search}
          />
        </Suspense>
      </Section>
    </>
  )
}

function ThreadDropdown() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const thread = useSuspenseQuery(
    trpc.communities.threadDetail.queryOptions({
      communityId: params.id,
      threadId: params.threadId,
    })
  )

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root size="xxsmall" variant="neutral" mode="stroke">
          <Button.Icon as={RiMoreLine} />
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="start">
        <div className="flex items-center gap-3 p-2">
          <Avatar.Root color="sky" size="40">
            {thread?.data?.author?.avatarUrl ? (
              <Avatar.Image src={thread?.data?.author?.avatarUrl} />
            ) : (
              thread?.data?.author?.name?.charAt(0)
            )}
          </Avatar.Root>
          <div className="flex-1">
            <div className="text-label-sm text-text-strong-950">
              {thread?.data?.author?.name}
            </div>
            <div className="mt-1 text-paragraph-xs text-text-sub-600">
              Created:{" "}
              {format(new Date(thread?.data?.createdAt!), "MMM d, yyyy")}
            </div>
          </div>
          <Badge.Root variant="light" color="green" size="small">
            Author
          </Badge.Root>
        </div>

        <Dropdown.Group>
          <Dropdown.Item
            onClick={() => {
              navigate({
                resetScroll: false,
                replace: true,
                search: (prev) => ({
                  ...prev,
                  settingsThreadOpen: true,
                }),
              })
            }}
          >
            <Dropdown.ItemIcon as={RiSettings2Line} />
            Thread Settings
          </Dropdown.Item>
          <Dropdown.Item asChild>
            <Link
              to="/communities/create/$id/thread"
              params={{
                id: params.id,
              }}
            >
              <Dropdown.ItemIcon as={RiAddLine} />
              Add New Thread
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
                replace: true,
                search: (prev) => ({
                  ...prev,
                  deleteThreadOpen: true,
                }),
              })
            }}
          >
            <Dropdown.ItemIcon as={RiDeleteBinLine} />
            Delete Thread
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}

function DeleteThreadModal() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const deleteThread = useMutation({
    ...trpc.communities.deleteThread.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries()

      router.invalidate()
      navigate({
        to: "/communities/$id",
        params: {
          id: params.id,
        },
      })
    },
  })

  return (
    <Modal.Root
      open={search.deleteThreadOpen}
      onOpenChange={(open) => {
        console.log(open)
        navigate({
          resetScroll: false,
          replace: true,
          search: (prev) => ({
            ...prev,
            deleteThreadOpen: open,
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
              Delete Thread
            </div>
            <div className="text-paragraph-sm text-text-sub-600">
              Are you sure you want to delete this thread? This action cannot be
              undone. <br />
              <span className="font-bold">
                All comments and likes will be deleted
              </span>
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
            disabled={deleteThread.isPending}
            onClick={async () => {
              await deleteThread.mutateAsync({
                communityId: params.id,
                id: params.threadId,
              })
            }}
          >
            {deleteThread.isPending ? (
              <RiLoaderLine className="animate-spin" />
            ) : (
              <Button.Icon as={RiDeleteBinLine} />
            )}
            Delete Thread
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

type FileTypeCategory = "images" | "documents" | "videos" | "audio"

const fileTypeMappings: Record<FileTypeCategory, Accept> = {
  images: {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  documents: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/plain": [".txt"],
  },
  videos: {
    "video/*": [".mp4", ".webm", ".ogg"],
  },
  audio: {
    "audio/*": [".mp3", ".wav", ".ogg"],
  },
}
function ThreadSettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { notification } = useNotification()

  const MAX_FILES = 5
  const MAX_SIZE = 5 * 1024 * 1024
  const ACCEPTED_FILE_TYPES: FileTypeCategory[] = [
    "documents",
    "images",
    "videos",
    "audio",
  ]

  const thread = useSuspenseQuery(
    trpc.communities.threadDetail.queryOptions({
      communityId: params.id,
      threadId: params.threadId,
    })
  )

  const updateThread = useMutation({
    ...trpc.communities.updateThread.mutationOptions(),
    onMutate: async (newThread) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.threadDetail.queryOptions({
          communityId: params.id,
          threadId: newThread.id,
        }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.threadDetail.queryOptions({
          communityId: params.id,
          threadId: newThread.id,
        }).queryKey,
        // @ts-ignore
        (old) => ({
          ...old,
          newThread,
        })
      )

      // todo optimistically update the feed

      return undefined
    },
    onError: (_, previousThread) => {
      queryClient.setQueryData(
        trpc.communities.threadDetail.queryOptions({
          communityId: params.id,
          threadId: params.threadId,
        }).queryKey,
        // @ts-ignore
        previousThread
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.threadDetail.queryOptions({
          communityId: params.id,
          threadId: params.threadId,
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: trpc.communities.threads.queryOptions({
          communityId: params.id,
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: trpc.communities.feed.queryOptions({
          communityId: params.id,
        }).queryKey,
      })
    },
  })

  const formSchema = communityThreadSchema
    .pick({
      id: true,
      title: true,
      content: true,
      communityId: true,
      accessibile: true,
      tags: true,
      isFeatured: true,
      isFeaturedUntil: true,
      updatedAt: true,
      attachments: true,
    })
    .merge(
      communityThreadSchema
        .pick({
          content: true,
          meta: true,
        })
        .extend({
          images: z
            .array(
              z.object({
                id: z.string(),
                file: z.instanceof(File).optional().nullable(),
                featured: z.boolean().optional().nullable(),
                name: z.string(),
                mimeType: z.string().optional().nullable(),
                url: z.string().optional().nullable(),
                path: z.string().optional().nullable(),
                size: z.number().optional().nullable(),
              })
            )
            .max(MAX_FILES, {
              message: `Maximum ${MAX_FILES} images allowed`,
            })
            .optional()
            .nullable(),
        })
        .partial()
    )

  const form = useForm({
    defaultValues: {
      id: thread.data?.id,
      title: thread.data?.title,
      communityId: thread.data?.communityId,
      accessibile: thread.data?.accessibile,
      tags: thread.data?.tags,
      attachments: thread.data?.attachments,
      isFeatured: thread.data?.isFeatured,
      isFeaturedUntil: thread.data?.isFeaturedUntil,
      updatedAt: thread.data?.updatedAt,
      images: [
        ...(thread.data?.images || []),
        ...(thread.data?.attachments || []),
      ],
      content: thread.data?.content,
      meta: thread.data?.meta,
    } as z.infer<typeof formSchema>,
    validators: {
      onSubmit: formSchema,
    },
    onSubmitInvalid: (args) => {
      console.log("args:::", args)
      notification({
        title: "Invalid Form",
        description: "Please fill in all fields correctly.",
        variant: "lighter",
        status: "error",
      })
    },
    onSubmit: async (data) => {
      const { images: formImages, ...rest } = data?.value

      let payload = {
        ...rest,
        updatedAt: new Date().toISOString(),
        authorUid: thread.data?.authorUid,
        type: "thread",
        status: "published",
        author: thread.data?.author,
      } as z.infer<typeof formSchema>

      console.log("formImages:::", formImages)
      if (formImages && formImages?.length > 0) {
        const uploadedImages = await Promise.all(
          formImages?.map(async (f) => {
            if ("file" in f && f.file) {
              const storageRef = ref(
                storage,
                `communities/${params.id}/${f.name}`
              )
              const uploadTask = await uploadBytes(storageRef, f.file)
              const url = await getDownloadURL(uploadTask.ref)
              return {
                ...f,
                url,
                path: `communities/${params.id}/${f.name}`,
                mimeType: f.file.type,
              }
            }
            return {
              ...f,
              mimeType: f.mimeType || "unset",
            }
          })
        )
        const featureImage = uploadedImages.find((x) => x.featured)
        let palette = thread.data?.meta?.colors
        if (
          featureImage &&
          "file" in featureImage &&
          featureImage.file &&
          featureImage.mimeType?.startsWith("image")
        ) {
          palette = (await Vibrant.from(URL.createObjectURL(featureImage.file))
            .getPalette()
            .then((p) => ({
              Vibrant: {
                rgb: p.Vibrant?.rgb,
                population: p.Vibrant?.population,
                bodyTextColor: p.Vibrant?.bodyTextColor,
                titleTextColor: p.Vibrant?.titleTextColor,
                hex: p.Vibrant?.hex,
              },
              DarkVibrant: {
                rgb: p.DarkVibrant?.rgb,
                population: p.DarkVibrant?.population,
                bodyTextColor: p.DarkVibrant?.bodyTextColor,
                titleTextColor: p.DarkVibrant?.titleTextColor,
                hex: p.DarkVibrant?.hex,
              },
              LightVibrant: {
                rgb: p.LightVibrant?.rgb,
                population: p.LightVibrant?.population,
                bodyTextColor: p.LightVibrant?.bodyTextColor,
                titleTextColor: p.LightVibrant?.titleTextColor,
                hex: p.LightVibrant?.hex,
              },
              Muted: {
                rgb: p.Muted?.rgb,
                population: p.Muted?.population,
                bodyTextColor: p.Muted?.bodyTextColor,
                titleTextColor: p.Muted?.titleTextColor,
                hex: p.Muted?.hex,
              },
              DarkMuted: {
                rgb: p.DarkMuted?.rgb,
                population: p.DarkMuted?.population,
                bodyTextColor: p.DarkMuted?.bodyTextColor,
                titleTextColor: p.DarkMuted?.titleTextColor,
                hex: p.DarkMuted?.hex,
              },
              LightMuted: {
                rgb: p.LightMuted?.rgb,
                population: p.LightMuted?.population,
                bodyTextColor: p.LightMuted?.bodyTextColor,
                titleTextColor: p.LightMuted?.titleTextColor,
                hex: p.LightMuted?.hex,
              },
            }))) as z.infer<typeof paletteSchema>
        }
        let imagesWithoutFile = uploadedImages.map((f) => ({
          id: f.id,
          featured: f.featured,
          url: f.url,
          name: f.name,
          path: f.path,
          size: f.size,
          mimeType: f.mimeType || null,
        }))

        const onlyImages = imagesWithoutFile.filter((f) =>
          f.mimeType?.startsWith("image")
        )

        const onlyAttachments = imagesWithoutFile.filter(
          (f) => !f.mimeType?.startsWith("image")
        )

        payload.images = onlyImages
        payload.attachments = onlyAttachments
        if (palette) {
          payload.meta = {
            colors: palette,
          }
        }
      }
      // @ts-ignore
      await updateThread.mutateAsync(payload)

      navigate({
        resetScroll: false,
        search: (prev) => ({
          ...prev,
          settingsThreadOpen: false,
        }),
      })
      notification({
        title: "Thread Created",
        description: "Your thread has been created successfully.",
        variant: "lighter",
        status: "success",
      })
    },
  })

  const images = useStore(form.store, (state) => state.values.images)

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const totalFiles = (images?.length || 0) + acceptedFiles.length

      if (totalFiles > MAX_FILES) {
        const diff = totalFiles - MAX_FILES
        notification({
          title: "File Upload Limit Exceeded",
          description: `Maximum ${MAX_FILES} files allowed. ${diff} file${
            diff === 1 ? "" : "s"
          } rejected.`,
        })

        if (images && images.length < MAX_FILES) {
          const diff = MAX_FILES - images.length
          const newFiles = [
            ...images,
            ...acceptedFiles.slice(0, diff).map((x) => ({
              id: crypto.randomUUID(),
              file: x,
              mimeType: x.type,
              featured: false,
              url: "",
              name: x.name,
              path: "",
              size: x.size,
            })),
          ]

          if (
            !newFiles.some((x) => x.featured) &&
            newFiles?.[0]?.mimeType?.startsWith("image")
          ) {
            newFiles[0].featured = true
          }

          form.setFieldValue("images", newFiles)
        }
        return
      }

      const newFiles = [
        ...(form.getFieldValue("images") || []),
        ...acceptedFiles.map((x) => ({
          id: crypto.randomUUID(),
          file: x,
          featured: false,
          mimeType: x.type,
          url: "",
          name: x.name,
          path: "",
          size: x.size,
        })),
      ]

      if (
        !newFiles.some((x) => x.featured) &&
        newFiles?.[0]?.mimeType?.startsWith("image")
      ) {
        newFiles[0].featured = true
      }

      form.setFieldValue("images", newFiles)
    },
    [images]
  )

  const accept = useMemo(
    () =>
      ACCEPTED_FILE_TYPES.reduce<Accept>(
        (acc, type) => ({
          ...acc,
          ...fileTypeMappings[type],
        }),
        {}
      ),
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: MAX_SIZE,
    // maxFiles: MAX_FILES,
    onDropRejected: (fileRejections) => {
      // Group rejections by error type
      const sizeErrors = fileRejections.filter((r) =>
        r.errors.some((e) => e.code === "file-too-large")
      )
      const typeErrors = fileRejections.filter((r) =>
        r.errors.some((e) => e.code === "file-invalid-type")
      )

      if (sizeErrors.length > 0) {
        console.log("sizeErrors error:::", sizeErrors)
        notification({
          title: "Files Too Large",
          description: `${sizeErrors.length} file${
            sizeErrors.length === 1 ? " exceeds" : "s exceed"
          } the ${(MAX_SIZE / (1024 * 1024)).toFixed(1)}MB size limit.`,
        })
      }

      if (typeErrors.length > 0) {
        console.log("typeErrors error:::", typeErrors)
        notification({
          title: "Invalid File Type",
          description: `Only ${ACCEPTED_FILE_TYPES.join(", ")} file${
            ACCEPTED_FILE_TYPES.length === 1 ? " is" : "s are"
          } allowed. ${typeErrors.length} file${
            typeErrors.length === 1 ? " was" : "s were"
          } rejected.`,
        })
      }
    },
  })

  type PreviewImage = NonNullable<z.infer<typeof formSchema>["images"]>[number]
  const getPreviewImage = useCallback((fileField: PreviewImage) => {
    if (
      "file" in fileField &&
      fileField.file &&
      fileField.file.type.startsWith("image")
    ) {
      return URL.createObjectURL(fileField.file)
    }
    if (fileField.url && fileField.mimeType?.startsWith("image")) {
      return fileField.url
    }
    return null
  }, [])
  const preViewImages = useMemo(() => {
    return (images ?? []).map((image) => getPreviewImage(image))
  }, [images])

  const handleEditorChange = useCallback(
    (htmlString: string) => {
      form.setFieldValue("content", htmlString)
    },
    [form]
  )

  const tags: Option[] = communityTags.map((tag) => ({
    label: tag.title,
    value: tag.title,
  }))

  return (
    <Drawer.Root
      open={search.settingsThreadOpen}
      onOpenChange={(open) => {
        navigate({
          resetScroll: false,
          search: (prev) => ({
            ...prev,
            settingsThreadOpen: open,
          }),
        })
      }}
    >
      <Drawer.Content className="max-w-screen-xl">
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
                        fallbackIcon={RiInformationFill}
                      />
                    </div>
                  )
                }}
              </form.Field>
              <form.Field name="title">
                {(field) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label.Root htmlFor={field.name}>
                        Thread Title
                        <Label.Asterisk />
                      </Label.Root>
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Field
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                            placeholder="Thread Title"
                            type="text"
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      <FieldInfo field={field} />
                    </div>
                  )
                }}
              </form.Field>
              <div className="flex flex-col gap-2">
                <Label.Root>
                  Content
                  <Label.Asterisk />
                </Label.Root>
                <ThreadWysiwyg
                  handleChange={handleEditorChange}
                  placeholder="Write something…"
                  defaultContent={thread?.data?.content ?? ""}
                />
              </div>
              <form.Field name="tags" mode="array">
                {(field) => (
                  <div className="relative z-20 flex flex-col gap-2">
                    <Label.Root>Tags</Label.Root>
                    <MultipleSelector
                      commandProps={{
                        label: "Select tags",
                      }}
                      onChange={(value) => {
                        field.setValue(value.map((tag) => tag.value))
                      }}
                      value={field.state.value?.map((tag) => ({
                        label: tag,
                        value: tag,
                      }))}
                      defaultOptions={tags}
                      placeholder="Select tags"
                      hidePlaceholderWhenSelected
                      emptyIndicator={
                        <p className="text-sm text-center">No tags found</p>
                      }
                    />
                  </div>
                )}
              </form.Field>
              <form.Field
                name="images"
                mode="array"
                children={(field) => {
                  return (
                    <>
                      <div className="flex w-full flex-col gap-1">
                        <Label.Root htmlFor={field.name}>
                          Post Images & Attachments
                          <Label.Asterisk />
                        </Label.Root>
                        <div
                          className={cn(
                            "flex w-full cursor-pointer flex-col items-center gap-5 rounded-xl border border-dashed border-stroke-sub-300 bg-bg-white-0 p-8 text-center",
                            "transition duration-200 ease-out",
                            "hover:bg-bg-weak-50",
                            {
                              "border-primary-base bg-primary-alpha-24":
                                isDragActive,
                            }
                          )}
                          {...getRootProps()}
                        >
                          <input
                            {...getInputProps()}
                            disabled={
                              images && images?.length >= MAX_FILES
                                ? true
                                : false
                            }
                            multiple
                            type="file"
                            tabIndex={-1}
                            className="hidden"
                          />
                          <div className="space-y-1.5">
                            <div className="text-label-sm text-text-strong-950">
                              Choose a file or drag & drop it here.
                            </div>
                            <div className="text-paragraph-xs text-text-sub-600">
                              {ACCEPTED_FILE_TYPES.map((type, index) => {
                                const capitalizedType =
                                  type.charAt(0).toUpperCase() + type.slice(1)
                                if (index === 0) return capitalizedType
                                if (index === ACCEPTED_FILE_TYPES.length - 1)
                                  return ` and ${capitalizedType}`
                                return `, ${capitalizedType}`
                              }).join("")}{" "}
                              formats, up to 50 MB.
                            </div>
                          </div>
                          <Button.Root
                            disabled={
                              images && images?.length >= MAX_FILES
                                ? true
                                : false
                            }
                            type="button"
                            size="xxsmall"
                          >
                            Browse Files
                          </Button.Root>
                        </div>
                        <FieldInfo
                          field={field}
                          fallback={`${images?.length} ${
                            images?.length === 1 ? "file" : "files"
                          }, ${formatBytes(
                            images?.reduce((acc, file) => {
                              return acc + (file.size || 0)
                            }, 0) || 0
                          )}`}
                          fallbackIcon={RiInformationFill}
                        />
                        <div className="flex w-full flex-wrap items-center gap-2">
                          {field.state.value?.map((fileField, i) => {
                            const name = fileField.name
                            const previewImage = preViewImages?.[i] ?? undefined

                            return (
                              <Tooltip.Root delayDuration={0} key={name + i}>
                                <Tooltip.Trigger type="button">
                                  <div className="relative">
                                    {fileField.featured && (
                                      <div className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-primary-base">
                                        <RiCheckLine className="size-2 fill-white" />
                                      </div>
                                    )}
                                    {previewImage ? (
                                      <img
                                        src={previewImage ?? undefined}
                                        alt="Preview"
                                        className={cn(
                                          "h-10 w-10 rounded-md object-cover",
                                          {
                                            "outline outline-2 outline-primary-base":
                                              fileField.featured,
                                          }
                                        )}
                                        style={{ objectFit: "cover" }}
                                      />
                                    ) : (
                                      <FileFormatIcon.Root
                                        format={
                                          fileField?.mimeType?.split("/")[1]
                                        }
                                        color="red"
                                      />
                                    )}
                                  </div>
                                </Tooltip.Trigger>
                                <Tooltip.Content variant="light" size="medium">
                                  <div className="flex items-center gap-3">
                                    {previewImage ? (
                                      <img
                                        src={previewImage ?? undefined}
                                        alt="Preview"
                                        className="h-10 w-10 rounded-md object-cover"
                                        style={{ objectFit: "cover" }}
                                      />
                                    ) : (
                                      <FileFormatIcon.Root
                                        format={
                                          fileField?.mimeType?.split("/")[1]
                                        }
                                        color="red"
                                      />
                                    )}

                                    <div>
                                      <div className="text-text-strong-950">
                                        {name}
                                      </div>
                                      <div className="mt-1 flex items-center gap-2">
                                        {(fileField?.mimeType?.startsWith(
                                          "image"
                                        ) ||
                                          !fileField?.mimeType) && (
                                          <form.Field
                                            name={`images[${i}].featured`}
                                          >
                                            {(subField) => {
                                              return (
                                                <div className="flex items-center gap-2">
                                                  <Checkbox.Root
                                                    checked={
                                                      !!subField.state.value
                                                    }
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      if (!checked) {
                                                        notification({
                                                          title:
                                                            "Cover image Required",
                                                          description:
                                                            "You must set a cover for your thread. Click another switch to set it as cover.",
                                                          variant: "lighter",
                                                          status: "information",
                                                        })
                                                        return
                                                      }
                                                      subField.handleChange(
                                                        checked
                                                      )

                                                      if (checked) {
                                                        field.state.value?.forEach(
                                                          (
                                                            editFile,
                                                            editFileIndex
                                                          ) => {
                                                            if (
                                                              editFileIndex !==
                                                                i &&
                                                              editFile.featured
                                                            ) {
                                                              form.setFieldValue(
                                                                `images[${editFileIndex}].featured`,
                                                                false
                                                              )
                                                            }
                                                          }
                                                        )
                                                      }
                                                    }}
                                                  />
                                                  <p className="text-label-xs text-text-soft-400">
                                                    Featured
                                                  </p>
                                                </div>
                                              )
                                            }}
                                          </form.Field>
                                        )}

                                        <CompactButton.Root
                                          type="button"
                                          onClick={() => field.removeValue(i)}
                                          variant="ghost"
                                        >
                                          <CompactButton.Icon
                                            type="button"
                                            className="size-4 text-warning-base"
                                            as={RiDeleteBinLine}
                                          />
                                        </CompactButton.Root>
                                      </div>
                                    </div>
                                  </div>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )
                }}
              />
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
                            description: "Anyone can view this thread",
                            icon: RiGlobalLine,
                          },
                          {
                            label: "Community Only",
                            value: "community",
                            description:
                              "Only members of the community can view this thread",
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

                      <FieldInfo field={field} />
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
