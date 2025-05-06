import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { trpcQuerySchema } from "../../schema"

export const getAllContentSchema = queryConfig["content:all"].input
const getAllContentOptions = trpcQuerySchema.extend({
  input: getAllContentSchema,
})
export const getAllContent = async (
  options: z.infer<typeof getAllContentOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "content:all",
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

export const getContentDetailSchema = queryConfig["content:detail"].input
const getContentDetailOptions = trpcQuerySchema.extend({
  input: getContentDetailSchema,
})
export const getContentDetail = async (
  options: z.infer<typeof getContentDetailOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "content:detail",
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

export const getContentModulesSchema = queryConfig["content:modules"].input
const getContentModulesOptions = trpcQuerySchema.extend({
  input: getContentModulesSchema,
})
export const getContentModules = async (
  options: z.infer<typeof getContentModulesOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "content:modules",
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

export const getContentModulesVersionSchema =
  queryConfig["content:modules:version"].input
const getContentModulesVersionOptions = trpcQuerySchema.extend({
  input: getContentModulesVersionSchema,
})
export const getContentModulesVersion = async (
  options: z.infer<typeof getContentModulesVersionOptions>
) => {
  const cachedFetcher = cachedFunction(
    () =>
      fetcher({
        key: "content:modules:version",
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
