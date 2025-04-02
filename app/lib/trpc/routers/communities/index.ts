import { getFirestore } from "firebase-admin/firestore"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { db } from "@/lib/firebase/server"

import { protectedProcedure } from "../../init"
import type {
  communitiesAllSchema,
  communitiesJoinedSchema,
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
}
