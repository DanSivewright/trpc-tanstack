import { z } from "zod"

const LessonSchema = z.object({
  uid: z.string(),
  type: z.string(),
  content: z.object({
    title: z.string(),
  }),
})

const AssessmentSchema = z.object({
  uid: z.string(),
  content: z.object({
    title: z.string(),
  }),
})

const ModuleSchema = z.object({
  draftVersionUid: z.string(),
  publishedVersionUid: z.string().nullable(),
  featureImageUrl: z.string().url().nullable(),
  type: z.string(),
  content: z.object({
    title: z.string(),
  }),
})

const ModuleVersionSchema = z.object({
  uid: z.string(),
  majorVersion: z.number(),
  minorVersion: z.number(),
  versionName: z.string().nullable(),
  module: ModuleSchema,
  lessons: z.array(LessonSchema),
  assessments: z.array(AssessmentSchema),
  assignments: z.array(z.unknown()),
})

const MaterialItemSchema = z.object({
  uid: z.string(),
  courseUid: z.string().optional().nullable(),
  programUid: z.string().optional().nullable(),
  moduleVersionUid: z.string(),
  dueDate: z.string().nullable(),
  order: z.number(),
  preRequisites: z.string().nullable(),
  weight: z.string(),
  tags: z.string().nullable(),
  badgeUid: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  badge: z
    .object({
      uid: z.string(),
      companyUid: z.string(),
      name: z.string(),
      description: z.string(),
      imageUrl: z.string().url().nullable(),
      narrative: z.string().nullable(),
    })
    .optional()
    .nullable(),
  moduleVersion: ModuleVersionSchema,
})

export const ContentModulesSchema = z.array(MaterialItemSchema)
// export const ContentMaterialArraySchema = z.array(MaterialItemSchema)

// export type ContentMaterialArrayType = z.infer<
//   typeof ContentMaterialArraySchema
// >
// export type ContentMaterialType = z.infer<typeof MaterialItemSchema>
