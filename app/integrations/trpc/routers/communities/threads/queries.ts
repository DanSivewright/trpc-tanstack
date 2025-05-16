import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import type { communityThreadSchema } from "../schemas/communities-schema"

export const getCommunityThreadsSchema = z.object({
  communityId: z.string(),
})
const getCommunityThreadsOptions = trpcQuerySchema.extend({
  input: getCommunityThreadsSchema,
})
export const getCommunityThreads = async (
  options: z.infer<typeof getCommunityThreadsOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("threads")
          .get()
      )
      let threads: any = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Threads not found",
        })
      }

      if (snap.success && snap.data) {
        snap.data.forEach((doc) => {
          threads.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }

      return threads as z.infer<typeof communityThreadSchema>[]
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

export const getCommunityThreadDetailSchema = z.object({
  communityId: z.string(),
  threadId: z.string(),
})
const getCommunityThreadDetailOptions = trpcQuerySchema.extend({
  input: getCommunityThreadDetailSchema,
})
export const getCommunityThreadDetail = async (
  options: z.infer<typeof getCommunityThreadDetailOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("threads")
          .doc(options.input.threadId)
          .get()
      )
      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Thread not found",
        })
      }
      if (!snap.data.exists || !snap.data.data()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        })
      }

      const thread = snap.data.data()
      return {
        ...thread,
        id: snap.data.id,
      } as z.infer<typeof communityThreadSchema>
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
