import { z } from "zod"

const ModuleContentSchema = z.object({
  id: z.number().optional(),
  moduleUid: z.string(),
  languageId: z.number(),
  title: z.string(),
  descriptionAsJSON: z.array(z.object({ insert: z.string() })),
  descriptionAsHTML: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const ModuleCreatedBySchema = z.object({
  uid: z.string(),
  authUid: z.string(),
  isAdmin: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string(),
  featureImageUrl: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  autoDeleteAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const ModuleSchema = z.object({
  uid: z.string(),
  draftVersionUid: z.string(),
  publishedVersionUid: z.string().nullable(),
  featureImageUrl: z.string().nullable(),
  companyUid: z.string(),
  type: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  content: ModuleContentSchema,
  createdBy: ModuleCreatedBySchema,
})

const MaterialItemSchema = z.object({
  uid: z.string(),
  moduleVersionUid: z.string(),
  type: z.string(),
  duration: z
    .object({
      minutes: z.number(),
    })
    .optional(),
  trainedAs: z.string().optional(),
  learnerVisible: z.boolean().optional(),
  moduleOrder: z.number(),
  isAssignment: z.boolean().optional(),
  passScore: z.string().optional(),
  passScoreRequired: z.boolean().optional(),
  allowedAttempts: z.string().optional(),
  repeatFailedQuestions: z.boolean().optional(),
  weight: z.string().optional(),
  timeLimit: z.string().optional(),
  questionsRequirePreviousAnswer: z.boolean().optional(),
  questionsAllowedAttempts: z.string().nullable().optional(),
  revealResult: z.boolean().optional(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  content: z.object({
    title: z.string(),
  }),
  kind: z.enum(["lesson", "assessment"]),
  saved: z.boolean(),
})

export const ContentModulesVersionSchema = z.object({
  uid: z.string(),
  moduleUid: z.string(),
  majorVersion: z.number(),
  minorVersion: z.number(),
  versionName: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  module: ModuleSchema,
  material: z.array(MaterialItemSchema),
})

// export type ModuleVersionDetailType = z.infer<typeof ModuleVersionDetailSchema>
