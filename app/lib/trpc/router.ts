import { createTRPCRouter } from "./init"
import { enrolmentsRouter } from "./routers/enrolments"
import { peopleRouter } from "./routers/people"

export const trpcRouter = createTRPCRouter({
  enrolments: enrolmentsRouter,
  people: peopleRouter,
})
export type TRPCRouter = typeof trpcRouter
