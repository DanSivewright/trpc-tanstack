import { protectedProcedure } from "../../init"
import {
  getAllContent,
  getAllContentSchema,
  getContentDetail,
  getContentDetailSchema,
  getContentEnrolments,
  getContentEnrolmentsSchema,
  getContentModules,
  getContentModulesSchema,
  getContentModulesVersion,
  getContentModulesVersionSchema,
} from "./queries"

const CACHE_GROUP = "content"
export const contentRouter = {
  all: protectedProcedure
    .input(getAllContentSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getAllContent({
        ctx,
        input,
        type,
        path,
        cacheGroup: CACHE_GROUP,
      })
    ),

  detail: protectedProcedure
    .input(getContentDetailSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getContentDetail({
        ctx,
        input,
        type,
        path,
        cacheGroup: CACHE_GROUP,
      })
    ),

  modules: protectedProcedure
    .input(getContentModulesSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getContentModules({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),

  modulesVersion: protectedProcedure
    .input(getContentModulesVersionSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getContentModulesVersion({
        ctx,
        input,
        type,
        path,
        cacheGroup: CACHE_GROUP,
      })
    ),

  enrolments: protectedProcedure
    .input(getContentEnrolmentsSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getContentEnrolments({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),
}
