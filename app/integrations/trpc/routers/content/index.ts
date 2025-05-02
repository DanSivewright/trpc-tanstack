import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { protectedProcedure } from "../../init"

const CACHE_GROUP = "content"
export const contentRouter = {
  all: protectedProcedure
    .input(queryConfig["content:all"].input)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const cachedFetcher = cachedFunction(
        () =>
          fetcher({
            key: "content:all",
            ctx,
            input,
          }),
        {
          name: generateCacheKey({
            type,
            path,
            input,
          }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
          group: CACHE_GROUP,
        }
      )
      return cachedFetcher()
    }),

  detail: protectedProcedure
    .input(queryConfig["content:detail"].input)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const cachedFetcher = cachedFunction(
        () =>
          fetcher({
            key: "content:detail",
            ctx,
            input,
          }),
        {
          name: generateCacheKey({
            type,
            path,
            input,
          }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE,
          group: CACHE_GROUP,
        }
      )
      return cachedFetcher()
    }),
}
