import React from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  isMatch,
  Outlet,
  useMatches,
  useNavigate,
} from "@tanstack/react-router"

import { HorizontalStepper } from "@/components/ui/horizontal-stepper"
import NavigationLearnerSubHeader from "@/components/navigation/navigation-learner/navigation-learner-sub-header"

export const Route = createFileRoute("/_learner/communities/create/course")({
  component: RouteComponent,
})

export const courseSteps = [
  {
    label: "Select Communities",
    step: "community",
    indicator: "1",
  },
  {
    label: "Select Courses",
    step: "courses",
    indicator: "2",
  },
  {
    label: "Enrolments",
    step: "enrolments",
    indicator: "3",
  },
  {
    label: "Publish",
    step: "publish",
    indicator: "4",
  },
]
function RouteComponent() {
  const navigate = useNavigate()

  const trpc = useTRPC()
  const qc = useQueryClient()

  const matches = useMatches()
  const matchesWithSteps = matches.filter((match) =>
    isMatch(match, "loaderData.step")
  )
  const activeStep = courseSteps.find(
    (x) =>
      x.step === matchesWithSteps[matchesWithSteps.length - 1].loaderData?.step
  )

  const getState = (step: (typeof courseSteps)[number]) => {
    if (step.step === activeStep?.step) return "active"
    if (Number(step.indicator) < Number(activeStep?.indicator))
      return "completed"
    return "default"
  }
  return (
    <>
      <NavigationLearnerSubHeader
        hideBreadcrumbs
        mode="light"
        className="border-b border-bg-soft-200"
      >
        <HorizontalStepper.Root className="flex h-12 items-center">
          {courseSteps.map((step, index) => (
            <React.Fragment key={step.step + step.indicator}>
              <HorizontalStepper.Item
                state={getState(step)}
                onMouseOver={() => {
                  qc.prefetchQuery(trpc.communities.adminOf.queryOptions())
                }}
                onClick={() => {
                  const state = getState(step)
                  if (state !== "completed") return
                  navigate({
                    to: "/communities/create/course",
                  })
                }}
              >
                <HorizontalStepper.ItemIndicator>
                  {step.indicator}
                </HorizontalStepper.ItemIndicator>
                {step.label}
              </HorizontalStepper.Item>
              {index < courseSteps.length - 1 && (
                <HorizontalStepper.SeparatorIcon />
              )}
            </React.Fragment>
          ))}
        </HorizontalStepper.Root>
      </NavigationLearnerSubHeader>
      <Outlet />
    </>
  )
}
