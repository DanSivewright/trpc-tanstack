import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { feedThreadSchema } from "./schemas/communities-schema"

export const createThreadSchema = feedThreadSchema.pick({
  id: true,
  title: true,
  caption: true,
  author: true,
  authorUid: true,
  type: true,
  communityId: true,
  status: true,
  accessibile: true,
  tags: true,
  images: true,
  meta: true,
})

export const createThread = async (
  input: z.infer<typeof createThreadSchema>
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
  //   const storage = useStorage()
  // TODO: INVALIDATE THREADS EPS WHEN THEY EXIST
  return payload
}
