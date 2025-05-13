import { useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { getCommunityCommentsSchema } from "@/integrations/trpc/routers/communities/queries"
import { buildNestedCommentsTree } from "@/utils/build-nested-comments-tree"
import { cn } from "@/utils/cn"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiGlobalLine,
  RiListRadio,
  RiLoaderLine,
  RiMessage2Line,
  RiMoreLine,
  RiStarFill,
  RiThumbUpFill,
  RiThumbUpLine,
} from "@remixicon/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { format, formatDistance } from "date-fns"
import { motion, useAnimation } from "motion/react"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import { Dropdown } from "@/components/ui/dropdown"
import { toast } from "@/components/ui/toast"
import * as AlertToast from "@/components/ui/toast-alert"
import { Tooltip } from "@/components/ui/tooltip"

import CommentWysiwyg from "./comment-wysiwyg"
import LikesButton from "./likes-button"

type Props = z.infer<typeof getCommunityCommentsSchema> & {
  opUid?: string
  replyToCommentId?: string
  replyContent?: string
  onShowReply?: (commentId: string, content?: string) => void
}
const Comments: React.FC<Props> = (props) => {
  const { collectionGroup, collectionGroupDocId, communityId } = props
  const trpc = useTRPC()

  const commentsQuery = useSuspenseQuery(
    trpc.communities.comments.queryOptions({
      communityId,
      collectionGroup,
      collectionGroupDocId,
    })
  )

  const comments = useMemo(() => {
    return buildNestedCommentsTree(commentsQuery.data || [])
  }, [commentsQuery.data])

  return <CommentsList {...props} depth={0} comments={comments} />
}
export default Comments

