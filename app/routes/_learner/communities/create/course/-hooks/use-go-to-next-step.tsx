import { useNavigate } from "@tanstack/react-router"

import { courseSteps } from "../route"

type CourseStep = (typeof courseSteps)[number]["step"]

type StepParams = {
  community: Record<string, never>
  courses: { communityIds: string[] }
  enrolments: Record<string, never>
}

export const useGoToNextStep = () => {
  const navigate = useNavigate()

  function goToStep(step: "community", params: StepParams["community"]): void
  function goToStep(step: "courses", params: StepParams["courses"]): void
  function goToStep(step: "enrolments", params: StepParams["enrolments"]): void
  function goToStep(step: CourseStep, params: StepParams[keyof StepParams]) {
    switch (step) {
      case "community":
        navigate({
          to: "/communities/create/course",
        })
        break
      case "courses": {
        const { communityIds } = params as StepParams["courses"]
        navigate({
          to: "/communities/create/course/select-courses",
          search: { communityIds },
        })
        break
      }
      case "enrolments":
        navigate({
          to: "/communities/create/course/enrolments",
        })
        break
      default:
        navigate({
          to: "/communities/create/course",
        })
    }
  }

  return { goToStep }
}
