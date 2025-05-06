import { cache } from "react"
import type { TRPCContext } from "@/integrations/trpc/init"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import qs from "qs"
import { z } from "zod"

import { queryConfig } from "./query-config"

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

    if (input && "params" in input && input.params) {
      Object.entries(input.params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value))
      })
    }

    const queryString =
      input && "query" in input && input.query
        ? qs.stringify(input.query, { addQueryPrefix: true })
        : ""

    const url = new URL(path + queryString, import.meta.env.VITE_API_URL)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        "x-tenant-id": ctx.tenantId ?? "",
        "Content-Type": "application/json",
      },
      method: input && "body" in input && input.body ? "POST" : "GET",
      body:
        input && "body" in input && input.body
          ? JSON.stringify(input.body)
          : undefined,
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
