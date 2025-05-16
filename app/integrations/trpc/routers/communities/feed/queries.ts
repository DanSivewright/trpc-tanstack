import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import { getCommunityCourseDetail } from "../courses/queries"
import type {
  commentFeedItemSchema,
  courseFeedItemSchema,
  threadFeedItemSchema,
} from "../schemas/communities-schema"
import { getCommunityThreadDetail } from "../threads/queries"

export const getCommunityFeedSchema = z.object({
  communityId: z.string(),
})
const getCommunityFeedOptions = trpcQuerySchema.extend({
  input: getCommunityFeedSchema,
})
export const getCommunityFeed = async (
  options: z.infer<typeof getCommunityFeedOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("feed")
          .orderBy("createdAt", "desc")
          .get()
      )
      let feed: any = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Feed not found",
        })
      }

      for (const doc of snap.data.docs) {
        let sourceData
        let collectionGroupData
        switch (doc.data().group) {
          case "threads":
            const threadSourceItem = doc?.data() as z.infer<
              typeof threadFeedItemSchema
            >
            sourceData = await getCommunityThreadDetail({
              type: "query",
              path: "communities.thread.detail",
              input: {
                communityId: threadSourceItem.input.communityId,
                threadId: threadSourceItem.input.threadId,
              },
              ctx: options.ctx,
              cacheGroup: options.cacheGroup,
            })

            break

          case "comments":
            // collectionGrouData
            const commentsGroupItem = doc?.data() as z.infer<
              typeof commentFeedItemSchema
            >

            if (commentsGroupItem?.input?.accessorGroup === "threads") {
              collectionGroupData = await getCommunityThreadDetail({
                type: "query",
                path: "communities.thread.detail",
                input: {
                  communityId: commentsGroupItem.input.communityId,
                  threadId: commentsGroupItem.input.accessorGroupDocId,
                },
                ctx: options.ctx,
                cacheGroup: options.cacheGroup,
              })
            }

            break
          case "courses":
            const courseSourceItem = doc?.data() as z.infer<
              typeof courseFeedItemSchema
            >
            sourceData = await getCommunityCourseDetail({
              type: "query",
              path: "communities.courses.detail",
              input: {
                communityId: courseSourceItem.input.communityId,
                courseId: courseSourceItem.input.courseId,
              },
              ctx: options.ctx,
              cacheGroup: options.cacheGroup,
            })
            break
          default:
            break
        }

        feed.push({
          ...doc.data(),
          id: doc.id,
          data: sourceData,
          groupData: collectionGroupData,
        })
      }

      return feed as z.infer<typeof threadFeedItemSchema>[]
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
