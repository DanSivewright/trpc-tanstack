import { db } from "@/integrations/firebase/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

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
      const cachedFetcher = cachedFunction(
        async () => {
          const doc = await db.collection("communities").doc(input.id).get()
          if (!doc.exists) {
            return null
          }
          return {
            id: doc.id,
            ...doc.data(),
          } as z.infer<typeof communitySchema>
        },
        {
          name: generateCacheKey({ path, type, input }),
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
        logoUrl: true,
        featureImageUrl: true,
        logoPath: true,
        featureImagePath: true,
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
