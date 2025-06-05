// app/routes/__root.tsx
import type { ReactNode } from "react"
import type { TRPCRouter } from "@/integrations/trpc/router"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"

import { NotificationProvider } from "@/components/ui/notification-provider"
import { Toaster } from "@/components/ui/toast"
import { Provider as TooltipProvider } from "@/components/ui/tooltip"
import CacheBuster from "@/components/cache-buster"
import { AuthProvider } from "@/components/providers/auth-provider"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import appCss from "@/styles/app.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<TRPCRouter>
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
        <CacheBuster />
        {/* <TanStackRouterDevtools position="bottom-right" /> */}
        <ReactQueryDevtools buttonPosition="bottom-left" />
        {/* <TailwindIndicator /> */}
        <NotificationProvider />
        <Toaster />

        <Scripts />
      </body>
    </html>
  )
}
