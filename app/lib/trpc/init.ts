import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "../firebase";
// import { db } from "@/db";
// import { validateRequest } from "@/lib/auth";

export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  // Get token from Authorization header
  const authHeader = headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const tenantId = headers.get("x-tenant-id");

  return {
    token,
    tenantId,
    // db,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
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
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.token || !ctx.tenantId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      token: ctx.token,
      tenantId: ctx.tenantId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated);
