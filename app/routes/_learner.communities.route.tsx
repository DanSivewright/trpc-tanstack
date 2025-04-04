import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/communities")({
  loader: () => ({
    crumb: "Communities",
  }),
})
