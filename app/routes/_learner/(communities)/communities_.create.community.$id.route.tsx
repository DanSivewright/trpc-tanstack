import React from "react"
import {
  createFileRoute,
  isMatch,
  Outlet,
  useMatches,
  useNavigate,
} from "@tanstack/react-router"

import * as HorizontalStepper from "@/components/ui/horizontal-stepper"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"

export const communitySteps = [
  {
    label: "Details",
    step: "details",
    indicator: "1",
  },

  {
    label: "Settings",
    step: "settings",
    indicator: "2",
  },
  {
    label: "Members",
    step: "members",
    indicator: "3",
  },
  {
    label: "Publish",
    step: "publish",
    indicator: "4",
  },
]
export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/community/$id"
)({
  loader: () => ({
    crumb: "Community",
    step: "details",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  // const { id } = Route.useParams()
  // const navigate = useNavigate()

  // const matches = useMatches()
  // const matchesWithSteps = matches.filter((match) =>
  //   isMatch(match, "loaderData.step")
  // )
  // const activeStep = communitySteps.find(
  //   (x) =>
  //     x.step === matchesWithSteps[matchesWithSteps.length - 1].loaderData?.step
  // )

  // const getState = (step: (typeof communitySteps)[number]) => {
  //   if (step.step === activeStep?.step) return "active"
  //   if (Number(step.indicator) < Number(activeStep?.indicator))
  //     return "completed"
  //   return "default"
  // }

  return (
    <>
      {/* <NavigationLearnerSubHeader
        hideBreadcrumbs
        mode="light"
        className="border-b border-bg-soft-200"
      >
        <HorizontalStepper.Root className="flex h-12 items-center">
          {communitySteps.map((step, index) => (
            <React.Fragment key={step.step + step.indicator}>
              <HorizontalStepper.Item
                state={getState(step)}
                onClick={() => {
                  const state = getState(step)
                  if (state !== "completed") return
                  const to = `/communities/create/community/$id${
                    step.step !== "details" ? `/${step.step}` : ""
                  }`
                  navigate({
                    to,
                    params: {
                      id,
                    },
                  })
                }}
              >
                <HorizontalStepper.ItemIndicator>
                  {step.indicator}
                </HorizontalStepper.ItemIndicator>
                {step.label}
              </HorizontalStepper.Item>
              {index < communitySteps.length - 1 && (
                <HorizontalStepper.SeparatorIcon />
              )}
            </React.Fragment>
          ))}
        </HorizontalStepper.Root>
      </NavigationLearnerSubHeader> */}
      <Outlet />
    </>
  )
}
