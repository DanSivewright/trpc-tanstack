import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
// import { auth } from "./lib/firebase";
import { TRPCProvider } from "./lib/trpc/react";
import type { TRPCRouter } from "./lib/trpc/router";
import { routeTree } from "./routeTree.gen";
import { auth } from "./lib/firebase";

// NOTE: Most of the integration code found here is experimental and will
// definitely end up in a more streamlined API in the future. This is just
// to show what's possible with the current APIs.
const getRequestHeaders = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getWebRequest()!;
    const headers = new Headers(request.headers);

    return Object.fromEntries(headers);
  },
);

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (import.meta.env.VERCEL_URL)
      return `https://${import.meta.env.VERCEL_URL}`;
    return `http://localhost:${import.meta.env.PORT ?? 3000}`;
  })();
  return base + "/api/trpc";
}

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

  const trpcClient = createTRPCClient<TRPCRouter>({
    links: [
      httpBatchStreamLink({
        transformer: superjson,
        url: getUrl(),
        async headers() {
          const headers = await getRequestHeaders();
          const token = window.localStorage.getItem("token");
          const tenantId = window.localStorage.getItem("tenantId");

          // Check if token is expired and needs refresh
          const tokenExpiration =
            window.localStorage.getItem("tokenExpiration");
          if (tokenExpiration && Date.now() >= Number(tokenExpiration)) {
            const newToken = await auth.currentUser?.getIdToken(true);
            if (newToken) {
              window.localStorage.setItem("token", newToken);
              window.localStorage.setItem(
                "tokenExpiration",
                String(Date.now() + 3500 * 1000),
              );
            }
          }

          return {
            ...headers,
            Authorization: token ? `Bearer ${token}` : "",
            "x-tenant-id": tenantId ?? "",
          };
        },
      }),
    ],
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });

  const router = createTanStackRouter({
    context: {
      queryClient,
      trpc: serverHelpers,
    },
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    Wrap: (props) => {
      return (
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {props.children}
        </TRPCProvider>
      );
    },
  });

  // @ts-ignore
  return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
