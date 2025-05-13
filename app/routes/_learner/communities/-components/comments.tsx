import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { getCommunityCommentsSchema } from "@/integrations/trpc/routers/communities/queries"
import { buildNestedCommentsTree } from "@/utils/build-nested-comments-tree"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiMessage2Line,
  RiThumbUpFill,
  RiThumbUpLine,
} from "@remixicon/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { formatDistance } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import * as AlertToast from "@/components/ui/toast-alert"

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

  const updateCommentMutation = useMutation({
    ...trpc.communities.updateComment.mutationOptions(),
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
                  iconLine={RiThumbUpLine}
                  iconFill={RiThumbUpFill}
                  mode="ghost"
                  hideText
                />
                <Button.Root
                  size="xxsmall"
                  variant="neutral"
                  mode="ghost"
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
                <Button.Root
                  onClick={() => {
                    updateCommentMutation.mutate({
                      id: comment?.id,
                      communityId,
                      collectionGroup,
                      collectionGroupDocId,
                      status: "hidden",
                      deletedAt: new Date().toISOString(),
                    })
                  }}
                  size="xxsmall"
                  variant="error"
                  mode="ghost"
                >
                  <Button.Icon as={RiDeleteBinLine} />
                </Button.Root>
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
