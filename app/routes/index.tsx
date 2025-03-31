import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { signOut } from "firebase/auth"

import { auth } from "@/lib/firebase"
import { useTRPC } from "@/lib/trpc/react"
import { Button } from "@/components/ui/button"
import LearningHero from "@/components/learning/learning-feature"

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const feature = await context.queryClient.ensureQueryData(
      context.trpc.enrolments.detail.queryOptions({
        params: {
          uid: "43385c3f-4d1e-4e20-b027-94b784d38e51",
        },
        query: {
          excludeMaterial: true,
        },
      })
    )
    return { feature }
  },
})

function RouteComponent() {
  return (
    <>
      <LearningHero uid="43385c3f-4d1e-4e20-b027-94b784d38e51" />
    </>
  )
}
