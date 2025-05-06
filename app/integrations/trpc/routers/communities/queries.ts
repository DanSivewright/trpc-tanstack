import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import { trpcQuerySchema, type TRPCQuerySchema } from "../../schema"
import { getContentDetail } from "../content/queries"
import type {
  communitiesAllSchema,
  communitiesJoinedSchema,
  communitySchema,
  feedCourseSchema,
  feedEnrolmentsSchema,
} from "./schemas/communities-schema"

export const getAllCommunities = async (options: TRPCQuerySchema) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await db.collection("communities").get()
      let data: any = []

      for (const doc of snap.docs) {
        const members = await getMembersForCommunity({
          type: "query",
          path: "communities.members",
          cacheGroup: options.cacheGroup,
          ctx: options.ctx,
          input: {
            communityId: doc.id,
          },
        })

        data.push({
          id: doc.id,
          ...doc.data(),
          membersCount: members.length,
          members: members,
        })
      }

      return data as z.infer<typeof communitiesAllSchema>
    },
    {
      name: generateCacheKey({ type: options.type, path: options.path }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )

  return cachedFetcher()
}

export const getMembersForCommunitySchema = z.object({
  communityId: z.string(),
})
const extendedSchema = trpcQuerySchema.extend({
  input: getMembersForCommunitySchema,
})
export const getMembersForCommunity = async (
  options: z.infer<typeof extendedSchema>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collectionGroup("members")
          .where("communityId", "==", options.input.communityId)
          .orderBy("joinedAt", "desc")
          .get()
      )
      let members: any = []
      if (snap.success && snap.data && !snap.data.empty) {
        snap.data.forEach((doc) => {
          members.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }
      return members
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

export const getAllJoinedCommunities = async (options: TRPCQuerySchema) => {
  const communities = await getAllCommunities({
    ...options,
    path: "communities.all",
  })
  const joinedCommunities = communities
    .filter((com) => com.members?.some((m) => m.uid === options.ctx.uid))
    .map((com) => ({
      ...com,
      membership: com.members?.find((m) => m.uid === options.ctx.uid),
    }))

  return joinedCommunities as z.infer<typeof communitiesJoinedSchema>
}

export const getAllCommunitiesAdminOf = async (
  options: Pick<TRPCQuerySchema, "ctx" | "cacheGroup">
) => {
  const communities = await getAllCommunities({
    type: "query",
    path: "communities.all",
    cacheGroup: options.cacheGroup,
    ctx: options.ctx,
  })
  const joinedCommunities = communities
    .filter((com) =>
      com.members?.some((m) => m.uid === options.ctx.uid && m.role === "admin")
    )
    .map((com) => ({
      ...com,
      membership: com.members?.find((m) => m.uid === options.ctx.uid),
    }))

  return joinedCommunities as z.infer<typeof communitiesJoinedSchema>
}

export const getCommunityDetailSchema = z.object({
  id: z.string(),
})
const getCommunityOptions = trpcQuerySchema.extend({
  input: getCommunityDetailSchema,
})
export const getCommunityDetail = async (
  options: z.infer<typeof getCommunityOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const [comSnap, members] = await Promise.all([
        tryCatch(db.collection("communities").doc(options.input.id).get()),
        getMembersForCommunity({
          type: "query",
          path: "communities.members",
          cacheGroup: options.cacheGroup,
          input: {
            communityId: options.input.id,
          },
          ctx: options.ctx,
        }),
      ])

      if (comSnap.error || !comSnap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: comSnap.error?.message || "Community not found",
        })
      }

      if (!comSnap.data.exists) return null

      if (!comSnap.data) {
        return null
      }
      return {
        id: comSnap.data.id,
        ...comSnap.data.data(),
        membersCount: members.length,
        members: members,
        membership: members.find((m: any) => m.uid === options.ctx.uid) || null,
      } as z.infer<typeof communitySchema>
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
            path: "communities.courseEnrolments",
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
      return courses as z.infer<typeof feedCourseSchema>[]
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
    path: "communities.courseEnrolments",
    input: {
      communityId: options.input.communityId,
      courseDocId: options.input.courseId,
    },
    ctx: options.ctx,
    cacheGroup: options.cacheGroup,
  })

  const cachedFetcher = cachedFunction(async () => {
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
    } as z.infer<typeof feedCourseSchema>
  })
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
      return enrolments as z.infer<typeof feedEnrolmentsSchema>[]
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
