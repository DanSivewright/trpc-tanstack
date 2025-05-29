import { useMemo } from "react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import {
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiRecordCircleLine,
} from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import type { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"

type Props = {
  enrolments?: z.infer<typeof EnrolmentsDetailSchema>[]
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
}
const CoursesLastActive: React.FC<Props> = ({ enrolments, activity }) => {
  const enrolment = useMemo(() => {
    if (!enrolments?.length) return null

    return enrolments.reduce((mostRecent, current) => {
      if (!current?.activity?.length) return mostRecent

      const currentLatestActivity = current.activity?.reduce(
        (latest, activity) => {
          return !latest ||
            new Date(activity.createdAt) > new Date(latest.createdAt)
            ? activity
            : latest
        },
        current.activity[0]
      )

      if (!mostRecent?.activity?.length) return current

      const mostRecentActivity = mostRecent.activity.reduce(
        (latest, activity) => {
          return !latest ||
            new Date(activity.createdAt) > new Date(latest.createdAt)
            ? activity
            : latest
        },
        mostRecent.activity[0]
      )

      return new Date(currentLatestActivity.createdAt) >
        new Date(mostRecentActivity.createdAt)
        ? current
        : mostRecent
    }, enrolments[0])
  }, [enrolments])

  if (!enrolment) return null
  const imagePath = getPathFromGoogleStorage(
    enrolment.publication.featureImageUrl || ""
  )
  return (
    <div className="col-span-12 flex aspect-square h-full w-full flex-1 flex-col overflow-hidden rounded-[22px] ring-1 ring-stroke-soft-200 xl:col-span-4">
      <div className="relative flex w-full grow items-end gap-7 border-b border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-md">
        <div className="relative aspect-square h-full overflow-hidden rounded-xl bg-primary-base">
          {imagePath ? (
            <Image
              className="absolute inset-0 h-full w-full object-cover"
              path={imagePath || ""}
              alt={enrolment.publication.title || "Course image"}
              sizes={`
                (max-width: 640px) 100vw,
                (max-width: 1280px) 50vw,
                15vw
              `}
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="flex flex-col">
          <p className="text-label-xs text-text-soft-400">RECENTLY ACTIVE</p>
          <p className="line-clamp-2 text-pretty text-title-h5">
            {enrolment.publication.title}
          </p>
          <Button.Root
            variant="primary"
            mode="lighter"
            size="small"
            className="mt-2 w-fit rounded-full p-0.5 pl-3"
            asChild
          >
            <a
              href={`https://beta.i-win.io/enrolments/${enrolment?.uid}/modules/${enrolment?.continue?.moduleUid || enrolment?.publication?.material?.[0]?.uid}/learning/${enrolment?.continue?.lessonUid || enrolment?.publication?.material?.[0]?.learning?.[0]?.uid}/courses`}
              target="_blank"
              rel="noreferrer"
            >
              <span>Continue</span>
              <div className="flex aspect-square h-full items-center justify-center rounded-full bg-primary-base">
                <Button.Icon
                  className="fill-bg-white-0"
                  as={RiArrowRightSLine}
                />
              </div>
            </a>
          </Button.Root>
        </div>
      </div>
      <Grid gap="none" className="w-full gap-4 bg-bg-weak-50 p-5">
        {enrolment?.publication?.material?.slice(0, 8)?.map((material) => {
          const modImagePath = getPathFromGoogleStorage(
            material?.moduleVersion?.module?.featureImageUrl || ""
          )
          const act = activity.flat.get(material.uid)
          return (
            <Tooltip.Root key={material.uid}>
              <Tooltip.Trigger asChild>
                <div className="relative col-span-3 aspect-square overflow-hidden rounded-xl bg-primary-base p-2">
                  <Badge.Root
                    square
                    className="absolute left-1.5 top-1.5 z-10 aspect-square p-0.5"
                    color={
                      act?.status === "completed"
                        ? "green"
                        : act?.status === "in-progress"
                          ? "blue"
                          : "gray"
                    }
                  >
                    {act?.status === "completed" ? (
                      <RiCheckboxCircleFill className="size-3" />
                    ) : (
                      <RiRecordCircleLine className="size-3" />
                    )}
                  </Badge.Root>
                  <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    path={modImagePath || ""}
                    alt={
                      material.moduleVersion?.module?.translations["1"]
                        ?.title?.[0] || "Course image"
                    }
                  />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content className="capitalize">
                <p>
                  {act?.status.replace("-", " ")}:{" "}
                  {material.moduleVersion?.module?.translations["1"]?.title}
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          )
        })}
      </Grid>
    </div>
  )
}
export default CoursesLastActive
