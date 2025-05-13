import { createTRPCRouter } from "./init"
import { cacheRouter } from "./routers/cache"
import { communitiesRouter } from "./routers/communities"
import { contentRouter } from "./routers/content"
import { enrolmentsRouter } from "./routers/enrolments"
import { paletteRouter } from "./routers/palette"
import { peopleRouter } from "./routers/people"

// import { z } from 'zod'

export const trpcRouter = createTRPCRouter({
  enrolments: enrolmentsRouter,
  people: peopleRouter,
  communities: communitiesRouter,
  palette: paletteRouter,
  content: contentRouter,
  cache: cacheRouter,
})
export type TRPCRouter = typeof trpcRouter
