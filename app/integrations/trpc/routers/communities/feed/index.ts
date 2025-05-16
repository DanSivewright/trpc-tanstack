import { protectedProcedure } from "@/integrations/trpc/init"

import {
  createCommunityFeedItem,
  createCommunityFeedItemSchema,
} from "./mutations"
import { getCommunityFeed, getCommunityFeedSchema } from "./queries"

const CACHE_GROUP = "communities"
export const communitiesFeedRouter = {
  all: protectedProcedure
    .input(getCommunityFeedSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityFeed({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  create: protectedProcedure
    .input(createCommunityFeedItemSchema)
    .mutation(async ({ input }) => {
      return createCommunityFeedItem(input)
    }),
}
