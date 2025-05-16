import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import { createCommunityFeedItem } from "../feed/mutations"
import { communityThreadSchema } from "../schemas/communities-schema"

export const deleteThreadAndRelationsSchema = z.object({
  id: z.string(),
  communityId: z.string(),
})
export const deleteThreadAndRelations = async (
  input: z.infer<typeof deleteThreadAndRelationsSchema>
) => {
  const deleteThread = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("threads")
      .doc(input.id)
      .delete()
  )

  if (deleteThread.error || !deleteThread.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to delete thread",
    })
  }

  const [threadCommentsSnap, threadLikesSnap, feedSnap] = await Promise.all([
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("comments")
        .where("deletedAt", "==", null)
        .where("collectionGroup", "==", "threads")
        .where("collectionGroupDocId", "==", input.id)
        .get()
    ),
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("likes")
        .where("deletedAt", "==", null)
        .where("collectionGroup", "==", "threads")
        .where("collectionGroupDocId", "==", input.id)
        .get()
    ),
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("feed")
        .where("groupDocId", "==", input.id)
        .get()
    ),
  ])
  if (threadCommentsSnap.error || !threadCommentsSnap.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to delete thread comments",
    })
  }
  if (threadLikesSnap.error || !threadLikesSnap.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to delete thread likes",
    })
  }
  if (feedSnap.error || !feedSnap.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to delete thread feed",
    })
  }

  const batch = db.batch()
  const deleteables = [
    ...threadCommentsSnap.data.docs.map((doc) => doc.ref),
    ...threadLikesSnap.data.docs.map((doc) => doc.ref),
    ...feedSnap.data.docs.map((doc) => doc.ref),
  ]
  // await batch.delete(deleteables)
  deleteables.forEach((ref) => {
    batch.delete(ref)
  })
  await batch.commit()

  const storage = useStorage()
  const keys = await storage.keys()
  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.interactionsCountForCollectionGroup",
      input: {
        collectionGroup: "threads",
        collectionGroupDocId: input.id,
        communityId: input.communityId,
        interactionType: "comments",
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.interactionsCountForCollectionGroup",
      input: {
        collectionGroup: "threads",
        collectionGroupDocId: input.id,
        communityId: input.communityId,
        interactionType: "likes",
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.comments.all",
      input: {
        communityId: input.communityId,
        collectionGroup: "threads",
        collectionGroupDocId: input.id,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.threads.all",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.feed.all",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.thread.detail",
      input: {
        communityId: input.communityId,
        threadId: input.id,
      },
    }),
  ]
  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )
}

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
    attachments: true,
    isFeatured: true,
    isFeaturedUntil: true,
    isFeaturedFrom: true,
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
              featured: z.boolean(),
              name: z.string(),
              url: z.string().optional().nullable(),
              path: z.string().optional().nullable(),
              size: z.number().optional().nullable(),
              mimeType: z.string().optional().nullable(),
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

export const updateCommunityThreadSchema = createCommunityThreadSchema
  .partial()
  .extend({
    id: z.string(),
    communityId: z.string(),
  })
export const updateCommunityThread = async (
  input: z.infer<typeof updateCommunityThreadSchema>
) => {
  const snap = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("threads")
      .doc(input.id)
      .get()
  )
  if (snap.error || !snap.success || !snap.data.exists) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: snap.error?.message || "Error: Failed to get thread",
    })
  }

  const docRef = snap.data.ref
  const updateThread = await tryCatch(docRef.update(input))

  if (updateThread.error || !updateThread.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: updateThread.error?.message || "Error: Failed to update thread",
    })
  }

  const storage = useStorage()
  const keys = await storage.keys()

  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.threads.all",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.thread.detail",
      input: {
        communityId: input.communityId,
        threadId: input.id,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.feed.all",
      input: {
        communityId: input.communityId,
      },
    }),
  ]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )

  return input
}
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
  const [addThead] = await Promise.all([
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("threads")
        .doc(input.id)
        .set(payload)
    ),
    createCommunityFeedItem({
      type: "thread",
      group: "threads",
      groupDocId: input.id,
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
      isFeaturedFrom: null,
    }),
  ])

  if (addThead.error || !addThead.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: addThead.error?.message || "Error: Failed to create thread",
    })
  }

  const storage = useStorage()
  const keys = await storage.keys()

  const threadsKey = generateCacheKey({
    type: "query",
    path: "communities.threads.all",
    input: {
      communityId: input.communityId,
    },
  })

  const deleteKeys = [threadsKey]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )

  return payload
}
