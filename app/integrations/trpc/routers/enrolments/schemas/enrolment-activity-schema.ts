import { z } from "zod"

export const EnrolmentActivitySchema = z.object({
  type: z.string(),
  typeUid: z.string(),
  status: z.string(),
  context: z
    .union([
      z.object({
        completedAt: z.string().nullable(),
        startedAt: z.string().optional().nullable(),
        assessmentUid: z.string(),
        publicationEnrolmentUid: z.string(),
        attempts: z.record(
          z.any(),
          z
            .object({
              learnerAttempt: z.number(),
              learnerPassed: z.boolean(),
              learnerScoreForAttempt: z.number(),
              learnerScoreAsPercentageForAttempt: z.number(),
              learnerStartedAttemptAt: z.string(),
              learnerPassedQuestionForSubmission: z
                .array(z.string())
                .nullable(),
              learnerCurrentlyRepeatingQuestionForSubmission: z
                .array(z.string())
                .nullable(),

              metadata: z.object({
                assessmentMaxScore: z.number(),
                assessmentPassScore: z.number(),
                assessmentQuestionsCount: z.number(),
                assessmentTimeLimit: z.number().nullable(),
                assessmentRepeatedFailedQuestions: z.boolean(),
                assessmentPassScoreRequired: z.boolean(),
                assessmentAllowedAttempts: z.number().nullable(),
                assessmentQuestionsRequirePreviousAnswer: z.boolean(),
              }),
              submission: z.object({
                requiredAnswerCount: z.number(),
                selectedAnswerCount: z.number(),
                answers: z.record(
                  z.string(),
                  z.object({
                    correct: z.number(),
                    isSelected: z.boolean(),
                    isSelectedCorrect: z.boolean(),
                    hasBeenTouched: z.boolean(),
                  })
                ),
              }),
            })
            .nullable()
        ),
      }),
      z
        .object({
          completedAt: z.string().nullable(),
          startedAt: z.string().optional().nullable(),
          badgeUid: z.string().optional(),
        })
        .and(z.record(z.string(), z.any())),
    ])
    .nullable(),

  createdAt: z.string(),
})

export type EnrolmentActivityType = z.infer<typeof EnrolmentActivitySchema>
