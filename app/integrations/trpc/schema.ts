import { z } from "zod"

import type { TRPCContext } from "./init"

export const trpcQuerySchema = z.object({
  cacheGroup: z.string(),
  type: z.enum(["query", "mutation"]).or(z.string()),
  path: z.string(),
  input: z.any(),
  ctx: z.custom<TRPCContext>(),
})

export type TRPCQuerySchema = z.infer<typeof trpcQuerySchema>
