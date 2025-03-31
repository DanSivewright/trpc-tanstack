import { cache } from "react"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import qs from "qs"
import { z } from "zod"

import type { TRPCContext } from "./trpc/init"
import { EnrolmentsAllSchema } from "./trpc/routers/enrolments/schemas/enrolments-all-schema"
import { EnrolmentsDetailSchema } from "./trpc/routers/enrolments/schemas/enrolments-detail-schema"

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
  }): Promise<z.infer<(typeof queryConfig)[K]["as"]>> => {
    const c = queryConfig[key]

    let path = c.path as string

    console.log("input:::", input)

    if (input && "params" in input && input.params) {
      Object.entries(input.params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value))
      })
    }
    console.log("path:::", path)

    const queryString =
      input && "query" in input && input.query
        ? qs.stringify(input.query, { addQueryPrefix: true })
        : ""

    const url = new URL(path + queryString, import.meta.env.VITE_API_URL)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        "x-tenant-id": ctx.tenantId ?? "",
      },
    })

    const { data, error, success } = await tryCatch(response.json())
    if (error || !success) {
      if (error.message.includes("401")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        })
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
        cause: error,
      })
    }

    return data?.data as z.infer<typeof c.as>
  }
)
