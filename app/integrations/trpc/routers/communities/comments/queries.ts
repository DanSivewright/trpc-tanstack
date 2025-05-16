import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import type { communityCommentSchema } from "../schemas/communities-schema"

export const getCommunityCommentsSchema = z.object({
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
  communityId: z.string(),
})
const getCommunityCommentsOptions = trpcQuerySchema.extend({
  input: getCommunityCommentsSchema,
})
export const getCommunityComments = async (
  options: z.infer<typeof getCommunityCommentsOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("comments")
          .where("deletedAt", "==", null)
          .where("collectionGroup", "==", options.input.collectionGroup)
          .where(
            "collectionGroupDocId",
            "==",
            options.input.collectionGroupDocId
          )
          .orderBy("createdAt", "desc")
          .get()
      )
      let comments: z.infer<typeof communityCommentSchema>[] = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Comments not found",
        })
      }

      snap.data.forEach((doc) => {
        const c = doc.data() as z.infer<typeof communityCommentSchema>
        comments.push({
          ...c,
          id: doc.id,
          byMe: doc.data().authorUid === options.ctx.uid,
        })
      })

      return comments as z.infer<typeof communityCommentSchema>[]
    },
    {
      name: generateCacheKey({
        path: options.path,
        type: options.type,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )
  return cachedFetcher()
}
