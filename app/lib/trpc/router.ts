import { createTRPCRouter } from "./init"
import { enrolmentsRouter } from "./routers/enrolments"

export const trpcRouter = createTRPCRouter({
  enrolments: enrolmentsRouter,
})
export type TRPCRouter = typeof trpcRouter
