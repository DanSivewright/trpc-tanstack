import type { communityCommentSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { z } from "zod"

import { groupBy } from "./group-by"

type Comment = z.infer<typeof communityCommentSchema>
type CommentWithReplies = Comment & { replies: CommentWithReplies[] }

export function buildNestedCommentsTree(
  comments: Comment[]
): CommentWithReplies[] {
  const grouped = groupBy(
    comments,
    (comment) => comment.parentCommentId ?? "root"
  )

  function buildTree(parentId: string | null): CommentWithReplies[] {
    const children = grouped[parentId ?? "root"] || []
    return children.map((child) => ({
      ...child,
      replies: buildTree(child.id),
    }))
  }

  return buildTree(null)
}
