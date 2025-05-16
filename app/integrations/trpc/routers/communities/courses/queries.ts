import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import { getContentDetail } from "../../content/queries"
import type {
  communityCourseSchema,
  communityEnrolmentsSchema,
} from "../schemas/communities-schema"

export const getCommunityCoursesSchema = z.object({
  communityId: z.string(),
})
const getCommunityCoursesOptions = trpcQuerySchema.extend({
  input: getCommunityCoursesSchema,
})
export const getCommunityCourses = async (
  options: z.infer<typeof getCommunityCoursesOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await db
        .collection("communities")
        .doc(options.input.communityId)
        .collection("courses")
        .get()

      let courses: any = []

      for (const doc of snap.docs) {
        const [enrolments, content] = await Promise.all([
          getCommunityCourseEnrolments({
            type: "query",
            path: "communities.courses.enrolments",
            input: {
              communityId: options.input.communityId,
              courseDocId: doc.id,
            },
            ctx: options.ctx,
            cacheGroup: options.cacheGroup,
          }),
          getContentDetail({
            type: "query",
            path: "content.detail",
            ctx: options.ctx,
            cacheGroup: "content",
            input: {
              params: {
                type: doc.data().typeAccessor,
                typeUid: doc.data().typeUid,
              },
            },
          }),
        ])
        courses.push({
          ...doc.data(),
          id: doc.id,
          enrolments: enrolments || [],
          content: content || null,
        })
      }
      return courses as z.infer<typeof communityCourseSchema>[]
    },
    {
      name: generateCacheKey({
        path: options.path,
        type: options.type,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )
  return cachedFetcher()
}

export const getCommunityCourseDetailSchema = z.object({
  communityId: z.string(),
  courseId: z.string(),
})
const getCommunityCourseDetailOptions = trpcQuerySchema.extend({
  input: getCommunityCourseDetailSchema,
})
export const getCommunityCourseDetail = async (
  options: z.infer<typeof getCommunityCourseDetailOptions>
) => {
  const enrolments = await getCommunityCourseEnrolments({
    type: "query",
    path: "communities.courses.enrolments",
    input: {
      communityId: options.input.communityId,
      courseDocId: options.input.courseId,
    },
    ctx: options.ctx,
    cacheGroup: options.cacheGroup,
  })

  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("courses")
          .doc(options.input.courseId)
          .get()
      )
      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Course not found",
        })
      }
      if (!snap.data.exists || !snap.data.data()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        })
      }

      const course = snap.data.data()
      const content = await getContentDetail({
        type: "query",
        path: "content.detail",
        ctx: options.ctx,
        cacheGroup: "content",
        input: {
          params: {
            type: course?.typeAccessor,
            typeUid: course?.typeUid,
          },
        },
      })

      return {
        ...course,
        id: snap.data.id,
        enrolments: enrolments || [],
        content: content || null,
      } as z.infer<typeof communityCourseSchema>
    },
    {
      name: generateCacheKey({
        path: options.path,
        type: options.type,
        input: options.input,
      }),
    }
  )
  return cachedFetcher()
}

export const getCommunityCourseEnrolmentsSchema = z.object({
  communityId: z.string(),
  courseDocId: z.string(),
})
const getCommunityCourseEnrolmentsOptions = trpcQuerySchema.extend({
  input: getCommunityCourseEnrolmentsSchema,
})
export const getCommunityCourseEnrolments = async (
  options: z.infer<typeof getCommunityCourseEnrolmentsOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collectionGroup("enrolments")
          .where("communityId", "==", options.input.communityId)
          .where("courseDocId", "==", options.input.courseDocId)
          .get()
      )
      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Enrolments not found",
        })
      }
      let enrolments: any = []
      if (snap.success && snap.data && !snap.data.empty) {
        snap.data.forEach((doc) => {
          enrolments.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }
      return enrolments as z.infer<typeof communityEnrolmentsSchema>[]
    },
    {
      name: generateCacheKey({
        path: options.path,
        type: options.type,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )
  return cachedFetcher()
}