type CommentsListProps = Props & {
  depth: number
  comments: ReturnType<typeof buildNestedCommentsTree>
  children?: React.ReactNode
}
const CommentsList: React.FC<CommentsListProps> = ({
  depth,
  comments,
  collectionGroup,
  collectionGroupDocId,
  communityId,
  opUid,
  children,
  replyToCommentId,
  replyContent,
  onShowReply,
}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const me = useSuspenseQuery(trpc.people.me.queryOptions())
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: communityId,
    })
  )

  const adminsSet = useMemo(() => {
    return new Set(
      community?.data?.members
        ?.filter((m) => m.role === "admin")
        .map((m) => m.uid)
    )
  }, [community?.data?.members])

  const commentMutation = useMutation({
    ...trpc.communities.comment.mutationOptions(),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
        (old) => [...(old && old.length ? old : []), newComment]
      )

      return undefined
    },
    onError: (_, previousComments) => {
      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
        // @ts-ignore
        previousComments
      )
      toast.custom((t) => (
        <AlertToast.Root
          t={t}
          status="error"
          message="Error! Your comment has not been posted."
        />
      ))
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
      })
      onShowReply?.("", "")
    },
    onSuccess: () => {
      toast.custom((t) => (
        <AlertToast.Root
          t={t}
          status="success"
          message="Success! Your comment has been posted."
        />
      ))
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
    await commentMutation.mutateAsync({
      authorUid: me.data?.uid || "",
      author: {
        id: me.data?.uid || "",
        name: `${me.data?.firstName} ${me.data?.lastName}` || "",
        avatarUrl: me.data?.imageUrl || "",
      },
      id: crypto.randomUUID(),
      content: htmlString,
      createdAt: new Date().toISOString(),
      status: "posted",
      communityId,
      collectionGroup,
      collectionGroupDocId,
      parentCommentId,
      rootParentCommentId,
      byMe: true,
    })
  }
  if (comments.length === 0) {
    return (
      <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
        <h1 className="relative z-10 text-title-h4">
          Your {collectionGroup.slice(0, -1)} has no comments
        </h1>
        <p className="relative z-10 text-label-sm font-light text-text-soft-400">
          Be the first to comment in this {collectionGroup.slice(0, -1)}.
        </p>

        <RiAddLine
          className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
          size={450}
        />
      </div>
    )
  }
  return (
    <ul className="flex w-full flex-col gap-8 pl-6">
      {comments.map((comment, ci) => {
        const isNotLast = ci !== comments.length - 1 && depth !== 0
        const memmber = community?.data?.members?.find(
          (m) => m?.uid === comment?.authorUid
        )
        return (
          <li
            //
            key={comment.id}
            className="relative flex w-full flex-col gap-2 pl-6"
          >
            {isNotLast && (
              <div className="absolute -bottom-4 -left-[49px] top-0 w-px bg-stroke-soft-200"></div>
            )}
            {depth !== 0 && (
              <div className="absolute -left-[49px] -top-4 h-[33px] w-[26px] rounded-bl-xl border-b border-l border-stroke-soft-200"></div>
            )}
            <div className="relative flex flex-col gap-2">
              {comment.replies && comment?.replies?.length ? (
                <div className="absolute -left-[25px] bottom-0 top-10 w-px bg-stroke-soft-200"></div>
              ) : null}
              <div className="-ml-10 flex items-center gap-2">
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <Avatar.Root size="32">
                      {!comment?.deletedAt && (
                        <>
                          {comment.author.avatarUrl ? (
                            <Avatar.Image src={comment.author.avatarUrl} />
                          ) : (
                            comment?.author?.name?.[0]
                          )}
                        </>
                      )}
                    </Avatar.Root>
                  </Tooltip.Trigger>
                  {!comment?.deletedAt && (
                    <Tooltip.Content
                      size="medium"
                      variant="light"
                      className="max-w-[272px] p-0"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-3 p-2">
                          <Avatar.Root size="32">
                            {comment.author.avatarUrl ? (
                              <Avatar.Image src={comment.author.avatarUrl} />
                            ) : (
                              comment?.author?.name?.[0]
                            )}
                          </Avatar.Root>
                          <div>
                            <div className="text-text-strong-950">
                              {comment?.author?.name}
                            </div>

                            <div className="mt-1 text-paragraph-xs text-text-sub-600">
                              Member Since:{" "}
                              {format(
                                new Date(memmber?.joinedAt!),
                                "d MMMM, yyy"
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-1 gap-2 border-t border-stroke-soft-200 p-2">
                          <Button.Root
                            mode="lighter"
                            className="grow"
                            size="xxsmall"
                          >
                            Profile
                          </Button.Root>
                          <Button.Root className="grow" size="xxsmall">
                            Chat
                          </Button.Root>
                        </div>
                      </div>
                    </Tooltip.Content>
                  )}
                </Tooltip.Root>
                <div className="flex flex-col">
                  <span className="text-label-sm font-medium">
                    {!comment?.deletedAt ? (
                      <>
                        {comment.author.name}{" "}
                        {comment?.authorUid === opUid && (
                          <span className="text-primary-base">OP</span>
                        )}{" "}
                        <span className="text-label-sm font-light text-text-soft-400">
                          •{" "}
                          {formatDistance(comment.createdAt, new Date(), {
                            addSuffix: true,
                          })}
                        </span>
                      </>
                    ) : (
                      "[Deleted]"
                    )}
                  </span>
                  {!comment?.deletedAt && (
                    <div className="flex items-center gap-2">
                      {adminsSet.has(comment.authorUid) && (
                        <Badge.Root
                          className="w-fit capitalize"
                          size="small"
                          color="blue"
                          variant="light"
                        >
                          Admin
                        </Badge.Root>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: comment.content,
                }}
                className="tiptap ProseMirror"
              ></div>

              <footer className="flex items-center gap-2">
                <LikesButton
                  collectionGroup="comments"
                  collectionGroupDocId={comment.id}
                  communityId={communityId}
                  mode="lighter"
                  hideText
                />
                <Button.Root
                  size="xxsmall"
                  variant="neutral"
                  mode="lighter"
                  onClick={() =>
                    onShowReply?.(
                      comment.id === replyToCommentId ? "" : comment.id,
                      comment.id === replyToCommentId ? "" : replyContent
                    )
                  }
                >
                  Reply
                  <Button.Icon as={RiMessage2Line} />
                </Button.Root>
                <Dropdown.Root>
                  <Dropdown.Trigger asChild>
                    <Button.Root
                      size="xxsmall"
                      variant="neutral"
                      mode="lighter"
                      // onClick={() => {
                      //   updateCommentMutation.mutate({
                      //     id: comment?.id,
                      //     communityId,
                      //     collectionGroup,
                      //     collectionGroupDocId,
                      //     status: "hidden",
                      //     deletedAt: new Date().toISOString(),
                      //   })
                      // }}
                      // size="xxsmall"
                      // variant="error"
                      // mode="ghost"
                    >
                      <Button.Icon as={RiMoreLine} />
                    </Button.Root>
                  </Dropdown.Trigger>
                  <Dropdown.Content
                    align="end"
                    className="bg-white/80 backdrop-blur"
                  >
                    <Dropdown.Group>
                      <Dropdown.Item>
                        <Dropdown.ItemIcon
                          className="fill-warning-base"
                          as={RiStarFill}
                        />
                        Feature Comment
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <Dropdown.ItemIcon as={RiListRadio} />
                        Add To Feed
                      </Dropdown.Item>
                    </Dropdown.Group>
                    <Divider.Root variant="line-spacing" />
                    <Dropdown.Group>
                      <DeleteComment
                        communityId={communityId}
                        collectionGroup={collectionGroup}
                        collectionGroupDocId={collectionGroupDocId}
                        comment={comment}
                      />
                    </Dropdown.Group>
                  </Dropdown.Content>
                </Dropdown.Root>
              </footer>
              {replyToCommentId === comment.id && (
                <CommentWysiwyg
                  isPending={commentMutation.isPending}
                  handleComment={handleComment}
                  parentCommentId={comment.id}
                  rootParentCommentId={comment.rootParentCommentId || ""}
                />
              )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <CommentsList
                depth={depth + 1}
                comments={comment.replies}
                collectionGroup={collectionGroup}
                collectionGroupDocId={collectionGroupDocId}
                communityId={communityId}
                opUid={opUid}
                replyToCommentId={replyToCommentId}
                replyContent={replyContent}
                onShowReply={onShowReply}
              />
            )}
          </li>
        )
      })}
      {children}
    </ul>
  )
}

function DeleteComment({
  communityId,
  collectionGroup,
  collectionGroupDocId,
  comment,
}: Omit<CommentsListProps, "comments" | "depth"> & {
  comment: ReturnType<typeof buildNestedCommentsTree>[number]
}) {
  const trpc = useTRPC()
  const HOLD_DURATION = 1000
  const [_, setIsHolding] = useState(false)
  const controls = useAnimation()
  const queryClient = useQueryClient()

  const updateCommentMutation = useMutation({
    ...trpc.communities.updateComment.mutationOptions(),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
      })
      return undefined
    },
  })

  async function handleHoldStart(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) {
    e.preventDefault()
    e.stopPropagation()
    setIsHolding(true)
    controls.set({ width: "0%" })
    await controls.start({
      width: "100%",
      transition: {
        duration: HOLD_DURATION / 1000,
        ease: "linear",
      },
    })
  }

  function handleHoldEnd(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) {
    e.preventDefault()
    e.stopPropagation()
    setIsHolding(false)
    controls.stop()
    controls.start({
      width: "0%",
      transition: { duration: 0.1 },
    })
    updateCommentMutation.mutate({
      id: comment.id,
      communityId,
      collectionGroup,
      collectionGroupDocId,
      status: "hidden",
      deletedAt: new Date().toISOString(),
    })
  }
  return (
    <Dropdown.Item
      disabled={updateCommentMutation.isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      onTouchCancel={handleHoldEnd}
      className="relative overflow-hidden bg-error-lighter text-error-dark data-[highlighted]:bg-error-lighter"
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={controls}
        className={cn("absolute left-0 top-0 z-0 h-full", "bg-error-light")}
      />
      <Dropdown.ItemIcon
        className={cn(
          "relative z-10",
          updateCommentMutation.isPending && "animate-spin"
        )}
        as={updateCommentMutation.isPending ? RiLoaderLine : RiDeleteBinLine}
      />
      <span className="relative z-10">
        {updateCommentMutation.isPending ? "Deleting..." : "Delete Comment"}
      </span>
    </Dropdown.Item>
  )
}
