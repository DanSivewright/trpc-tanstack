import { z } from "zod"

const CompanySchema = z.object({
  uid: z.string(),
  tenantId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  featureImageUrl: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const VersionSchema = z.object({
  uid: z.string(),
  moduleUid: z.string(),
  majorVersion: z.number(),
  minorVersion: z.number(),
  versionName: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const ContentSchema = z.object({
  id: z.number(),
  moduleUid: z.string().optional(),
  courseUid: z.string().optional(),
  programUid: z.string().optional(),
  languageId: z.number(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  learningOutcomes: z.string().nullable().optional(),
  descriptionAsJSON: z.array(z.object({ insert: z.string() })),
  descriptionAsHTML: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const TranslationSchema = z.object({
  id: z.number(),
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

const CollaboratorSchema = z.object({
  programUid: z.string(),
  companyPersonUid: z.string(),
  roles: z.array(z.string()),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

const BaseContentSchema = z.object({
  uid: z.string(),
  companyUid: z.string(),
  status: z.string(),
  visibility: z.string(),
  kind: z.string(),
  link: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  company: CompanySchema,
  content: ContentSchema,
  collaborators: z.array(CollaboratorSchema),
})

const ModuleSchema = BaseContentSchema.extend({
  draftVersionUid: z.string(),
  publishedVersionUid: z.string(),
  featureImageUrl: z.string(),
  type: z.string(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string(),
  draftVersion: VersionSchema,
  publishedVersion: VersionSchema,
  translations: z.array(TranslationSchema),
})

const CourseSchema = BaseContentSchema.extend({
  latestPublicationUid: z.string(),
  isExternal: z.boolean(),
  externalReference: z.string().nullable(),
  humanCode: z.string(),
  canSelfEnrol: z.boolean(),
  isPublic: z.boolean(),
  featureImageUrl: z.string().nullable(),
  duration: z.string().nullable(),
  dueDate: z.string().nullable(),
  category: z.string(),
  type: z.string(),
  completionValidityDate: z.string().nullable(),
  preRequisites: z.string().nullable(),
  completeLearningInOrder: z.boolean(),
  autoRepeatingEnrol: z.boolean(),
  requiresModeration: z.boolean(),
})

const ProgramSchema = BaseContentSchema.extend({
  latestPublicationUid: z.string(),
  isExternal: z.boolean(),
  externalReference: z.string().nullable(),
  canSelfEnrol: z.boolean(),
  isPublic: z.boolean(),
  featureImageUrl: z.string().nullable(),
  duration: z.string().nullable(),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  certificationUrl: z.string().nullable(),
  completionValidityDate: z.string().nullable(),
  preRequisites: z.string().nullable(),
  completeLearningInOrder: z.boolean(),
  autoRepeatingEnrol: z.boolean(),
  requiresModeration: z.boolean(),
})

const FeedbackSchema = z.object({
  rating: z.number(),
  comment: z.string(),
})

const EmploymentSchema = z.object({
  employeeNumber: z.string(),
  type: z.string().nullable(),
})

const CPersonSchema = z.object({
  uid: z.string(),
  identificationNumber: z.string(),
  employment: EmploymentSchema,
  branch: z.string().nullable(),
})

const PersonSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  cPerson: CPersonSchema,
})

const EnrolmentSchema = z.object({
  uid: z.string(),
  publicationUid: z.string(),
  publicationBookingUid: z.string().nullable(),
  personUid: z.string(),
  enrolledAs: z.string(),
  enrolledThrough: z.string().nullable(),
  enrolmentStatus: z.string(),
  currentState: z.string(),
  completedStatus: z.string().nullable(),
  dueDate: z.string().nullable(),
  completionValidUntil: z.string().nullable(),
  contentCompleted: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string(),
  completionIssuedAt: z.string().nullable(),
  feedback: FeedbackSchema,
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  completedResult: z.string().nullable(),
  loginCode: z.string().nullable(),
  enrolmentRuleValid: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  person: PersonSchema,
  booking: z.string().nullable(),
  activity: z.array(z.any()), // Define a more specific schema if you have details about the activity structure
})

export const ContentAllSchema = z.array(
  z.union([ModuleSchema, CourseSchema, ProgramSchema])
)

export type ContentAllType = z.infer<typeof ContentAllSchema>
export type Enrolment = z.infer<typeof EnrolmentSchema>

// export {
//   CompanySchema,
//   VersionSchema,
//   ContentSchema,
//   TranslationSchema,
//   CollaboratorSchema,
//   BaseContentSchema,
//   ModuleSchema,
//   CourseSchema,
//   ProgramSchema,
//   FeedbackSchema,
//   EmploymentSchema,
//   CPersonSchema,
//   PersonSchema,
//   EnrolmentSchema,
//   ContentAllSchema,
// }
