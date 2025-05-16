import { protectedProcedure } from "@/integrations/trpc/init"

import {
  createCommunityThread,
  createCommunityThreadSchema,
  deleteThreadAndRelations,
  deleteThreadAndRelationsSchema,
  updateCommunityThread,
  updateCommunityThreadSchema,
} from "./mutations"
import {
  getCommunityThreadDetail,
  getCommunityThreadDetailSchema,
  getCommunityThreads,
  getCommunityThreadsSchema,
} from "./queries"

const CACHE_GROUP = "communities"
export const communityThreadsRouter = {
  all: protectedProcedure
    .input(getCommunityThreadsSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityThreads({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  detail: protectedProcedure
    .input(getCommunityThreadDetailSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityThreadDetail({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  create: protectedProcedure
    .input(createCommunityThreadSchema)
    .mutation(async ({ input }) => {
      return createCommunityThread(input)
    }),
  update: protectedProcedure
    .input(updateCommunityThreadSchema)
    .mutation(async ({ input }) => {
      return updateCommunityThread(input)
    }),
  delete: protectedProcedure
    .input(deleteThreadAndRelationsSchema)
    .mutation(async ({ input }) => {
      return deleteThreadAndRelations(input)
    }),
}
