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
      const [communitySnap, membersSnap] = await Promise.all([
        db.collection("communities").doc(options.input.id).get(),
        db
          .collectionGroup("members")
          .where("communityId", "==", options.input.uid)
          .orderBy("joinedAt", "desc")
          .get(),
      ])

      if (!communitySnap.exists) {
        return null
      }
      let members: any = []
      membersSnap.forEach((doc) => {
        members.push({
          ...doc.data(),
          docId: doc.id,
        })
      })

      return {
        id: communitySnap.id,
        ...communitySnap.data(),
        membersCount: membersSnap.size,
        members: members || [],
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
        images: true,
        authorUid: true,
        author: true,
        meta: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload: Partial<z.infer<typeof communitySchema>> = {
        ...input,
        articlesCount: 0,
        membersCount: 1,
        coursesCount: 0,
        threadsCount: 0,
        content: {},
        images: [],
        members: [],
        status: "private",
        accessibile: "public",
        createdAt: new Date().toISOString(),
      }
      const createCommunity = await tryCatch(
        db.collection("communities").doc(input.id).set(payload)
      )
      if (createCommunity.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: createCommunity.error.message,
        })
      }

      const createMember = await tryCatch(
        db
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
      )
      if (createMember.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: createMember.error.message,
        })
      }

      const storage = useStorage()
      await storage.remove(
        `cache:${CACHE_GROUP}:${generateCacheKey({
          path: "communities.detail",
          type: "query",
          input: { id: input.id },
        })}:.json`
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
    .mutation(async ({ input }) => {
      const { id, members, ...rest } = input
      const payload = { ...rest, updatedAt: new Date().toISOString() }
      await db.collection("communities").doc(id).update(payload)

      const storage = useStorage()
      const cache = await getCommunity({
        type: "query",
        path: "communities.detail",
        input: { id },
      })
      if (cache) {
        const update = merge({}, cache, payload)
        await storage.set(
          `cache:${CACHE_GROUP}:${generateCacheKey({
            path: "communities.detail",
            type: "query",
            input: { id },
          })}:.json`,
          update
        )
      }

      if (members) {
        const membersRef = db
          .collection("communities")
          .doc(id)
          .collection("members")
        const batch = db.batch()

        for (const member of members) {
          batch.set(membersRef.doc(member?.uid || ""), member, { merge: true })
        }

        await batch.commit()
      }
    }),
}
