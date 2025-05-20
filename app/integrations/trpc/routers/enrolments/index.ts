import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { protectedProcedure } from "../../init"
import {
  getAllEnrolments,
  getAllEnrolmentsSchema,
  getEnrolmentActivity,
  getEnrolmentActivitySchema,
  getEnrolmentDetail,
  getEnrolmentDetailSchema,
} from "./queries"

const CACHE_GROUP = "enrolments"
export const enrolmentsRouter = {
  all: protectedProcedure
    .input(getAllEnrolmentsSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getAllEnrolments({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),
  detail: protectedProcedure
    .input(getEnrolmentDetailSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const detail = await getEnrolmentDetail({
        ctx,
        input,
        type,
        path,
        cacheGroup: CACHE_GROUP,
      })

      if (input.addOns?.withActivity) {
        const activity = await getEnrolmentActivity({
          ctx,
          input: { params: { uid: input.params.uid } },
          type,
          path,
          cacheGroup: CACHE_GROUP,
        })
        return {
          ...detail,
          activity,
        }
      }

      return detail
    }),
  activity: protectedProcedure
    .input(getEnrolmentActivitySchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getEnrolmentActivity({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),
}
