import { createTRPCRouter } from "./init"
import { communitiesRouter } from "./routers/communities"
import { enrolmentsRouter } from "./routers/enrolments"
import { paletteRouter } from "./routers/palette"
import { peopleRouter } from "./routers/people"

export const trpcRouter = createTRPCRouter({
  enrolments: enrolmentsRouter,
  people: peopleRouter,
  communities: communitiesRouter,
  palette: paletteRouter,
})
export type TRPCRouter = typeof trpcRouter
