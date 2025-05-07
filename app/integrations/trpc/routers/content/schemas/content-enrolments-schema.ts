import { z } from "zod"

const ContentEnrolmentSchema = z.object({
  uid: z.string(),
  publicationUid: z.string(),
  publicationBookingUid: z.string().nullable().optional(),
  personUid: z.string(),
  enrolledAs: z.string().nullable().optional(),
  enrolledThrough: z.string().nullable().optional(),
  enrolmentStatus: z.string().nullable().optional(),
  currentState: z.string().nullable().optional(),
  completedStatus: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  completionValidUntil: z.string().nullable().optional(),
  contentCompleted: z.boolean().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  completionIssuedAt: z.string().nullable().optional(),
  completionAcknowledgedAt: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  createdByUid: z.string().nullable().optional(),
  lastUpdatedByUid: z.string().nullable().optional(),
  completedResult: z.number().nullable().optional(),
  loginCode: z.string().nullable().optional(),
  enrolmentRuleValid: z.boolean().nullable().optional(),
  supportingEvidenceUrl: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  person: z
    .object({
      uid: z.string().nullable().optional(),
      firstName: z.string().nullable().optional(),
      lastName: z.string().nullable().optional(),
      cPerson: z
        .object({
          uid: z.string().nullable().optional(),
          identificationNumber: z.string().nullable().optional(),
          employment: z
            .object({
              employeeNumber: z.string().nullable().optional(),
              type: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
          branch: z
            .object({
              name: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  booking: z.any().nullable().optional(),
  activity: z.array(z.any()).nullable().optional(),
})

export const ContentEnrolmentsSchema = z.array(ContentEnrolmentSchema)

// export type ContentEnrolmentsArrayType = z.infer<typeof ContentEnrolmentsSchema>
// export type ContentEnrolmentType = z.infer<typeof ContentEnrolmentSchema>
