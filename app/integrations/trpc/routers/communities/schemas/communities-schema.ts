import { z } from "zod"

import { ContentDetailSchema } from "../../content/schemas/content-detail-schema"
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

const communityCollectionGroupBaseSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  communityId: z.string(),
  images: z
    .array(
      z.object({
        id: z.string(),
        featured: z.boolean(),
        name: z.string(),
        url: z.string().optional().nullable(),
        path: z.string().optional().nullable(),
        size: z.number().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string().optional().nullable(),
        size: z.number().optional().nullable(),
        mimeType: z.string().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
  title: z.string().min(1, { message: "Title is required" }),
  caption: z.string(),
  views: z.number().optional().nullable(),
  status: z.enum(["draft", "published"]),
  accessibile: z.enum(["public", "community"]),
  tags: z.array(z.string()).nullable().optional(),
  commentsCount: z.number().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  meta: z
    .object({
      colors: paletteSchema.optional().nullable(),
    })
    .nullable()
    .optional(),
  isFeatured: z.boolean().optional().nullable(),
  isFeaturedUntil: z.string().optional().nullable(),
})

export const communityEnrolmentsSchema = z.object({
  id: z.string(),
  authorUid: z.string().nullable(),
  author: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string(),
    })
    .nullable(),
  publicationUid: z.string(),
  enrolmentUid: z.string().optional().nullable(),
  courseDocId: z.string(),
  enrolleeUid: z.string(),
  enrollee: memberSchema.omit({ joinedAt: true, role: true }),
  createdAt: z.string(),
})

const communityCourseSchema = communityCollectionGroupBaseSchema.extend({
  type: z.literal("course"),
  typeUid: z.string(),
  publicationUid: z.string(),
  typeAccessor: z.enum(["courses", "programs"]),
  enrolments: z.array(communityEnrolmentsSchema).optional().nullable(),

  content: ContentDetailSchema.optional().nullable(),
})

const communityArticleSchema = communityCollectionGroupBaseSchema.extend({
  type: z.literal("article"),
  duration: z.number(),
  content: z.any().optional().nullable(),
  featuredImageUrl: z.string(),
  featuredImagePath: z.string(),
  meta: z.object({
    colors: paletteSchema,
  }),
})

const communityThreadSchema = communityCollectionGroupBaseSchema.extend({
  type: z.literal("thread"),
  content: z.any().optional().nullable(),
})

const communityCommentSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  content: z.string(),
  createdAt: z.string(),
  status: z.enum(["posted", "user-edited", "hidden"]),
  communityId: z.string(),
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
  likesCount: z.number().optional().nullable(),
  commentsCount: z.number().optional().nullable(),
  byMe: z.boolean().optional().nullable(),
})
export const communityLikeSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string(),
  }),
  createdAt: z.string(),
  communityId: z.string(),
  collectionGroup: z.enum(["threads", "articles", "courses"]),
  collectionGroupDocId: z.string(),
})

const communityFeedItemBaseSchema = z.object({
  id: z.string(),
  source: z.enum(["grouping", "system", "user"]),
  authorUid: z.string().optional().nullable(),
  author: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string(),
    })
    .optional()
    .nullable(),
  communityId: z.string(),
  isFeatured: z.boolean().optional().nullable(),
  isFeaturedUntil: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  verb: z.enum(["created", "updated", "deleted", "commented"]).or(z.string()),
  descriptor: z.string(),
})

export const threadFeedItemSchema = communityFeedItemBaseSchema.extend({
  type: z.literal("thread"),
  group: z.literal("threads"),
  // this may cause an error
  input: z.object({
    communityId: z.string(),
    threadId: z.string(),
  }),
  data: communityThreadSchema.optional().nullable(),
})

export const courseFeedItemSchema = communityFeedItemBaseSchema.extend({
  type: z.literal("course"),
  group: z.literal("courses"),
  input: z.object({
    communityId: z.string(),
    courseId: z.string(),
  }),
  data: communityCourseSchema.optional().nullable(),
})

export const communityFeedSchema = z.array(
  z.discriminatedUnion("type", [threadFeedItemSchema, courseFeedItemSchema])
)

const communitiesAllSchema = z.array(communitySchema)
const communitiesJoinedSchema = communitiesAllSchema
export {
  communitiesAllSchema,
  communitiesJoinedSchema,
  communityArticleSchema,
  communityCommentSchema,
  communityCourseSchema,
  communityThreadSchema,
}
