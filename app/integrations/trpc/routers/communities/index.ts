import { db } from "@/integrations/firebase/server"
import { tryCatch } from "@/utils/try-catch"
import merge from "lodash.merge"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"

import { protectedProcedure } from "../../init"
import { communityArticlesRouter } from "./articles"
import { communityCommentsRouter } from "./comments"
import { communityCoursesRouter } from "./courses"
import { communityEventsRouter } from "./events"
import { communitiesFeedRouter } from "./feed"
import { upsertLike, upsertLikeSchema } from "./mutations"
import {
  getAllCommunities,
  getAllCommunitiesAdminOf,
  getAllJoinedCommunities,
  getCommunityDetail,
  getCommunityDetailSchema,
  getinteractionsCountForCollectionGroup,
  interactionsCountForCollectionGroupSchema,
} from "./queries"
import { communitySchema } from "./schemas/communities-schema"
import { communityThreadsRouter } from "./threads"

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

  threads: communityThreadsRouter,
  feed: communitiesFeedRouter,
  events: communityEventsRouter,
  courses: communityCoursesRouter,
  comments: communityCommentsRouter,
  articles: communityArticlesRouter,

  interactionsCountForCollectionGroup: protectedProcedure
    .input(interactionsCountForCollectionGroupSchema)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      return getinteractionsCountForCollectionGroup({
        cacheGroup: CACHE_GROUP,
        type,
        path,
        input,
        ctx,
      })
    }),

  handleLike: protectedProcedure
    .input(upsertLikeSchema)
    .mutation(async ({ input }) => {
      return upsertLike(input)
    }),
}
