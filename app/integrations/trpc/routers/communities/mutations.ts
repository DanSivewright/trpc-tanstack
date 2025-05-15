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
  //   await db.collectionGroup("threads").doc(input.id).set(payload)
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
      path: "communities.threads",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.threadDetail",
      input: {
        communityId: input.communityId,
        threadId: input.id,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.feed",
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
  }

  const addFeedItem = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("feed")
      .add(threadFeedItem)
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

export const createCommentSchema = communityCommentSchema
export const createComment = async (
  input: z.infer<typeof createCommentSchema>
) => {
  const payload = {
    ...input,
    createdAt: new Date().toISOString(),
  }

  const [addComment, _] = await Promise.all([
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection("comments")
        .doc(input.id)
        .set(payload)
    ),
    tryCatch(
      db
        .collection("communities")
        .doc(input.communityId)
        .collection(input.collectionGroup)
        .doc(input.collectionGroupDocId)
        .update({
          commentsCount: FieldValue.increment(1),
        })
    ),
  ])
  if (addComment.error || !addComment.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to create comment",
    })
  }

  // const updateParent

  const storage = useStorage()
  const keys = await storage.keys()

  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.interactionsCountForCollectionGroup",
      input: {
        collectionGroup: input.collectionGroup,
        collectionGroupDocId: input.collectionGroupDocId,
        communityId: input.communityId,
        interactionType: "comments",
      },
    }),
    // INVALIDATE COMMENTS TO COLLECTION GROUP
    generateCacheKey({
      type: "query",
      path: "communities.comments",
      input: {
        communityId: input.communityId,
        collectionGroup: input.collectionGroup,
        collectionGroupDocId: input.collectionGroupDocId,
      },
    }),
  ]
  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )

  return payload
}

export const updateCommentSchema = communityCommentSchema.partial().extend({
  id: z.string(),
  communityId: z.string(),
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
})
export const updateComment = async (
  input: z.infer<typeof updateCommentSchema>
) => {
  let payload = {
    ...input,
    updatedAt: new Date().toISOString(),
  } as z.infer<typeof updateCommentSchema>

  const snap = await db
    .collection("communities")
    .doc(input.communityId)
    .collection("comments")
    .doc(input.id)
    .get()

  if (!snap.exists) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Comment not found",
    })
  }

  const idsToInvalidate = new Set<string>()
  idsToInvalidate.add(input.id)
  const docRef = snap.ref
  if (input?.deletedAt) {
    const batch = db.batch()
    batch.update(docRef, payload)

    const childComments = await db
      .collection("communities")
      .doc(input.communityId)
      .collection("comments")
      .where("rootParentCommentId", "==", input.id)
      .get()

    childComments.docs.forEach((doc) => {
      idsToInvalidate.add(doc.id)
      batch.update(doc.ref, {
        deletedAt: input.deletedAt,
        status: "hidden",
      })
    })

    await batch.commit()
  } else {
    await docRef.update(payload)
  }

  const storage = useStorage()
  const keys = await storage.keys()
  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.interactionsCountForCollectionGroup",
      input: {
        collectionGroup: input.collectionGroup,
        collectionGroupDocId: input.collectionGroupDocId,
        communityId: input.communityId,
        interactionType: "comments",
      },
    }),
    // INVALIDATE COMMENTS TO COLLECTION GROUP
    ...Array.from(idsToInvalidate).map((id) =>
      generateCacheKey({
        type: "query",
        path: "communities.comments",
        input: {
          communityId: input.communityId,
          collectionGroup: input.collectionGroup,
          collectionGroupDocId: input.collectionGroupDocId,
        },
      })
    ),
  ]
  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )
  return payload
}

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
      path: "communities.comments",
      input: {
        communityId: input.communityId,
        collectionGroup: "threads",
        collectionGroupDocId: input.id,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.threads",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.feed",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.threadDetail",
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

export const createCommunityFeedItemSchema = communityFeedItemInputSchema
export const createCommunityFeedItem = async (
  input: z.infer<typeof createCommunityFeedItemSchema>
) => {
  const snap = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("feed")
      .add(input)
  )
  if (snap.error || !snap.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error: failed to create feed item",
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
  await storage.remove(keys.find((k) => k.includes(feedKey)) as string)
  return input
}
