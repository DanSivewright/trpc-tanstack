import type { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"

import { paletteSchema } from "../../palette/schemas/palette-schema"

export const communitySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(5, { message: "Name must be at least 5 characters" })
    .max(75, { message: "Name must be less than 75 characters" }),
  headline: z
    .string()
    .min(100, { message: "Headline must be at least 100 characters" })
    .max(200, { message: "Headline must be less than 200 characters" }),
  logoUrl: z.string().optional().nullable(),
  logoPath: z.string().optional().nullable(),
  featureImageUrl: z.string().optional().nullable(),
  featureImagePath: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  membersCount: z.number(),
  threadsCount: z.number(),
  coursesCount: z.number(),
  articlesCount: z.number(),
  membership: z
    .object({
      role: z.enum(["admin", "member"]),
      joinedAt: z.string().nullable().optional(),
      communityId: z.string(),
      uid: z.string(),
      firstName: z.string(),
      lastName: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      avatarUrl: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  authorUid: z.string(),
  author: z.object({
    uid: z.string(),
    firstName: z.string(),
    lastName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
  }),
  content: z.record(z.string(), z.any()).nullable().optional(),
  tags: z.array(z.string()).min(1, { message: "At least one tag is required" }),
  status: z.enum(["private", "public"]),
  accessibile: z.enum(["public", "invite", "approval"]),
  meta: z
    .object({
      colors: paletteSchema,
    })
    .nullable()
    .optional(),
})

const feedItemSchema = z.object({
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  communityId: z.string(),
  community: communitySchema,
  status: z.enum(["draft", "published"]),
  accessibile: z.enum(["public", "community"]),
  tags: z.array(z.string()).nullable().optional(),
  commentsCount: z.number(),
  createdAt: z.custom<Timestamp>(),
  updatedAt: z.custom<Timestamp>(),
  publishedAt: z.custom<Timestamp>(),
})

const articleSchema = feedItemSchema.extend({
  type: z.literal("article"),
  title: z.string(),
  caption: z.string(),
  duration: z.number(),
  content: z.any().optional().nullable(),
  featuredImageUrl: z.string(),
  featuredImagePath: z.string(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const feedSchema = z.discriminatedUnion("type", [
  feedItemSchema.extend({
    type: z.literal("article"),
    title: z.string(),
    caption: z.string(),
    duration: z.number(),
    content: z.any().optional().nullable(),
    featuredImageUrl: z.string(),
    featuredImagePath: z.string(),
    meta: z.object({
      colors: paletteSchema,
    }),
  }),
  feedItemSchema.extend({
    type: z.literal("thread"),
    title: z.string(),
    caption: z.string(),
    content: z.any().optional().nullable(),
    featuredImageUrl: z.string(),
    featuredImagePath: z.string(),
  }),
  feedItemSchema.extend({
    type: z.literal("course"),
  }),
])

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
