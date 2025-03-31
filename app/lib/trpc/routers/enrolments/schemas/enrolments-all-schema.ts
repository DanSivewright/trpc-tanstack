import { z } from "zod"

const PublicationContentSchema = z.object({
  title: z.string(),
  summary: z.string().nullable().optional(),
  languageId: z.number().optional(),
  learningOutcomes: z.string().nullable().optional(),
  descriptionAsHTML: z.string().nullable(),
  descriptionAsJSON: z
    .array(z.record(z.string(), z.any()))
    .nullable()
    .optional(),
  courseUid: z.string().optional(),
  programUid: z.string().optional(),
  createdAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  createdByUid: z.string().optional(),
  lastUpdatedByUid: z.string().nullable().optional(),
})

const PublicationSchema = z.object({
  type: z.string(),
  typeUid: z.string(),
  uid: z.string(),
  featureImageUrl: z.string().nullable(),
  materialCount: z.number(),
  lessonCount: z.string().nullable(),
  lessonMaterialCount: z.string().nullable(),
  assessmentCount: z.string().nullable(),
  assessmentQuestionCount: z.string().nullable(),
  assignmentCount: z.string().nullable(),
  isFacilitated: z.boolean(),
  topics: z.array(z.string()).nullable(),
  contentType: z.string(),
  content: PublicationContentSchema,
  reviewScore: z.string().nullable(),
})

const FeedbackSchema = z.object({
  rating: z.number(),
  comment: z.string(),
})

const ContinueSchema = z.object({
  lessonUid: z.string().nullable(),
  moduleUid: z.string().nullable(),
})

const EnrolmentSchema = z.object({
  uid: z.string(),
  dueDate: z.string().nullable(),
  publicationBookingUid: z.string().nullable(),
  enrolledAs: z.string(),
  enrolmentStatus: z.string(),
  currentState: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  completionValidUntil: z.string().nullable(),
  completedStatus: z.string().nullable(),
  feedback: FeedbackSchema.nullable(),
  createdAt: z.string(),
  publication: PublicationSchema,
  activityCount: z.number(),
  continue: ContinueSchema.nullable(),
})

export const EnrolmentsAllSchema = z.object({
  nextOffset: z.string().nullable(),
  totalData: z.number(),
  enrolments: z.array(EnrolmentSchema),
})
