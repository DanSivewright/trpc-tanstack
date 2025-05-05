import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  const token = headers.get("authorization")?.split(" ")[1]
  const tenantId = headers.get("x-tenant-id")
  const uid = headers.get("uid")
  const companyUid = headers.get("company-uid")
  return {
    token,
    tenantId,
    uid,
    companyUid,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.token || !ctx.tenantId || !ctx.uid) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      token: ctx.token,
      tenantId: ctx.tenantId,
      uid: ctx.uid,
      companyUid: ctx.companyUid,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated)
