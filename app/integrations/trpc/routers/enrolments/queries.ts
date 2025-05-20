import type { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { trpcQuerySchema } from "../../schema"

export const getAllEnrolmentsSchema = queryConfig["enrolments:all"].input
const getAllEnrolmentsOptions = trpcQuerySchema.extend({
  input: getAllEnrolmentsSchema,
})
export const getAllEnrolments = async (
  options: z.infer<typeof getAllEnrolmentsOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "enrolments:all",
        ctx: options.ctx,
        input: options.input,
      }),
    {
      name: generateCacheKey({
        type: options.type,
        path: options.path,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )
  return cachedFetcher()
}

export const getEnrolmentDetailSchema = queryConfig["enrolments:detail"].input
const getEnrolmentDetailOptions = trpcQuerySchema.extend({
  input: getEnrolmentDetailSchema,
})
export const getEnrolmentDetail = async (
  options: z.infer<typeof getEnrolmentDetailOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "enrolments:detail",
        ctx: options.ctx,
        input: options.input,
      }),
    {
      name: generateCacheKey({
        type: options.type,
        path: options.path,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )
  return cachedFetcher()
}

export const getEnrolmentActivitySchema =
  queryConfig["enrolments:activity"].input
const getEnrolmentActivityOptions = trpcQuerySchema.extend({
  input: getEnrolmentActivitySchema,
})
export const getEnrolmentActivity = async (
  options: z.infer<typeof getEnrolmentActivityOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "enrolments:activity",
        ctx: options.ctx,
        input: options.input,
      }),
    {
      name: generateCacheKey({
        type: options.type,
        path: options.path,
        input: options.input,
      }),
      maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
      group: options.cacheGroup,
    }
  )

  return cachedFetcher()
}
