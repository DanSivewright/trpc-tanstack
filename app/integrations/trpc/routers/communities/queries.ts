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
  communityCommentSchema,
  communityCourseSchema,
  communityEnrolmentsSchema,
  communitySchema,
  communityThreadSchema,
  threadFeedItemSchema,
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
        db.collection("communities").doc(options.input.id).get(),
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

      // if (comSnap.error || !comSnap.success) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: comSnap.error?.message || "Community not found",
      //   })
      // }

      // if (!comSnap.data.exists) return null

      // if (!comSnap.data) {
      //   return null
      // }
      return {
        id: comSnap.id,
        ...comSnap.data(),
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
    path: "communities.courseEnrolments",
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

export const getCommunityThreadsSchema = z.object({
  communityId: z.string(),
})
const getCommunityThreadsOptions = trpcQuerySchema.extend({
  input: getCommunityThreadsSchema,
})
export const getCommunityThreads = async (
  options: z.infer<typeof getCommunityThreadsOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("threads")
          .get()
      )
      let threads: any = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Threads not found",
        })
      }

      if (snap.success && snap.data) {
        snap.data.forEach((doc) => {
          threads.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }

      return threads as z.infer<typeof communityThreadSchema>[]
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

export const getCommunityThreadDetailSchema = z.object({
  communityId: z.string(),
  threadId: z.string(),
})
const getCommunityThreadDetailOptions = trpcQuerySchema.extend({
  input: getCommunityThreadDetailSchema,
})
export const getCommunityThreadDetail = async (
  options: z.infer<typeof getCommunityThreadDetailOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("threads")
          .doc(options.input.threadId)
          .get()
      )
      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Thread not found",
        })
      }
      if (!snap.data.exists || !snap.data.data()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        })
      }

      const thread = snap.data.data()
      return {
        ...thread,
        id: snap.data.id,
      } as z.infer<typeof communityThreadSchema>
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

export const getCommunityFeedSchema = z.object({
  communityId: z.string(),
})
const getCommunityFeedOptions = trpcQuerySchema.extend({
  input: getCommunityFeedSchema,
})
export const getCommunityFeed = async (
  options: z.infer<typeof getCommunityFeedOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("feed")
          .orderBy("createdAt", "desc")
          .get()
      )
      let feed: any = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Feed not found",
        })
      }

      for (const doc of snap.data.docs) {
        let collectionGroupData
        switch (doc.data().group) {
          case "threads":
            const threadSourceItem = doc?.data() as z.infer<
              typeof threadFeedItemSchema
            >
            collectionGroupData = await getCommunityThreadDetail({
              type: "query",
              path: "communities.threadDetail",
              input: {
                communityId: threadSourceItem.input.communityId,
                threadId: threadSourceItem.input.threadId,
              },
              ctx: options.ctx,
              cacheGroup: options.cacheGroup,
            })

            break
          default:
            break
        }

        feed.push({
          ...doc.data(),
          id: doc.id,
          data: collectionGroupData,
        })
      }

      return feed as z.infer<typeof threadFeedItemSchema>[]
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

export const interactionsCountForCollectionGroupSchema = z.object({
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
  interactionType: z.enum(["likes", "comments"]),
  communityId: z.string(),
})
const interactionsCountForCollectionGroupOptions = trpcQuerySchema.extend({
  input: interactionsCountForCollectionGroupSchema,
})
export const getinteractionsCountForCollectionGroup = async (
  options: z.infer<typeof interactionsCountForCollectionGroupOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const [snap, createdByMe] = await Promise.all([
        tryCatch(
          db
            .collection("communities")
            .doc(options.input.communityId)
            .collection(options.input.interactionType)
            .where("collectionGroup", "==", options.input.collectionGroup)
            .where(
              "collectionGroupDocId",
              "==",
              options.input.collectionGroupDocId
            )
            .count()
            .get()
        ),
        tryCatch(
          db
            .collection("communities")
            .doc(options.input.communityId)
            .collection(options.input.interactionType)
            .where("collectionGroup", "==", options.input.collectionGroup)
            .where(
              "collectionGroupDocId",
              "==",
              options.input.collectionGroupDocId
            )
            .where("authorUid", "==", options.ctx.uid)
            .get()
        ),
      ])

      if (snap.error || !snap.success) {
        console.error(snap.error)
        return {
          total: 0,
          byMe: createdByMe.success && createdByMe.data?.docs.length > 0,
          id: (createdByMe.success && createdByMe.data?.docs[0]?.id) || null,
        }
      }

      return {
        total: snap.data.data().count || 0,
        byMe: createdByMe.success && createdByMe.data?.docs.length > 0,
        id: (createdByMe.success && createdByMe.data?.docs[0]?.id) || null,
      }
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

export const getCommunityCommentsSchema = z.object({
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
  communityId: z.string(),
})
const getCommunityCommentsOptions = trpcQuerySchema.extend({
  input: getCommunityCommentsSchema,
})
export const getCommunityComments = async (
  options: z.infer<typeof getCommunityCommentsOptions>
) => {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await tryCatch(
        db
          .collection("communities")
          .doc(options.input.communityId)
          .collection("comments")
          .where("collectionGroup", "==", options.input.collectionGroup)
          .where(
            "collectionGroupDocId",
            "==",
            options.input.collectionGroupDocId
          )
          .orderBy("createdAt", "desc")
          .get()
      )
      let comments: z.infer<typeof communityCommentSchema>[] = []

      if (snap.error || !snap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: snap.error?.message || "Comments not found",
        })
      }

      snap.data.forEach((doc) => {
        const c = doc.data() as z.infer<typeof communityCommentSchema>
        comments.push({
          ...c,
          id: doc.id,
          byMe: doc.data().authorUid === options.ctx.uid,
        })
      })

      // Sort comments by likesCount, commentsCount, and createdAt
      comments.sort((a: any, b: any) => {
        // First compare by likesCount (if available)
        const aLikes = a.likesCount || 0
        const bLikes = b.likesCount || 0
        if (aLikes !== bLikes) {
          return bLikes - aLikes // Descending order
        }

        // Then compare by commentsCount (if available)
        const aComments = a.commentsCount || 0
        const bComments = b.commentsCount || 0
        if (aComments !== bComments) {
          return bComments - aComments // Descending order
        }

        // Finally, sort by createdAt (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      // return buildNestedCommentsTree(comments)
      return comments as z.infer<typeof communityCommentSchema>[]
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
