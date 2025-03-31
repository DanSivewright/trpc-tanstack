import { createServerFn } from "@tanstack/react-start"
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server"
import { z } from "zod"

const AUTH_COOKIE_NAME = "auth_token"
const TENANT_COOKIE_NAME = "tenant_id"
export const setAuthCookies = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      tenantId: z.string().optional().nullable(),
    })
  )
  .handler(async (ctx) => {
    const expiresAt = new Date(Date.now() + 3500 * 1000)

    setCookie(AUTH_COOKIE_NAME, ctx.data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    })

    if (ctx.data.tenantId) {
      setCookie(TENANT_COOKIE_NAME, ctx.data.tenantId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/",
      })
    }
  })

export const clearAuthCookies = createServerFn({ method: "POST" }).handler(
  async () => {
    deleteCookie(AUTH_COOKIE_NAME)
    deleteCookie(TENANT_COOKIE_NAME)
  }
)

export const getAuthToken = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getCookie(AUTH_COOKIE_NAME)
  }
)

export const getTenantId = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getCookie(TENANT_COOKIE_NAME)
  }
)
