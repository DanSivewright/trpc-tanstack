import { useTRPC } from "@/integrations/trpc/react"
import type { communityItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import { RiCheckboxCircleFill } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"

type Props = {
  // source: z.infer<typeof communityItemSchema> & { type: "thread" }
  source: Extract<z.infer<typeof communityItemSchema>, { type: "course" }>
  size: "small" | "large"
  className?: string
}
const FeaturedCourse: React.FC<Props> = ({ source, size, className }) => {
  const course = source

  const trpc = useTRPC()

  const modules = useQuery({
    ...trpc.content.modules.queryOptions({
      params: {
        type: course?.typeAccessor,
        typeUid: course.typeUid,
      },
    }),
  })

  const imagePath = getPathFromGoogleStorage(
    course?.content?.featureImageUrl || ""
  )
  return (
    <button
      // params={{
      //   id: thread?.communityId,
      //   threadId: thread?.id,
      // }}
      // onMouseOver={() => {
      //   queryClient.prefetchQuery(
      //     trpc.communities.threads.detail.queryOptions({
      //       communityId: thread?.communityId,
      //       threadId: thread?.id,
      //     })
      //   )
      //   queryClient.prefetchQuery(
      //     trpc.communities.comments.all.queryOptions({
      //       communityId: thread?.communityId,
      //       collectionGroup: "threads",
      //       collectionGroupDocId: thread?.id,
      //     })
      //   )
      // }}
      className={cn(
        "relative col-span-8 flex h-full w-full flex-1 flex-col overflow-hidden rounded-10 ring-1 ring-stroke-soft-200",
        {},
        className
      )}
      // preload="intent"
      // {...(size === "small"
      //   ? {
      //       className: cn(
      //         "relative h-full overflow-hidden w-full grow rounded-10 ring-1 ring-stroke-soft-200",
      //         {
      //           "bg-primary-base/80": !hasImages && !featuredImage,
      //         },
      //         className
      //       ),
      //     }
      //   : {
      //       className: cn(
      //         "relative col-span-8 w-full overflow-hidden rounded-10 ring-1 ring-stroke-soft-200",
      //         {
      //           "aspect-[16/13] h-full bg-primary-base/80":
      //             !hasImages && !featuredImage && !hasVideo && !featuredVideo,
      //           "flex aspect-auto h-full max-h-[calc(100vh-128px)] flex-1 flex-col overflow-auto bg-bg-weak-50":
      //             hasVideo && featuredVideo,
      //           "aspect-[16/13] h-full":
      //             hasImages && featuredImage && !hasVideo && !featuredVideo,
      //         },
      //         className
      //       ),
      //     })}
    >
      <div className="relative flex w-full grow items-end gap-7 border-b border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-md">
        <div className="relative aspect-square h-full overflow-hidden rounded-xl bg-primary-base">
          {imagePath ? (
            <Image
              className="absolute inset-0 h-full w-full object-cover"
              path={imagePath || ""}
              alt={course?.title || "Course image"}
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
            {course?.title}
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
      <Grid gap="none" className="min-h-[50%] w-full gap-4 bg-bg-weak-50 p-5">
        {modules?.data?.slice(0, 8)?.map((material) => {
          const modImagePath = getPathFromGoogleStorage(
            material?.moduleVersion?.module?.featureImageUrl || ""
          )
          // const act = activity.flat.get(material.uid)
          return (
            <Tooltip.Root key={material.uid}>
              <Tooltip.Trigger asChild>
                <div className="relative col-span-3 aspect-square overflow-hidden rounded-xl bg-primary-base p-2">
                  <Badge.Root
                    square
                    className="absolute left-1.5 top-1.5 z-10 aspect-square p-0.5"
                    // color={
                    //   act?.status === "completed"
                    //     ? "green"
                    //     : act?.status === "in-progress"
                    //       ? "blue"
                    //       : "gray"
                    // }
                  >
                    <RiCheckboxCircleFill className="size-3" />
                    {/* {act?.status === "completed" ? (
                      <RiCheckboxCircleFill className="size-3" />
                    ) : (
                      <RiRecordCircleLine className="size-3" />
                    )} */}
                  </Badge.Root>
                  <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    path={modImagePath || ""}
                    alt={
                      material?.moduleVersion?.module?.content?.title +
                      " module image"
                    }
                    // alt={
                    //   material.moduleVersion?.module?.translations["1"]
                    //     ?.title?.[0] || "Course image"
                    // }
                  />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content className="capitalize">
                <p>
                  {/* {act?.status.replace("-", " ")}:{" "} */}
                  {material?.moduleVersion?.module?.content?.title}
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          )
        })}
      </Grid>
    </button>
  )
}
export default FeaturedCourse
