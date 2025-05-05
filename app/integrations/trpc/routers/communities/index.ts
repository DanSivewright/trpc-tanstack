import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import merge from "lodash.merge"
import { z } from "zod"

import { cachedFunction, generateCacheKey, useStorage } from "@/lib/cache"
import { fetcher } from "@/lib/query"

import { protectedProcedure } from "../../init"
import {
  communitySchema,
  feedCourseSchema,
  type communitiesAllSchema,
  type communitiesJoinedSchema,
} from "./schemas/communities-schema"

const CACHE_GROUP = "communities"

async function getCommunities(options: { type: string; path: string }) {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await db.collection("communities").get()
      let data: any = []

      for (const doc of snap.docs) {
        const members = await getMembers({
          type: options.type,
          path: options.path,
          input: { communityId: doc.id },
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
      group: CACHE_GROUP,
    }
  )

  return cachedFetcher()
}

async function getMembers(options: {
  type: string
  path: string
  input: { communityId: string }
}) {
  const cachedFetcher = cachedFunction(async () => {
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
  })
  return cachedFetcher()
}

async function getCommunity(options: {
  type: string
  path: string
  input: any
}) {
  const cachedFetcher = cachedFunction(
    async () => {
      const [comSnap, members] = await Promise.all([
        tryCatch(db.collection("communities").doc(options.input.id).get()),
        getMembers({
          type: options.type,
          path: options.path,
          input: { communityId: options.input.id },
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
      } as z.infer<typeof communitySchema>
    },
    {
      name: generateCacheKey({
        path: options.path,
        type: options.type,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: CACHE_GROUP,
    }
  )
  return cachedFetcher()
}

export const communitiesRouter = {
  // @ts-ignore
  all: protectedProcedure.query(async ({ type, path, ctx }) => {
    return getCommunities({ type, path })
  }),
  // @ts-ignore
  joined: protectedProcedure.query(async ({ ctx, sin, type, path }) => {
    const communities = await getCommunities({
      type: "query",
      path: "communities.all",
    })

    const joinedCommunities = communities
      .filter((com) => com.members?.some((m) => m.uid === ctx.uid))
      .map((com) => ({
        ...com,
        membership: com.members?.find((m) => m.uid === ctx.uid),
      }))

    return joinedCommunities as z.infer<typeof communitiesJoinedSchema>
  }),
  adminOf: protectedProcedure.query(async ({ ctx }) => {
    const communities = await getCommunities({
      type: "query",
      path: "communities.all",
    })
    const adminOfCommunities = communities
      .filter((com) =>
        com.members?.some((m) => m.uid === ctx.uid && m.role === "admin")
      )
      .map((com) => ({
        ...com,
        membership: com.members?.find((m) => m.uid === ctx.uid),
      }))
    return adminOfCommunities as z.infer<typeof communitiesJoinedSchema>
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunity({ type, path, input })
    }),
  courses: protectedProcedure
    .input(
      z.object({
        communityId: z.string(),
      })
    )
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const cachedFetcher = cachedFunction(
        async () => {
          const { success, error, data } = await tryCatch(
            db
              .collection("communities")
              .doc(input.communityId)
              .collection("courses")
              .get()
          )
          if (error || !success) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error?.message || "Courses not found",
            })
          }
          let courses: any = []
          if (success && data && !data.empty) {
            data.forEach((doc) => {
              courses.push({
                ...doc.data(),
                id: doc.id,
              })
            })
          }
          return courses as z.infer<typeof feedCourseSchema>[]
        },
        {
          name: generateCacheKey({
            path,
            type,
            input,
          }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
          group: CACHE_GROUP,
        }
      )
      return cachedFetcher()
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
                  body: JSON.stringify({
                    personUids: Array.from(enrolleeUids).join(","),
                  }),
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
      const cache = await getCommunity({
        type: "query",
        path: "communities.detail",
        input: { id },
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
