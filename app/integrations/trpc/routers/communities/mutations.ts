import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import {
  communityCommentSchema,
  communityFeedItemInputSchema,
  communityFeedItemSchema,
  communityFeedSchema,
  communityLikeSchema,
  communityThreadSchema,
  courseFeedItemSchema,
  threadFeedItemSchema,
} from "./schemas/communities-schema"

export const upsertLikeSchema = communityLikeSchema.extend({
  id: z.string().optional().nullable(),
})

export const upsertLike = async (input: z.infer<typeof upsertLikeSchema>) => {
  const payload = {
    ...input,
    createdAt: new Date().toISOString(),
  }
  if (input.id) {
    // handle like delete
    const deleteLike = await tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("likes")
        .doc(input.id)
        .delete()
    )
    if (deleteLike.error || !deleteLike.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Error: failed to delete like ${input.collectionGroup}`,
      })
    }
  } else {
    const addLike = await tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("likes")
        .add(payload)
    )

    if (addLike.error || !addLike.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Error: failed to like ${input.collectionGroup}`,
      })
    }
  }

  const storage = useStorage()
  const keys = await storage.keys()
  const likesKey = generateCacheKey({
    type: "query",
    path: "communities.interactionsCountForCollectionGroup",
    input: {
      collectionGroup: input.collectionGroup,
      collectionGroupDocId: input.collectionGroupDocId,
      communityId: input.communityId,
      interactionType: "likes",
    },
  })
  await storage.remove(keys.find((k) => k.includes(likesKey)) as string)

  return payload
}
