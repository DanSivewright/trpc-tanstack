import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import {
  communityThreadSchema,
  threadFeedItemSchema,
} from "./schemas/communities-schema"

export const createCommunityThreadSchema = communityThreadSchema
  .pick({
    id: true,
    title: true,
    author: true,
    authorUid: true,
    type: true,
    communityId: true,
    status: true,
    accessibile: true,
    tags: true,
  })
  .merge(
    communityThreadSchema
      .pick({
        caption: true,
        meta: true,
      })
      .extend({
        images: z
          .array(
            z.object({
              id: z.string(),
              file: z.instanceof(File).optional().nullable(),
              featured: z.boolean(),
              name: z.string(),
              url: z.string().optional().nullable(),
              path: z.string().optional().nullable(),
              size: z.number().optional().nullable(),
            })
          )
          .max(5, {
            message: `Maximum ${5} images allowed`,
          })
          .optional()
          .nullable(),
      })
      .partial()
  )

export const createCommunityThread = async (
  input: z.infer<typeof createCommunityThreadSchema>
) => {
  const payload = {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  }

  //   await db.collectionGroup("threads").doc(input.id).set(payload)
  const addThead = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("threads")
      .doc(input.id)
      .set(payload)
  )
  if (addThead.error || !addThead.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: addThead.error?.message || "Error: Failed to create thread",
    })
  }

  type ThreadFeedItem = z.infer<typeof threadFeedItemSchema>
  const threadFeedItem: Omit<ThreadFeedItem, "id" | "data"> = {
    type: "thread",
    group: "threads",
    communityId: input.communityId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "user",
    verb: "created",
    descriptor: "a new thread",
    input: {
      communityId: input.communityId,
      threadId: input.id,
    },
    authorUid: input.authorUid,
    author: input.author,
    isFeatured: false,
    isFeaturedUntil: null,
  }

  const addFeedItem = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("feed")
      .doc(input.id)
      .set(threadFeedItem)
  )

  if (addFeedItem.error || !addFeedItem.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        addFeedItem.error?.message || "Error: Failed to create feed item",
    })
  }

  const storage = useStorage()
  const keys = await storage.keys()
  const feedKey = generateCacheKey({
    type: "query",
    path: "communities.feed",
    input: {
      communityId: input.communityId,
    },
  })
  const threadsKey = generateCacheKey({
    type: "query",
    path: "communities.threads",
    input: {
      communityId: input.communityId,
    },
  })

  const deleteKeys = [feedKey, threadsKey]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )

  return payload
}
