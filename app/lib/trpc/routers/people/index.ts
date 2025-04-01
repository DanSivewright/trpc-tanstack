import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"

import { protectedProcedure, publicProcedure } from "../../init"

const CACHE_GROUP = "people"
export const peopleRouter = {
  // @ts-ignore
  me: protectedProcedure.query(async ({ ctx, input, type, path }) => {
    const cachedFetcher = cachedFunction(
      () =>
        fetcher({
          key: "people:me",
          ctx,
          input,
        }),
      {
        name: generateCacheKey({
          type,
          path,
          input: { token: ctx.token, tenantId: ctx.tenantId },
        }),
        maxAge: import.meta.env.VITE_CACHE_MAX_AGE, // Cache for 5 minutes
        group: CACHE_GROUP,
      }
    )
    return cachedFetcher()
  }),
}
