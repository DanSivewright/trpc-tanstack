import { protectedProcedure } from "@/integrations/trpc/init"

import { getCommunityArticles, getCommunityArticlesSchema } from "./queries"

const CACHE_GROUP = "communities"

export const communityArticlesRouter = {
  all: protectedProcedure
    .input(getCommunityArticlesSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityArticles({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
}
