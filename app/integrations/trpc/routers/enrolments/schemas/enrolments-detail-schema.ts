import { z } from "zod"

import { EnrolmentActivitySchema } from "./enrolment-activity-schema"

// import { AssessmentSchema, BlocksUnion } from "./learning-detail-schema"

// Common schemas used across different types
const PersonSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().nullable(),
  cPerson: z.object({
    branchUid: z.string().nullable(),
    identificationNumber: z.string(),
    employment: z.object({
      employeeNumber: z.string(),
    }),
  }),
})

const FeedbackSchema = z.object({
  rating: z.number(),
  comment: z.string(),
})

const ContinueSchema = z.object({
  lessonUid: z.string().nullable(),
  moduleUid: z.string().nullable(),
})

const PublishedBySchema = z.object({
  name: z.string(),
  imageUrl: z.string().url(),
})

const TranslationSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  descriptionAsHTML: z.string().nullable(),
  descriptionAsJSON: z.array(z.record(z.string(), z.any())).optional(),
})

// Learning schemas for course/program types
export const LearningSchema = z.object({
  uid: z.string(),
  kind: z.string(),
  type: z.string(),
  duration: z.object({ minutes: z.number() }).optional(),
  trainedAs: z.string().optional(),
  title: z.string(),
  // translations: z.record(
  //   z.string(),
  //   z.object({
  //     title: z.string(),
  //     languageId: z.number(),
  //     materialAsHTML: z.string().nullable(),
  //     materialAsJSON: z
  //       .union([
  //         //
  //         z.array(z.record(z.string(), z.any())),
  //         z.object({
  //           version: z.number(),
  //           content: z.array(BlocksUnion),
  //         }),
  //       ])
  //       .nullable(),
  //   })
  // ),
  learnerVisible: z.boolean(),
  moduleVersionUid: z.string(),
})
// .merge(AssessmentSchema)

const ModuleVersionSchema = z.object({
  uid: z.string(),
  module: z.object({
    uid: z.string(),
    type: z.string(),
    translations: z.record(
      z.string(),
      z.object({
        title: z.string(),
      })
    ),
    featureImageUrl: z.string().url().nullable(),
  }),
})

const ModuleSchema = z.object({
  uid: z.string(),
  tags: z.array(z.string()).nullable(),
  badgeUid: z.string().optional(),
  badge: z
    .object({
      name: z.string(),
      imageUrl: z.string().url(),
      description: z.string().nullable(),
    })
    .nullable(),
  order: z.number(),
  weight: z.string(),
  dueDate: z
    .union([
      z.object({ fixed: z.string() }),
      z.object({
        dueDuration: z.string(),
        dueMeasurement: z.string(),
      }),
    ])
    .nullable(),
  duration: z.object({ minutes: z.number() }).optional(),
  learning: z.array(LearningSchema),
  moduleVersion: ModuleVersionSchema,
})

// Base publication schema with common fields
const BasePublicationSchema = z.object({
  uid: z.string(),
  type: z.string(),
  typeUid: z.string(),
  companyUid: z.string(),
  title: z.string().nullable().optional(),
  featuredUntil: z.string().nullable(),
  canSelfEnrol: z.boolean(),
  canRequestEnrol: z.boolean(),
  isPublic: z.boolean(),
  chatEnabled: z.boolean(),
  isFacilitated: z.boolean(),
  completeLearningInOrder: z.boolean(),
  featureImageUrl: z.string().url().nullable(),
  topics: z.array(z.string()).nullable(),
  duration: z.object({ minutes: z.number() }).nullable(),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  publishedBy: PublishedBySchema,
  translations: z.record(z.string(), TranslationSchema),
  pricing: z.unknown().nullable(),
  contentType: z.string(),
  reviewScore: z.string().nullable(),
})

// Specific publication schemas for each type
const CoursePublicationSchema = BasePublicationSchema.extend({
  material: z.array(ModuleSchema),
  lessonCount: z.string(),
  lessonMaterialCount: z.string(),
  assessmentCount: z.string(),
  assessmentQuestionCount: z.string(),
  assignmentCount: z.string(),
})

// const ProgramPublicationSchema = BasePublicationSchema.extend({
//   material: z.array(
//     z.object({
//       uid: z.string(),
//       modules: z.array(ModuleSchema),
//       translations: z.record(
//         z.string(),
//         z.object({
//           title: z.string(),
//         })
//       ),
//     })
//   ),
// })

// const ExternalPublicationSchema = BasePublicationSchema.extend({
//   material: z.array(
//     z.object({
//       uid: z.string(),
//       url: z.string().url(),
//       type: z.string(),
//     })
//   ),
// })

// Combined publication schema using discriminated union
// const PublicationSchema = z.union([
//   CoursePublicationSchema.extend({ type: z.literal("course") }),
//   ProgramPublicationSchema.extend({ type: z.literal("program") }),
//   ExternalPublicationSchema.extend({ type: z.literal("external") }),
// ])

export const EnrolmentsDetailSchema = z.object({
  uid: z.string(),
  publicationBookingUid: z.string().nullable(),
  personUid: z.string(),
  enrolledAs: z.string(),
  enrolledThrough: z.string().nullable(),
  enrolmentStatus: z.string(),
  currentState: z.string(),
  completedStatus: z.string().nullable(),
  dueDate: z.string().nullable(),
  completionValidUntil: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  completionIssuedAt: z.string().nullable(),
  feedback: FeedbackSchema.nullable(),
  completedResult: z.number().nullable(),
  loginCode: z.string().nullable(),
  enrolmentRuleValid: z.boolean(),
  createdAt: z.string(),
  publication: CoursePublicationSchema,
  person: PersonSchema,
  isLocked: z.boolean(),
  continue: ContinueSchema.nullable(),
  activity: z.array(EnrolmentActivitySchema).optional().nullable(),
})
