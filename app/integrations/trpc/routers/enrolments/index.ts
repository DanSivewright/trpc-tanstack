import { protectedProcedure } from "../../init"
import {
  getAllEnrolments,
  getAllEnrolmentsSchema,
  getEnrolmentActivity,
  getEnrolmentActivitySchema,
  getEnrolmentDetail,
  getEnrolmentDetailSchema,
  getEnrolmentResources,
  getEnrolmentResourcesSchema,
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
  resources: protectedProcedure
    .input(getEnrolmentResourcesSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getEnrolmentResources({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),
  activity: protectedProcedure
    .input(getEnrolmentActivitySchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) =>
      getEnrolmentActivity({ ctx, input, type, path, cacheGroup: CACHE_GROUP })
    ),
}
