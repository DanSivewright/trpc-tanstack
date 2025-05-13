import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { getCommunityCommentsSchema } from "@/integrations/trpc/routers/communities/queries"
import { buildNestedCommentsTree } from "@/utils/build-nested-comments-tree"
import { faker } from "@faker-js/faker"
import { RiMessage2Line } from "@remixicon/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import type { z } from "zod"

import { Button } from "@/components/ui/button"

type Props = z.infer<typeof getCommunityCommentsSchema>
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
  children,
}) => {
  const colors = ["red", "blue", "green"]

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const me = useSuspenseQuery(trpc.people.me.queryOptions())

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

      const previousComments = queryClient.getQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          communityId,
        }).queryKey
      )

      if (newComment.parentCommentId) {
        const indexOfParentComment = previousComments?.findIndex(
          (c) => c.id === newComment.parentCommentId
        )
        if (!indexOfParentComment) return undefined
        if (indexOfParentComment < 0) return undefined

        const parentComment = previousComments?.[indexOfParentComment]
        if (!parentComment) return undefined

        queryClient.setQueryData(
          trpc.communities.comments.queryOptions({
            collectionGroup,
            collectionGroupDocId,
            communityId,
          }).queryKey,
          previousComments?.map((c) => {
            if (c.id === newComment.parentCommentId) {
              return {
                ...c,
                commentsCount: (c.commentsCount || 0) + 1,
              }
            }
            return c
          })
        )

        if (
          newComment?.rootParentCommentId &&
          newComment?.rootParentCommentId !== newComment?.parentCommentId
        ) {
          const indexOfRootParentComment = previousComments?.findIndex(
            (c) => c.id === newComment.rootParentCommentId
          )
          if (!indexOfRootParentComment) return undefined
          if (indexOfRootParentComment < 0) return undefined

          const rootParentComment = previousComments?.[indexOfRootParentComment]
          if (!rootParentComment) return undefined

          queryClient.setQueryData(
            trpc.communities.comments.queryOptions({
              collectionGroup,
              collectionGroupDocId,
              communityId,
            }).queryKey,
            previousComments?.map((c) => {
              if (c.id === newComment.rootParentCommentId) {
                return {
                  ...c,
                  commentsCount: (c.commentsCount || 0) + 1,
                }
              }
              return c
            })
          )
        }
      }
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
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex flex-col">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{comment.author.name}</div>
                <div className="text-sm text-gray-600">{comment.content}</div>
              </div>
              <Button.Root
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
                Reply {comment.commentsCount && comment.commentsCount}
              </Button.Root>
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4">
                <CommentsList
                  depth={depth + 1}
                  comments={comment.replies}
                  collectionGroup={collectionGroup}
                  collectionGroupDocId={collectionGroupDocId}
                  communityId={communityId}
                />
              </div>
            )}
          </div>
        </li>
      ))}
      {children}
      {/* <pre>{JSON.stringify(comments, null, 2)}</pre> */}
    </ul>
  )
}
