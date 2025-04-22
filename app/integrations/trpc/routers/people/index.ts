import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"
import { fetcher } from "@/lib/query"
import { queryConfig } from "@/lib/query-config"

import { protectedProcedure } from "../../init"

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
  all: protectedProcedure
    .input(
      z
        .object({
          cursor: z.number().nullish(),
        })
        .extend(queryConfig["people:all"].input.unwrap().unwrap().shape)
    )
    .query(async ({ ctx, input }) => {
      console.log("cursor:::", input.cursor)
      const { cursor, ...rest } = input
      const data = await fetcher({
        key: "people:all",
        ctx,
        input: {
          ...rest,
          query: {
            ...rest.query,
            offset: !cursor ? 0 : cursor,
          },
        },
      })
      return {
        data,
        nextCursor: data.nextOffset,
      }
    }),
}
