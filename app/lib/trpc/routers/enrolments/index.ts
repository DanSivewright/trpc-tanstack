import { fetcher, queryConfig } from "@/lib/query"

import { protectedProcedure } from "../../init"

export const enrolmentsRouter = {
  all: protectedProcedure.input(queryConfig["enrolments:all"].input).query(
    async ({ ctx, input }) =>
      await fetcher({
        key: "enrolments:all",
        ctx,
        input,
      })
  ),
  detail: protectedProcedure
    .input(queryConfig["enrolments:detail"].input)
    .query(
      async ({ ctx, input }) =>
        await fetcher({
          key: "enrolments:detail",
          ctx,
          input,
        })
    ),
}
