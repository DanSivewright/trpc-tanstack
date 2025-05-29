import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import { trpcQuerySchema, type TRPCQuerySchema } from "../../schema"
import { getContentDetail } from "../content/queries"
import type {
  commentFeedItemSchema,
  communitiesAllSchema,
  communitiesJoinedSchema,
  communityArticleSchema,
  communityCommentSchema,
  communityCourseSchema,
  communityEnrolmentsSchema,
  communitySchema,
  communityThreadSchema,
  courseFeedItemSchema,
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

export const interactionsCountForCollectionGroupSchema = z.object({
  collectionGroup: z.enum(["threads", "articles", "courses", "comments"]),
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
            .where("deletedAt", "==", null)
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
