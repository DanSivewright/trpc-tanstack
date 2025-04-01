import { createTRPCRouter } from "./init"
import { communitiesRouter } from "./routers/communities"
import { enrolmentsRouter } from "./routers/enrolments"
import { peopleRouter } from "./routers/people"

export const trpcRouter = createTRPCRouter({
  enrolments: enrolmentsRouter,
  people: peopleRouter,
  communities: communitiesRouter,
})
export type TRPCRouter = typeof trpcRouter
