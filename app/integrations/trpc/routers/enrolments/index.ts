import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { protectedProcedure } from "../../init"

const CACHE_GROUP = "enrolments"
export const enrolmentsRouter = {
  all: protectedProcedure
    .input(queryConfig["enrolments:all"].input)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const cachedFetcher = cachedFunction(
        () =>
          fetcher({
            key: "enrolments:all",
            ctx,
            input,
          }),
        {
          name: generateCacheKey({ type, path, input }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE, // Cache for 5 minutes
          group: CACHE_GROUP,
        }
      )
      return cachedFetcher()
    }),
  detail: protectedProcedure
    .input(queryConfig["enrolments:detail"].input)
    // @ts-ignore
    .query(async ({ ctx, input, type, path }) => {
      const cachedFetcher = cachedFunction(
        () =>
          fetcher({
            key: "enrolments:detail",
            ctx,
            input,
          }),
        {
          name: generateCacheKey({ type, path, input }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE, // Cache for 5 minutes
          group: CACHE_GROUP,
        }
      )

      return cachedFetcher()
    }),
}
