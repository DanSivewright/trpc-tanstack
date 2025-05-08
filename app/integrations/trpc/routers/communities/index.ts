import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import merge from "lodash.merge"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"
import { fetcher } from "@/lib/query"

import { protectedProcedure } from "../../init"
import {
  getAllCommunities,
  getAllCommunitiesAdminOf,
  getAllJoinedCommunities,
  getCommunityCourseDetail,
  getCommunityCourseDetailSchema,
  getCommunityCourseEnrolments,
  getCommunityCourseEnrolmentsSchema,
  getCommunityCourses,
  getCommunityCoursesSchema,
  getCommunityDetail,
  getCommunityDetailSchema,
} from "./queries"
import {
  communitySchema,
  feedCourseSchema,
  feedEnrolmentsSchema,
} from "./schemas/communities-schema"

const CACHE_GROUP = "communities"

export const communitiesRouter = {
  // @ts-ignore
  all: protectedProcedure.query(async ({ type, path, ctx }) => {
    return getAllCommunities({
      cacheGroup: CACHE_GROUP,
      type,
      path,
      ctx,
    })
  }),
  // @ts-ignore
  joined: protectedProcedure.query(async ({ ctx, type, path }) => {
    return getAllJoinedCommunities({
      cacheGroup: CACHE_GROUP,
      type,
      path,
      ctx,
    })
  }),
  adminOf: protectedProcedure.query(async ({ ctx }) => {
    return getAllCommunitiesAdminOf({
      cacheGroup: CACHE_GROUP,
      ctx,
    })
  }),
  detail: protectedProcedure
    .input(getCommunityDetailSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path, signal }) => {
      return getCommunityDetail({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),
  courses: protectedProcedure
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
  courseDetail: protectedProcedure
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
  courseEnrolments: protectedProcedure
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
  create: protectedProcedure
    .input(
      communitySchema.pick({
        id: true,
        name: true,
        headline: true,
        tags: true,
        authorUid: true,
        author: true,
        meta: true,
      })
    )
    .mutation(async ({ input }) => {
      const payload: Partial<z.infer<typeof communitySchema>> = {
        ...input,
        articlesCount: 0,
        membersCount: 1,
        coursesCount: 0,
        threadsCount: 0,
        content: {},
        status: "private",
        accessibile: "public",
        createdAt: new Date().toISOString(),
      }
      await db.collection("communities").doc(input.id).set(payload)

      await db
        .collection("communities")
        .doc(input.id)
        .collection("members")
        .doc(input.authorUid)
        .set({
          ...input.author,
          uid: input.authorUid,
          role: "admin",
          communityId: input.id,
          joinedAt: new Date().toISOString(),
        })
      const storage = useStorage()
      const key = `cache:${CACHE_GROUP}:${generateCacheKey({
        path: "communities.detail",
        type: "query",
        input: {
          id: input.id,
        },
      })}:.json`
      await storage.set(key, {
        ...payload,
        members: [
          {
            ...input.author,
            uid: input.authorUid,
            role: "admin",
            communityId: input.id,
            joinedAt: new Date().toISOString(),
          },
        ],
      })
      await storage.remove(
        generateCacheKey({
          path: "communities.joined",
          type: "query",
        })
      )
    }),

  createCourses: protectedProcedure
    .input(
      z.array(
        feedCourseSchema
          .pick({
            id: true,
            authorUid: true,
            author: true,
            communityId: true,
            typeUid: true,
            type: true,
            typeAccessor: true,
            publicationUid: true,
          })
          .merge(
            feedCourseSchema
              .omit({
                publicationUid: true,
                id: true,
                authorUid: true,
                author: true,
                communityId: true,
                typeUid: true,
                type: true,
                typeAccessor: true,
              })
              .partial()
          )
      )
    )
    .mutation(async ({ input, ctx }) => {
      const batch = db.batch()

      const enrolmentsMap = new Map<string, Set<string>>()
      const communityIds = new Set<string>()
      for (const course of input) {
        const { enrolments, ...courseData } = course
        communityIds.add(course.communityId)
        const courseRef = db
          .collection("communities")
          .doc(course.communityId)
          .collection("courses")
          .doc(course.id)

        batch.set(courseRef, {
          ...courseData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        // Create enrolments collection group if enrolments exist
        if (enrolments && enrolments.length > 0) {
          enrolmentsMap.set(
            course.publicationUid,
            enrolmentsMap.get(course.publicationUid)
              ? new Set([
                  ...(enrolmentsMap.get(course.publicationUid) ?? []),
                  ...enrolments?.map((e) => e.enrolleeUid),
                ])
              : new Set(enrolments?.map((e) => e.enrolleeUid))
          )
          for (const enrolment of enrolments) {
            const enrolmentRef = db
              .collection("communities")
              .doc(course.communityId)
              .collection("enrolments")
              .doc(enrolment.id)

            batch.set(enrolmentRef, {
              ...enrolment,
              communityId: course.communityId,
              courseDocId: course.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        }
      }

      await batch.commit()
      await Promise.all(
        Array.from(enrolmentsMap.entries()).map(
          ([publicationUid, enrolleeUids]) => {
            return tryCatch(
              fetcher({
                key: "enrol:people",
                ctx,
                input: {
                  params: {
                    publicationUid,
                  },
                  body: {
                    personUids: Array.from(enrolleeUids),
                  },
                  query: {
                    companyUid: ctx.companyUid ?? "",
                  },
                },
              })
            )
          }
        )
      )
      const storage = useStorage()
      const keys = await storage.keys()
      const coursesKeys = Array.from(communityIds).map((cid) => {
        return generateCacheKey({
          type: "query",
          path: "communities.courses",
          input: { communityId: cid },
        })
      })

      await Promise.all(
        coursesKeys.map((key) =>
          storage.remove(keys.find((k) => k.includes(key)) as string)
        )
      )
    }),
  update: protectedProcedure
    .input(
      communitySchema
        .pick({ id: true })
        .merge(
          communitySchema
            .omit({
              id: true,
              createdAt: true,
            })
            .partial()
        )
        .extend({
          members: z
            .array(communitySchema.shape.membership)
            .optional()
            .nullable(),
        })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, members, ...rest } = input
      const payload = { ...rest, updatedAt: new Date().toISOString() }
      await db.collection("communities").doc(id).update(payload)

      if (members) {
        const membersRef = db
          .collection("communities")
          .doc(id)
          .collection("members")

        const batch = db.batch()

        // First, get all existing members
        const existingMembers = await membersRef.get()

        // Delete all members except the current user
        existingMembers.forEach((doc) => {
          if (doc.id !== ctx.uid) {
            batch.delete(doc.ref)
          }
        })

        // Add new members (excluding the current user)
        for (const member of members) {
          if (member?.uid && member.uid !== ctx.uid) {
            batch.set(membersRef.doc(member.uid), member, { merge: true })
          }
        }

        await batch.commit()
      }

      const storage = useStorage()
      const cache = await getCommunityDetail({
        type: "query",
        path: "communities.detail",
        input: { id },
        cacheGroup: CACHE_GROUP,
        ctx,
      })

      if (cache) {
        let newMembers: any = []
        if (members && members.length > 0) {
          const membersSnap = await tryCatch(
            db
              .collectionGroup("members")
              .where("communityId", "==", id)
              .orderBy("joinedAt", "desc")
              .get()
          )

          if (
            membersSnap.success &&
            membersSnap.data &&
            !membersSnap.data.empty
          ) {
            membersSnap.data.forEach((doc) => {
              newMembers.push({
                ...doc.data(),
                id: doc.id,
              })
            })
          }
        }

        const update = merge({}, cache, {
          ...payload,
          ...(members &&
          members.length > 0 &&
          newMembers &&
          newMembers.length > 0
            ? { members: [...members, ...newMembers] }
            : {}),
        })
        await storage.set(
          `cache:${CACHE_GROUP}:${generateCacheKey({
            path: "communities.detail",
            type: "query",
            input: { id },
          })}:.json`,
          update
        )
      }
      if (payload.status === "public") {
        await storage.remove(
          generateCacheKey({
            path: "communities.all",
            type: "query",
          })
        )
      }
    }),
  updateCourse: protectedProcedure
    .input(
      feedCourseSchema
        .pick({
          status: true,
          accessibile: true,
          title: true,
          tags: true,
          caption: true,
          isFeatured: true,
          isFeaturedUntil: true,
        })
        .partial()
        .extend({
          id: z.string(),
          communityId: z.string(),
        })
    )
    .mutation(async ({ input }) => {
      const { id, ...payload } = input

      // First find the document in the collectionGroup
      const snap = await db
        .collection("communities")
        .doc(input.communityId)
        .collection("courses")
        .doc(input.id)
        .get()

      if (!snap.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        })
      }

      // Get the document reference and update it
      const docRef = snap.ref
      await docRef.update(payload)
      const storage = useStorage()
      const keys = await storage.keys()

      const courseDetailKey = generateCacheKey({
        type: "query",
        path: "communities.courseDetail",
        input: {
          courseId: input.id,
          communityId: input.communityId,
        },
      })

      const coursesKey = generateCacheKey({
        type: "query",
        path: "communities.courses",
        input: {
          communityId: input.communityId,
        },
      })

      await Promise.all([
        storage.remove(
          keys.find((key) => key.includes(courseDetailKey)) as string
        ),
        storage.remove(keys.find((key) => key.includes(coursesKey)) as string),
      ])

      return { success: true }
    }),
  deleteCourse: protectedProcedure
    .input(
      z.object({
        communityId: z.string(),
        courseId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { communityId, courseId } = input

      // First delete all related enrolments from the collectionGroup
      const enrolmentsSnap = await db
        .collectionGroup("enrolments")
        .where("communityId", "==", communityId)
        .where("courseDocId", "==", courseId)
        .get()

      const batch = db.batch()
      enrolmentsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      const courseRef = db
        .collection("communities")
        .doc(communityId)
        .collection("courses")
        .doc(courseId)
      batch.delete(courseRef)

      // Commit all deletions
      const remove = await tryCatch(batch.commit())
      console.log("remove:::", remove)

      const storage = useStorage()
      const keys = await storage.keys()

      const deleteKeys = [
        generateCacheKey({
          type: "query",
          path: "communities.courseDetail",
          input: {
            courseId: input.courseId,
            communityId: input.communityId,
          },
        }),
        generateCacheKey({
          type: "query",
          path: "communities.courses",
          input: {
            communityId: input.communityId,
          },
        }),
        generateCacheKey({
          type: "query",
          path: "communities.courseEnrolments",
          input: {
            courseDocId: input.courseId,
            communityId: input.communityId,
          },
        }),
      ]

      await Promise.all(
        deleteKeys.map((key) =>
          storage.remove(keys.find((k) => k.includes(key)) as string)
        )
      )

      return { success: true }
    }),
  selfEnrolToCourse: protectedProcedure
    .input(
      feedEnrolmentsSchema
        .pick({
          courseDocId: true,
          enrolleeUid: true,
          enrollee: true,
          publicationUid: true,
        })
        .extend({
          communityId: z.string(),
        })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = {
        ...input,
        id: crypto.randomUUID(),
        enrolmentUid: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorUid: ctx.uid,
      }
      const enrolFb = await tryCatch(
        db
          .collection("communities")
          .doc(input.communityId)
          .collection("enrolments")
          .doc(payload.id)
          .set(payload)
      )
      if (enrolFb.error || !enrolFb.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enrol to course",
        })
      }
      const enrolDb = await tryCatch(
        fetcher({
          key: "enrol:people",
          ctx,
          input: {
            params: {
              publicationUid: input.publicationUid,
            },
            body: {
              personUids: [input.enrolleeUid],
            },
            query: {
              companyUid: ctx.companyUid ?? "",
            },
          },
        })
      )
      if (enrolDb.error || !enrolDb.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enrol to course on API",
        })
      }

      const storage = useStorage()
      const keys = await storage.keys()

      const deleteKeys = [
        generateCacheKey({
          type: "query",
          path: "communities.courseDetail",
          input: {
            courseId: input.courseDocId,
            communityId: input.communityId,
          },
        }),
        generateCacheKey({
          type: "query",
          path: "communities.courses",
          input: {
            communityId: input.communityId,
          },
        }),
        generateCacheKey({
          type: "query",
          path: "communities.courseEnrolments",
          input: {
            courseDocId: input.courseDocId,
            communityId: input.communityId,
          },
        }),
      ]

      await Promise.all(
        deleteKeys.map((key) =>
          storage.remove(keys.find((k) => k.includes(key)) as string)
        )
      )
      return { success: true }
    }),
}
