import { protectedProcedure } from "@/integrations/trpc/init"

import {
  createCommunityCourse,
  createCommunityCourseSchema,
  deleteCommunityCourse,
  deleteCommunityCourseSchema,
  enrolToCommunityCourse,
  enrolToCommunityCourseSchema,
  updateCommunityCourse,
  updateCommunityCourseSchema,
} from "./mutations"
import {
  getCommunityCourseDetail,
  getCommunityCourseDetailSchema,
  getCommunityCourseEnrolments,
  getCommunityCourseEnrolmentsSchema,
  getCommunityCourses,
  getCommunityCoursesSchema,
} from "./queries"

const CACHE_GROUP = "communities"
export const communityCoursesRouter = {
  all: protectedProcedure
    .input(getCommunityCoursesSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityCourses({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  detail: protectedProcedure
    .input(getCommunityCourseDetailSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityCourseDetail({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  enrolments: protectedProcedure
    .input(getCommunityCourseEnrolmentsSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunityCourseEnrolments({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  enrol: protectedProcedure
    .input(enrolToCommunityCourseSchema)
    .mutation(async ({ input, ctx }) => {
      return enrolToCommunityCourse({ input, ctx })
    }),
  create: protectedProcedure
    .input(createCommunityCourseSchema)
    .mutation(async ({ input, ctx }) => {
      return createCommunityCourse({
        input,
        ctx,
      })
    }),
  update: protectedProcedure
    .input(updateCommunityCourseSchema)
    .mutation(async ({ input }) => {
      return updateCommunityCourse(input)
    }),
  delete: protectedProcedure
    .input(deleteCommunityCourseSchema)
    .mutation(async ({ input }) => {
      return deleteCommunityCourse(input)
    }),
}
