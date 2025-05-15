import { useTRPC } from "@/integrations/trpc/react"
import type { courseFeedItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { RiMessageLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Button } from "@/components/ui/button"
import { FancyButton } from "@/components/ui/fancy-button"
import { Tooltip } from "@/components/ui/tooltip"

import LikesButton from "../../-components/likes-button"

type Props = z.infer<typeof courseFeedItemSchema>
const FeedCourse: React.FC<Props> = (feedItem) => {
  const course = feedItem.data
  const trpc = useTRPC()

  const commentsCount = useQuery(
    trpc.communities.interactionsCountForCollectionGroup.queryOptions({
      collectionGroup: feedItem.group,
      collectionGroupDocId: feedItem.input.courseId,
      interactionType: "comments",
      communityId: feedItem.input.communityId,
    })
  )

  return (
    <div className="flex flex-col gap-2">
      <Link
        to="/communities/$id/courses/$courseId"
        resetScroll={true}
        search={{
          type: course?.type + "s",
          typeUid: course?.typeUid!,
        }}
        params={{
          courseId: feedItem.input.courseId,
          id: feedItem.input.communityId,
          // id: feedThread.input.communityId,
          // threadId: feedThread?.data?.id || "",
        }}
        className="relative flex flex-col gap-1.5"
      >
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2">
            <Avatar.Root className="relative size-6 xl:absolute xl:-left-16 xl:top-0 xl:block xl:size-12">
              {feedItem?.author?.avatarUrl ? (
                <Avatar.Image src={feedItem?.author?.avatarUrl} />
              ) : (
                feedItem?.author?.name?.[0]
              )}
            </Avatar.Root>
            <p className="text-label-lg font-medium">
              {feedItem?.author?.name?.split(" ")[0]}{" "}
              {feedItem?.author?.name?.split(" ")[1][0]}.
            </p>
          </div>
          <p className="mb-0.5 text-label-xs font-light text-text-soft-400">
            <span className="font-normal capitalize text-text-strong-950">
              {feedItem?.verb}
            </span>{" "}
            a new{" "}
            <span className="font-normal capitalize text-text-strong-950">
              {feedItem?.type}
            </span>{" "}
            •{" "}
            {formatDistance(feedItem.createdAt, new Date(), {
              addSuffix: true,
            })}
          </p>
        </div>

        <div className="w-full rounded-[16px] bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200 drop-shadow-2xl">
          <div className="overflow-hidden rounded-xl ring-1 ring-stroke-soft-200 drop-shadow-xl">
            <div className="relative z-10 aspect-[16/7] overflow-hidden rounded-xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 focus:outline-none">
              {course?.content?.featureImageUrl ? (
                <img
                  src={course?.content?.featureImageUrl || undefined}
                  className="absolute inset-0 z-0 h-full w-full object-cover"
                  alt={course?.title + " featured image"}
                />
              ) : (
                <div className="absolute inset-0 z-0 h-full w-full bg-primary-darker" />
              )}
            </div>
            <div className="relative z-0 -mt-[9px] w-full bg-bg-weak-50 pt-[9px]">
              <div className="flex w-full items-start justify-between gap-4 px-3.5 py-1.5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-pretty text-title-h5">{course?.title}</h2>
                  <p className="line-clamp-3 text-pretty text-label-sm text-text-sub-600">
                    {course?.caption}
                  </p>
                </div>
                {course?.enrolments && course?.enrolments.length > 0 && (
                  <>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <AvatarGroupCompact.Root size="24">
                          <AvatarGroupCompact.Stack>
                            {course?.enrolments
                              ?.slice(0, 3)
                              .map((enrolment) => (
                                <Avatar.Root color="sky">
                                  {enrolment.enrollee.avatarUrl ? (
                                    <Avatar.Image
                                      src={enrolment.enrollee.avatarUrl}
                                    />
                                  ) : (
                                    enrolment?.enrollee?.firstName?.[0]
                                  )}
                                </Avatar.Root>
                              ))}
                          </AvatarGroupCompact.Stack>
                          {course?.enrolments.length > 3 && (
                            <AvatarGroupCompact.Overflow>
                              +{course?.enrolments.length - 3}
                            </AvatarGroupCompact.Overflow>
                          )}
                        </AvatarGroupCompact.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Community Enrolments</Tooltip.Content>
                    </Tooltip.Root>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <LikesButton
          collectionGroup={feedItem.group}
          collectionGroupDocId={feedItem.input.courseId}
          communityId={feedItem.input.communityId}
        />
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="ghost" size="xxsmall">
              <Button.Icon as={RiMessageLine} />
              {commentsCount?.data?.total && commentsCount?.data?.total > 0
                ? commentsCount.data?.total
                : null}
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Comments</Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>
  )
}
export default FeedCourse
