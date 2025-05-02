import { optional, z } from "zod"

const ContentSchema = z.object({
  id: z.number(),
  courseUid: z.string().optional(),
  programUid: z.string().optional(),
  languageId: z.number(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  learningOutcomes: z.string().nullable().optional(),
  descriptionAsJSON: z.array(z.object({ insert: z.string() })).nullable(),
  descriptionAsHTML: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const CreatedBySchema = z.object({
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

const PublicationSchema = z.object({
  uid: z.string(),
  isFacilitated: z.boolean(),
  contentType: z.string(),
  certificationUrl: z.string().optional().nullable(),
  certificationColor: z.string().optional().nullable(),
  certificationUseDefaultSignature: z.boolean(),
  certificationText: z.string().optional().nullable(),
  assessmentCount: z.string(),
  hooks: z.array(z.unknown()),
  groups: z.array(z.unknown()),
})

export const ContentDetailSchema = z.object({
  uid: z.string(),
  latestPublicationUid: z.string(),
  companyUid: z.string(),
  isExternal: z.boolean().optional().nullable(),
  externalReference: z.string().nullable(),
  isPublic: z.boolean().optional().nullable(),
  featureImageUrl: z.string().nullable(),
  duration: z.string().nullable(),
  status: z.string(),
  preRequisites: z
    .object({
      text: z.string().optional(),
      publications: z.array(z.string()).optional(),
    })
    .optional()
    .nullable(),
  completeLearningInOrder: z.boolean().optional().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  content: ContentSchema,
  translations: z.array(ContentSchema).optional().nullable(),
  createdBy: CreatedBySchema,
  publication: PublicationSchema,
  collaborators: z
    .array(
      z.object({
        courseUid: z.string().optional().nullable(),
        programUid: z.string().optional().nullable(),
        roles: z.array(z.string()).optional().nullable(),
        name: z.string(),
        companyPersonUid: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
  enrolmentsCount: z.number(),

  canRequestEnrol: z.boolean().optional().nullable(),
  canSelfEnrol: z.boolean().optional().nullable(),
  requiresModeration: z.boolean().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  dueDuration: z.number().optional().nullable(),
  dueMeasurement: z.enum(["d", "w", "m", "y"]).optional().nullable(),
  completionValidityDate: z.string().optional().nullable(),
  completionValidityDuration: z.number().optional().nullable(),
  completionValidityMeasurement: z
    .enum(["d", "w", "m", "y"])
    .optional()
    .nullable(),
  autoRepeatingEnrol: z.boolean().optional().nullable(),

  category: z.string(),
  type: z.string(),
  startDate: z.string().optional().nullable(),
  certificationUrl: z.string().optional().nullable(),
  curriculum: z
    .array(
      z.object({
        uid: z.string(),
        programUid: z.string(),
        order: z.number(),
        startDate: z.string().nullable(),
        preRequisites: z.string().nullable(),
        dueDate: z.string().nullable(),
        weight: z.string().nullable(),
        createdByUid: z.string(),
        lastUpdatedByUid: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
        content: z.object({
          id: z.number(),
          programSectionUid: z.string(),
          languageId: z.number(),
          title: z.string(),
          createdByUid: z.string(),
          lastUpdatedByUid: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          deletedAt: z.string().nullable(),
        }),
        modules: z.array(
          z.object({
            uid: z.string(),
            programSectionUid: z.string(),
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
            moduleVersion: z.object({}).optional(),
          })
        ),
      })
    )
    .optional()
    .nullable(),
  previewLink: z.string().optional().nullable(),
})

export type ContentDetailType = z.infer<typeof ContentDetailSchema>

// export {
//   ContentSchema,
//   CreatedBySchema,
//   PublicationSchema,
//   ContentDetailSchema,
// }
