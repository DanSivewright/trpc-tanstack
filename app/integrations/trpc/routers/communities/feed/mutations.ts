import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import type { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import { communityFeedItemInputSchema } from "../schemas/communities-schema"

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
    path: "communities.feed.all",
    input: {
      communityId: input.communityId,
    },
  })
  await storage.remove(keys.find((k) => k.includes(feedKey)) as string)
  return input
}
