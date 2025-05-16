import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import { communityCommentSchema } from "../schemas/communities-schema"

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
      path: "communities.comments.all",
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
        path: "communities.comments.all",
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
