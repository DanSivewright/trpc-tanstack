import type { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"

import { paletteSchema } from "../../palette/schemas/palette-schema"

export const communitySchema = z.object({
  id: z.string(),
  name: z.string(),
  headline: z.string(),
  logoUrl: z.string(),
  featureImageUrl: z.string(),
  createdAt: z.string(),
  membersCount: z.number(),
  threadsCount: z.number(),
  coursesCount: z.number(),
  articlesCount: z.number(),
  membership: z
    .object({
      role: z.enum(["admin", "member"]),
      joinedAt: z.custom<Timestamp>().nullable().optional(),
    })
    .nullable()
    .optional(),
  content: z.record(z.string(), z.any()),
  tags: z.array(z.string()).nullable().optional(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const communityArticleSchema = z.object({
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  caption: z.string(),
  createdAt: z.custom<Timestamp>(),
  duration: z.number(),
  publishedAt: z.custom<Timestamp>(),
  status: z.enum(["draft", "published"]),
  accessibile: z.enum(["public", "community"]),
  title: z.string(),
  communityId: z.string(),
  community: communitySchema,
  content: z.any().optional().nullable(),
  featuredImageUrl: z.string(),
  commentsCount: z.number(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const communityThreadSchema = z.object({
  id: z.string(),
  title: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  communityId: z.string(),
  community: communitySchema,
  accessibile: z.enum(["public", "community"]),
  tags: z.array(z.string()).nullable().optional(),
  status: z.enum(["open", "archived"]),
  createdAt: z.custom<Timestamp>(),
  updatedAt: z.custom<Timestamp>(),
  caption: z.string(),
  content: z.any().optional().nullable(),
  commentsCount: z.number(),
})

const communityCourseSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  title: z.string(),
  viewsCount: z.number(),
  featureImageUrl: z.string().optional().nullable(),
  communityId: z.string(),
  community: communitySchema,
  typeUid: z.string(),
  type: z.enum(["courses", "programs"]).or(z.string()),
  detail: z.any(),
  enrolmentsCount: z.number(),
  commentsCount: z.number(),
  accessibile: z.enum(["public", "community"]),
  createdAt: z.custom<Timestamp>(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const communityCommentSchema = z.object({
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  content: z.string(),
  createdAt: z.custom<Timestamp>(),
  status: z.enum(["posted", "user-edited", "hidden"]),
  rootParentId: z.string().nullable().optional(),
  rootParentAuthorUid: z.string().nullable().optional(),
  rootParentType: z.enum(["threads", "articles", "courses", "comments"]),
  communityId: z.string(),
  upvotesCount: z.number(),
  downvotesCount: z.number(),
})

export const communitiesAllSchema = z.array(communitySchema)
export const communitiesJoinedSchema = communitiesAllSchema
