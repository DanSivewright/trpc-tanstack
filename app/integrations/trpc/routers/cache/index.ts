import { useStorage } from "@/lib/cache"

import { protectedProcedure } from "../../init"

export const cacheRouter = {
  bust: protectedProcedure.mutation(async () => {
    const storage = useStorage()
    await storage.clear()
    return true
  }),
}
