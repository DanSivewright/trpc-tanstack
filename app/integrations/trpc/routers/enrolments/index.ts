import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

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
  bookmarks: protectedProcedure
    .input(
      z.object({
        identifierKey: z.enum([
          "enrolmentUid",
          "moduleUid",
          "lessonUid",
          "cardId",
        ]),
        identifier: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const snap = await tryCatch(
        db
          .collection("bookmarks")
          .where("authUid", "==", ctx?.uid)
          .where(input.identifierKey, "==", input.identifier)
          .get()
      )
      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Bookmarks not found",
        })
      }

      let data: any = []

      snap.data.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      const schema = z.array(
        z.object({
          id: z.string(),
          bookmarked: z.boolean(),
          createdAt: z.string(),
          updatedAt: z.string(),
          authUid: z.string(),
          key: z.enum(["enrolment", "card", "lesson", "module", "page"]),
          lessonUid: z.string().nullable().optional(),
          enrolmentUid: z.string().nullable().optional(),
          moduleUid: z.string().nullable().optional(),
          cardId: z.string().nullable().optional(),
        })
      )
      return data as z.infer<typeof schema>
    }),
}
