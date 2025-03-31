import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import { getAuthToken, getTenantId } from "../auth"

// import { db } from "@/db";
// import { validateRequest } from "@/lib/auth";

export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  // const token = await getAuthToken()
  // const tenantId = await getTenantId()

  // console.log("token", token)
  // console.log("tenantId", tenantId)

  // console.log("headers:::", headers)
  const token = headers.get("authorization")?.split(" ")[1]
  const tenantId = headers.get("x-tenant-id")

  return {
    token,
    tenantId,
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
  if (!ctx.token || !ctx.tenantId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  console.log("ctx.token", ctx.token)
  console.log("ctx.tenantId", ctx.tenantId)

  return next({
    ctx: {
      token: ctx.token,
      tenantId: ctx.tenantId,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated)
