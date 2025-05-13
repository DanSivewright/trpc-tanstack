import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { getCommunityCommentsSchema } from "@/integrations/trpc/routers/communities/queries"
import { buildNestedCommentsTree } from "@/utils/build-nested-comments-tree"
import { cn } from "@/utils/cn"
import { RiMessage2Line, RiThumbUpFill, RiThumbUpLine } from "@remixicon/react"
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
import { FancyButton } from "@/components/ui/fancy-button"
import { Popover } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

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
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey,
      })
    },
  })
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
                  {comment.author.avatarUrl ? (
                    <Avatar.Image src={comment.author.avatarUrl} />
                  ) : (
                    comment?.author?.name?.[0]
                  )}
                </Avatar.Root>
                <div className="flex flex-col">
                  <span className="text-label-sm font-medium">
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
                  </span>
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
                </div>
              </div>
              <p className="text-label-md font-normal text-text-sub-600">
                {comment.content}
              </p>
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
              </footer>
              {replyToCommentId === comment.id && (
                <div className="rounded-[16px] bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200 drop-shadow-2xl">
                  <div className="overflow-hidden rounded-xl ring-1 ring-stroke-soft-200 drop-shadow-xl">
                    <Textarea.Root
                      className="rounded-none"
                      placeholder="Jot down your thoughts..."
                    >
                      <Textarea.CharCounter current={78} max={200} />
                    </Textarea.Root>
                    <div className="-mt-[9px] w-full bg-bg-weak-50 pt-[9px]">
                      <div className="w-full p-1.5">
                        <FancyButton.Root
                          className="rounded-[4px"
                          size="xsmall"
                        >
                          Reply
                        </FancyButton.Root>
                      </div>
                    </div>
                  </div>
                </div>
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

{
  /* <Button.Root
onClick={async () => {
  const generateTitle = () => {
    const intro = faker.helpers.arrayElement([
      "How to",
      "Why You Should",
      "The Ultimate Guide to",
      "Top 10 Ways to",
      "Understanding",
      "What You Need to Know About",
      "The Hidden Secrets of",
    ])

    const topic = faker.hacker.noun()
    const detail = faker.company.catchPhrase()

    return `${intro} ${topic}: ${detail}`
  }
  commentMutation.mutate({
    authorUid: me.data?.uid || "",
    author: {
      id: me.data?.uid || "",
      name: `${me.data?.firstName} ${me.data?.lastName}` || "",
      avatarUrl: me.data?.imageUrl || "",
    },
    id: crypto.randomUUID(),
    content: generateTitle(),
    createdAt: new Date().toISOString(),
    status: "posted",
    communityId,
    collectionGroup,
    collectionGroupDocId,
    parentCommentId: comment.id,
    rootParentCommentId: comment.rootParentCommentId,
    byMe: true,
  })
}}
disabled={commentMutation.isPending || me.isLoading}
size="xxsmall"
variant="neutral"
mode="ghost"
>
<Button.Icon as={RiMessage2Line} />
Reply
</Button.Root> */
}
