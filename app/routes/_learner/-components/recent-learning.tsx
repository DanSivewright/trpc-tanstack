import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { RiArrowRightSLine, RiCalendarLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import Image from "@/components/image"

type Props = {
  enrolment?: z.infer<typeof EnrolmentsDetailSchema>
  activityMap?: Map<string, EnrolmentActivityType>
}
const RecentLearning: React.FC<Props> = ({ enrolment, activityMap }) => {
  const trpc = useTRPC()
  const palette = useQuery({
    ...trpc.palette.get.queryOptions({
      url: enrolment?.publication?.featureImageUrl!,
    }),
    enabled: !!(enrolment?.publication?.featureImageUrl && enrolment),
  })
  const imagePath = useMemo(() => {
    if (!enrolment?.publication?.featureImageUrl) return null
    const match = enrolment?.publication?.featureImageUrl.match(/\/o\/([^?]+)/)
    if (!match) return null

    return decodeURIComponent(match[1])
  }, [enrolment?.publication?.featureImageUrl])
  if (!enrolment) return null
  return (
    <div className="col-span-12 flex flex-col gap-3 rounded-10 xl:col-span-4">
      <header className="flex items-center justify-between">
        <h3 className="text-title-h6">Resume Learning</h3>
      </header>
      <div className="relative flex h-[38vh] w-full flex-col gap-1.5 overflow-hidden rounded-10">
        {palette?.data && (
          <div
            style={{
              background: `linear-gradient(0deg, rgba(${palette?.data?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
            }}
            className="absolute inset-x-0 bottom-0 z-[1] h-[65%]"
          >
            <div className="gradient-blur">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
        <Image
          lqip={{
            active: true,
            quality: 1,
            blur: 50,
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="absolute inset-0 h-full w-full object-cover"
          path={imagePath ?? ""}
        />
        <div
          style={{
            color: palette?.data?.LightMuted?.titleTextColor,
          }}
          className="absolute inset-0 z-10 flex flex-col justify-end gap-2 p-3"
        >
          {enrolment?.dueDate && (
            <Badge.Root className="w-fit">
              <Badge.Icon as={RiCalendarLine} />
              {format(new Date(enrolment?.dueDate), "MMM d, yyyy")}
            </Badge.Root>
          )}
          <h1 className="line-clamp-3 text-title-h5">
            {enrolment?.publication?.publishedBy && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Avatar.Root className="mr-2 inline-flex" size="20">
                    <Avatar.Image
                      src={enrolment?.publication?.publishedBy?.imageUrl}
                    />
                  </Avatar.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  Publisher: {enrolment?.publication?.publishedBy?.name}
                </Tooltip.Content>
              </Tooltip.Root>
            )}

            {enrolment.publication.title}
          </h1>
          <p className="line-clamp-2 text-label-sm opacity-70">
            {enrolment.publication.summary ||
              enrolment?.publication?.translations?.["1"]?.summary}
          </p>
          {enrolment?.publication?.topics && (
            <div className="flex flex-wrap gap-2">
              {enrolment?.publication?.topics?.map((topic) => (
                <Badge.Root
                  {...(palette?.data?.LightMuted?.rgb
                    ? {
                        style: {
                          backgroundColor: `rgba(${palette?.data?.DarkVibrant?.rgb?.join(",")}, 1)`,
                        },
                      }
                    : {
                        color: "blue",
                      })}
                  key={topic}
                >
                  {topic}
                </Badge.Root>
              ))}
            </div>
          )}
          <Button.Root
            variant="neutral"
            mode="lighter"
            className="mt-2 w-fit rounded-full p-0.5 pl-3"
          >
            <span>Continue Learning</span>
            <div className="flex aspect-square h-full items-center justify-center rounded-full bg-bg-strong-950">
              <Button.Icon className="fill-bg-white-0" as={RiArrowRightSLine} />
            </div>
          </Button.Root>
        </div>
      </div>
    </div>
  )
}
export default RecentLearning
