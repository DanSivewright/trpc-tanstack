import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import merge from "lodash.merge"
import { z } from "zod"

import { cachedFunction, generateCacheKey, useStorage } from "@/lib/cache"

import { protectedProcedure } from "../../init"
import {
  communitySchema,
  type communitiesAllSchema,
  type communitiesJoinedSchema,
} from "./schemas/communities-schema"

const CACHE_GROUP = "communities"

async function getCommunities(options: { type: string; path: string }) {
  const cachedFetcher = cachedFunction(
    async () => {
      const snap = await db.collection("communities").get()
      let data: any = []
      snap.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        })
      })
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

async function getCommunity(options: {
  type: string
  path: string
  input: any
}) {
  const cachedFetcher = cachedFunction(
    async () => {
      const [comSnap, memSnap] = await Promise.all([
        tryCatch(db.collection("communities").doc(options.input.id).get()),
        tryCatch(
          db
            .collectionGroup("members")
            .where("communityId", "==", options.input.id)
            .orderBy("joinedAt", "desc")
            .get()
        ),
      ])

      if (comSnap.error || !comSnap.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: comSnap.error?.message || "Community not found",
        })
      }

      if (!comSnap.data.exists) return null

      let members: any = []
      if (memSnap.success && memSnap.data && !memSnap.data.empty) {
        memSnap.data.forEach((doc) => {
          members.push({
            ...doc.data(),
            id: doc.id,
          })
        })
      }

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
  all: protectedProcedure.query(async ({ type, path }) => {
    return getCommunities({ type, path })
  }),
  // @ts-ignore
  joined: protectedProcedure.query(async ({ ctx, type, path }) => {
    const communities = await getCommunities({
      type: "query",
      path: "communities.all",
    })

    const cachedFetcher = cachedFunction(
      async () => {
        const snap = await db
          .collectionGroup("members")
          .where("uid", "==", ctx.uid)
          .orderBy("joinedAt", "desc")
          .get()

        let data: any = []

        snap.forEach((doc) => {
          const cachedCommunity = communities.find(
            (c: any) => c.id === doc.ref.parent.parent?.id
          )
          if (cachedCommunity) {
            data.push({
              ...cachedCommunity,
              id: cachedCommunity.id,
              membership: {
                id: doc.id,
                ...doc.data(),
              },
            })
          }
        })
        return data as z.infer<typeof communitiesJoinedSchema>
      },
      {
        name: generateCacheKey({ type, path }),
        maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
        group: CACHE_GROUP,
      }
    )
    return cachedFetcher()
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getCommunity({ type, path, input })
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
    }),
}
