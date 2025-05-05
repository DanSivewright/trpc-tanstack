import type { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"

import { paletteSchema } from "../../palette/schemas/palette-schema"

const memberSchema = z.object({
  id: z.string(),
  role: z.enum(["admin", "member"]),
  joinedAt: z.string().nullable().optional(),
  communityId: z.string(),
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
})

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
  images: z
    .array(
      z.object({
        id: z.string(),
        featured: z.boolean(),
        logo: z.boolean(),
        name: z.string(),
        url: z.string().optional().nullable(),
        path: z.string().optional().nullable(),
        size: z.number().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  membersCount: z.number(),
  threadsCount: z.number(),
  coursesCount: z.number(),
  articlesCount: z.number(),
  membership: memberSchema.nullable().optional(),
  members: z.array(memberSchema).nullable().optional(),
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
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  communityId: z.string(),
  community: communitySchema,
  title: z.string(),
  caption: z.string(),
  views: z.number().optional().nullable(),
  status: z.enum(["draft", "published"]),
  accessibile: z.enum(["public", "community"]),
  tags: z.array(z.string()).nullable().optional(),
  commentsCount: z.number().optional().nullable(),
  createdAt: z.custom<Timestamp>(),
  updatedAt: z.custom<Timestamp>(),
  publishedAt: z.custom<Timestamp>(),
})

const feedEnrolmentsSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  publicationUid: z.string(),
  enrolmentUid: z.string().optional().nullable(),
  courseDocId: z.string(),
  enrolleeUid: z.string(),
  enrollee: memberSchema.omit({ joinedAt: true, role: true }),
  createdAt: z.string(),
})

const feedCourseSchema = feedItemSchema.extend({
  type: z.literal("course"),
  typeUid: z.string(),
  publicationUid: z.string(),
  typeAccessor: z.enum(["courses", "programs"]),
  enrolments: z.array(feedEnrolmentsSchema).optional().nullable(),
})

const feedArticleSchema = feedItemSchema.extend({
  type: z.literal("article"),
  duration: z.number(),
  content: z.any().optional().nullable(),
  featuredImageUrl: z.string(),
  featuredImagePath: z.string(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const feedThreadSchema = feedItemSchema.extend({
  type: z.literal("thread"),
  content: z.any().optional().nullable(),
  featuredImageUrl: z.string(),
  featuredImagePath: z.string(),
})

const feedSchema = z.discriminatedUnion("type", [
  feedCourseSchema,
  feedArticleSchema,
  feedThreadSchema,
])

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

const communityFeedSchema = z.array(feedSchema)
const communityFeedItemSchema = feedSchema
const communitiesAllSchema = z.array(communitySchema)
const communitiesJoinedSchema = communitiesAllSchema
export {
  communityFeedSchema,
  communityFeedItemSchema,
  communitiesAllSchema,
  communitiesJoinedSchema,
  communityCommentSchema,
  feedArticleSchema,
  feedCourseSchema,
  feedThreadSchema,
}
