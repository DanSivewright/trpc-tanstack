import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import type { communityArticleSchema } from "../schemas/communities-schema"

export const getCommunityArticlesSchema = z.object({
  communityId: z.string(),
})
const getCommunityArticlesOptions = trpcQuerySchema.extend({
  input: getCommunityArticlesSchema,
})
export const getCommunityArticles = async (
  options: z.infer<typeof getCommunityArticlesOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("articles")
          .get()
      )
      let articles: any = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Threads not found",
        })
      }

      if (snap.success && snap.data) {
        snap.data.forEach((doc) => {
          articles.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }

      return articles as z.infer<typeof communityArticleSchema>[]
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
