import { z } from "zod"

import { EnrolmentsAllSchema } from "./trpc/routers/enrolments/schemas/enrolments-all-schema"
import { EnrolmentsDetailSchema } from "./trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { PeopleMeSchema } from "./trpc/routers/people/schemas/people-me-schema"

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
    as: PeopleMeSchema,
  },
} as const
