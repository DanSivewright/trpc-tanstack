import { protectedProcedure } from "@/integrations/trpc/init"
import { z } from "zod"

import { getCommunityArticles } from "../articles/queries"
import { getCommunityCourses } from "../courses/queries"
import { getCommunityThreads } from "../threads/queries"

export const communityEventsRouter = {
  all: protectedProcedure
    .input(
      z.object({
        communityId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const colGroups = await Promise.all([
        getCommunityCourses({
          cacheGroup: "communities",
          type: "query",
          path: "communities.courses.all",
          input: {
            communityId: input.communityId,
          },
          ctx,
        }),
        getCommunityThreads({
          cacheGroup: "communities",
          type: "query",
          path: "communities.threads.all",
          input: { communityId: input.communityId },
          ctx,
        }),
        getCommunityArticles({
          cacheGroup: "communities",
          type: "query",
          path: "communities.articles.all",
          input: { communityId: input.communityId },
          ctx,
        }),
      ])
      return colGroups
        .flatMap((colGroup) => [...colGroup])
        .filter(
          (groupItem) => groupItem.isFeatured && groupItem.isFeaturedUntil
        )
    }),
}
