import { useState } from "react"
import {
  createFileRoute,
  isMatch,
  Outlet,
  useMatches,
} from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create"
)({
  loader: () => ({
    crumb: "Create",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  // const [activeStep, setActiveStep] = useState(0)

  // const steps = [
  //   { label: "Personal", indicator: "1" },
  //   { label: "Role", indicator: "2" },
  //   { label: "Position", indicator: "3" },
  // ]

  // const getState = (index: number) => {
  //   if (activeStep > index) return "completed"
  //   if (activeStep === index) return "active"
  //   return "default"
  // }
  // const matches = useMatches()
  // const matchesWithCrumbs = matches.filter((match) =>
  //   isMatch(match, "loaderData.crumb")
  // )

  // const items = matchesWithCrumbs.map(({ pathname, loaderData, routeId }) => {
  //   return {
  //     routeId,
  //     href: pathname,
  //     label: loaderData?.crumb,
  //   }
  // })
  return (
    <>
      <Outlet />
    </>
  )
}
