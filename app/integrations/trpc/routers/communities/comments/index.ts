import { protectedProcedure } from "@/integrations/trpc/init"

import {
  createComment,
  createCommentSchema,
  updateComment,
  updateCommentSchema,
} from "./mutations"
import { getCommunityComments, getCommunityCommentsSchema } from "./queries"

const CACHE_GROUP = "communities"
export const communityCommentsRouter = {
  all: protectedProcedure
    .input(getCommunityCommentsSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityComments({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  create: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input }) => {
      return createComment(input)
    }),
  update: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ input }) => {
      return updateComment(input)
    }),
}
