import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_learner/")({
  component: RouteComponent,

  // loader: async ({ context }) => {
  //   const feature = await context.queryClient.ensureQueryData(
  //     context.trpc.enrolments.detail.queryOptions({
  //       params: {
  //         uid: "43385c3f-4d1e-4e20-b027-94b784d38e51",
  //       },
  //       query: {
  //         excludeMaterial: true,
  //       },
  //     })
  //   )
  //   return { feature }
  // },
  loader: () => ({
    crumb: "Learning",
  }),
})

function RouteComponent() {
  return (
    <>
      Hello World
      {/* <Button.Root
        // className="bg-red-200"
        onClick={() => {
          signOut(auth)
        }}
      >
        Sign Out
      </Button.Root>
      <LearningHero uid="43385c3f-4d1e-4e20-b027-94b784d38e51" />
      <LearningForYou /> */}
    </>
  )
}
