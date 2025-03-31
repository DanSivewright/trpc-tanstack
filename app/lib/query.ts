import { cache } from "react"
import { tryCatch } from "@/utils/try-catch"
import qs from "qs"
import { z } from "zod"

import type { TRPCContext } from "./trpc/init"
import { EnrolmentsAllSchema } from "./trpc/routers/enrolments/schemas/enrolment-all-schema"

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
    as: z.any(),
  },
} as const

export const fetcher = cache(
  async <K extends keyof typeof queryConfig>({
    key,
    ctx,
    input,
  }: {
    key: K
    ctx: TRPCContext
    input: z.infer<(typeof queryConfig)[K]["input"]>
  }) => {
    const c = queryConfig[key]

    let path = c.path as string

    if (input && "params" in c.input && c.input.params) {
      Object.entries(c.input.params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value))
      })
    }

    const queryString =
      input && "query" in c.input && c.input.query
        ? qs.stringify(c.input.query, { addQueryPrefix: true })
        : ""

    const url = new URL(path + queryString, import.meta.env.VITE_API_URL)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        "x-tenant-id": ctx.tenantId ?? "",
      },
    })

    // const data = await response.json();
    const { data, error, success } = await tryCatch(response.json())
    console.log("stuff:::", {
      data,
      error,
      success,
    })

    return data?.data as z.infer<typeof c.as>
  }
)
