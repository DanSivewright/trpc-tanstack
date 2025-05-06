import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
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
import { communitySchema, feedCourseSchema } from "./schemas/communities-schema"

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
      const enrolments = await Promise.all(
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
      console.log("enrol:::", enrolments)
      const storage = useStorage()
      await Promise.all(
        Array.from(communityIds).map((communityId) => {
          return storage.remove(
            generateCacheKey({
              path: "communities.courses",
              type: "query",
              input: { communityId },
            })
          )
        })
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
}
