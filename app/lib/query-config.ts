import { EnrolmentsAllSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { PeopleAllSchema } from "@/integrations/trpc/routers/people/schemas/people-all-schema"
import { PeopleMeSchema } from "@/integrations/trpc/routers/people/schemas/people-me-schema"
import { z } from "zod"

export const queryConfig = {
  "enrolments:all": {
    path: "/learn/enrolments",
    input: z
      .object({
        query: z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional(),
            include: z.string().optional(),
            contentType: z.string().optional(),
            currentStateByStatus: z
              .enum(["in-progress", "completed", "not-started"])
              .optional(),
          })
          .optional(),
      })
      .optional(),
    as: EnrolmentsAllSchema,
  },
  "enrolments:detail": {
    path: "/learn/enrolments/:uid",
    input: z.object({
      params: z.object({
        uid: z.string(),
      }),
      query: z
        .object({
          excludeMaterial: z.boolean().optional(),
        })
        .optional(),
    }),
    as: EnrolmentsDetailSchema,
  },
  "people:me": {
    path: "/people/me",
    input: z
      .object({
        token: z.string(),
        tenantId: z.string().optional(),
      })
      .optional()
      .nullable(),
    as: PeopleMeSchema,
  },
  "people:all": {
    path: "/people",
    input: z
      .object({
        query: z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
    as: PeopleAllSchema,
  },
} as const
