import { useNavigate } from "@tanstack/react-router"

import { communitySteps } from "../route"

type CommunityStep = (typeof communitySteps)[number]["step"]

interface UseGoToNextStepProps {
  id: string
}

export const useGoToNextStep = ({ id }: UseGoToNextStepProps) => {
  const navigate = useNavigate()

  const goToStep = (step: CommunityStep) => {
    switch (step) {
      case "settings":
        navigate({
          to: "/communities/create/$id/community/settings",
          params: { id },
        })
        break
      case "members":
        navigate({
          to: "/communities/create/$id/community/members",
          params: { id },
        })
        break
      case "publish":
        navigate({
          to: "/communities/create/$id/community/publish",
          params: { id },
        })
        break
      case "details":
        navigate({
          to: "/communities/create/$id/community",
          params: { id },
        })
        break
      default:
        navigate({
          to: "/communities/create/$id/community",
          params: { id },
        })
    }
  }

  return { goToStep }
}
