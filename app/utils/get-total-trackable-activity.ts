import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import type { z } from "zod"

export const getTotalTrackableActivity = (
  enrolment: z.infer<typeof EnrolmentsDetailSchema>,
  moduleSelectors?: string[]
) => {
  const filteredMaterial = moduleSelectors
    ? enrolment.publication.material.filter((module) =>
        moduleSelectors.includes(module.uid)
      )
    : enrolment.publication.material

  let total = filteredMaterial.length

  filteredMaterial.forEach((module) => {
    if (
      enrolment?.publication?.type === "external" ||
      enrolment?.publication?.type === "program"
    ) {
      return
    }

    if (enrolment?.publication?.type === "course" && "learning" in module) {
      total += module.learning.length ?? 0
    }
  })
  return total
}
