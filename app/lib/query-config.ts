import { ContentAllSchema } from "@/integrations/trpc/routers/content/schemas/content-all-schema"
import { ContentDetailSchema } from "@/integrations/trpc/routers/content/schemas/content-detail-schema"
import { EnrolmentsAllSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { PeopleAllSchema } from "@/integrations/trpc/routers/people/schemas/people-all-schema"
import { PeopleMeSchema } from "@/integrations/trpc/routers/people/schemas/people-me-schema"
import { z } from "zod"

export const queryConfig = {
  "enrol:people": {
    path: "/learn/publications/:publicationUid/enrolments",
    input: z.object({
      params: z.object({
        publicationUid: z.string(),
      }),
      body: z.string(),
      query: z.object({
        companyUid: z.string(),
      }),
    }),
    as: z.any(),
  },
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
  "content:all": {
    path: "/learn/content",
    input: z.object({
      query: z.object({
        status: z.enum(["all", "published"]),
      }),
    }),
    as: ContentAllSchema,
  },
  "content:detail": {
    path: "/learn/:type/:typeUid",
    input: z.object({
      params: z.object({
        type: z.string(),
        typeUid: z.string(),
      }),
    }),
    as: ContentDetailSchema,
  },
} as const
