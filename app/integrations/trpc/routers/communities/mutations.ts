import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { communityThreadSchema } from "./schemas/communities-schema"

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
  //   const storage = useStorage()
  // TODO: INVALIDATE THREADS EPS WHEN THEY EXIST
  return payload
}
