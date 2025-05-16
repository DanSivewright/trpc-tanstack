import { useTRPC } from "@/integrations/trpc/react"
import type { threadFeedItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import {
  RiAttachmentLine,
  RiDownloadLine,
  RiMessageLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import type { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileFormatIcon } from "@/components/ui/file-format-icon"
import { LinkButton } from "@/components/ui/link-button"
import { Tag } from "@/components/ui/tag"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"

import LikesButton from "../../-components/likes-button"

type Props = z.infer<typeof threadFeedItemSchema>
const FeedTread: React.FC<Props> = (feedThread) => {
  const thread = feedThread.data

  const trpc = useTRPC()

  const commentsCount = useQuery(
    trpc.communities.interactionsCountForCollectionGroup.queryOptions({
      collectionGroup: feedThread.group,
      collectionGroupDocId: feedThread.input.threadId,
      interactionType: "comments",
      communityId: feedThread.input.communityId,
    })
  )

  const contentSize = useElementSize()
  return (
    <div className="flex flex-col gap-2">
      <Link
        to="/communities/$id/threads/$threadId"
        resetScroll={true}
        params={{
          id: feedThread.input.communityId,
          threadId: feedThread?.data?.id || "",
        }}
        className="relative flex flex-col gap-1.5"
      >
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2">
            <Avatar.Root className="relative size-6 xl:absolute xl:-left-16 xl:top-0 xl:block xl:size-12">
              {feedThread?.author?.avatarUrl ? (
                <Avatar.Image src={feedThread?.author?.avatarUrl} />
              ) : (
                feedThread?.author?.name?.[0]
              )}
            </Avatar.Root>
            <p className="text-label-lg font-medium">
              {feedThread?.author?.name?.split(" ")[0]}{" "}
              {feedThread?.author?.name?.split(" ")[1][0]}.
            </p>
          </div>
          <p className="mb-0.5 text-label-xs font-light text-text-soft-400">
            <span className="font-normal capitalize text-text-strong-950">
              {feedThread?.verb}
            </span>{" "}
            a new{" "}
            <span className="font-normal capitalize text-text-strong-950">
              {feedThread?.type}
            </span>{" "}
            •{" "}
            {formatDistance(feedThread.createdAt, new Date(), {
              addSuffix: true,
            })}
          </p>
        </div>
        {thread?.attachments &&
        thread?.attachments?.length &&
        thread?.images?.length ? (
          <div className="mb-4 flex w-full flex-wrap items-center gap-2">
            {thread?.attachments &&
              thread?.attachments.length > 0 &&
              thread?.attachments.slice(0, 2).map((att) => {
                return (
                  <Tag.Root key={att.name}>
                    <Tag.Icon
                      as={FileFormatIcon.Root}
                      size="small"
                      format={att.mimeType?.split("/")[1]}
                      color="blue"
                    />
                    {att.name}
                  </Tag.Root>
                )
              })}
            {thread?.attachments && thread?.attachments.length > 2 && (
              <Tag.Root>
                <Tag.Icon as={RiAttachmentLine} size="small" />+
                {thread?.attachments.length - 2} File
                {thread?.attachments.length - 2 > 1 ? "s" : ""}
              </Tag.Root>
            )}
          </div>
        ) : null}

        <p className="text-title-h6">{thread?.title}</p>
        {thread?.content && (
          <div className="relative max-h-72 overflow-hidden">
            <div
              ref={contentSize.ref}
              dangerouslySetInnerHTML={{
                __html: thread?.content,
              }}
              className="tiptap ProseMirror"
            ></div>
            {contentSize.height > 288 && (
              <div className="absolute inset-x-0 bottom-0 z-10 flex h-1/2 flex-col items-center justify-end bg-gradient-to-t from-bg-white-0 to-transparent pb-12">
                <LinkButton.Root
                  variant="primary"
                  size="small"
                  className="relative z-10"
                >
                  Go to thread
                </LinkButton.Root>
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
          </div>
        )}
        {thread?.attachments &&
        thread?.attachments?.length === 1 &&
        thread?.images?.length === 0 ? (
          <div className="mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-10 border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 transition-all">
            <div className="flex items-center gap-2">
              <FileFormatIcon.Root
                size="small"
                format={thread?.attachments[0].mimeType?.split("/")[1]}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-label-sm font-light text-text-sub-600">
                  {thread?.attachments[0].name}
                </p>
                <p className="text-label-xs font-light text-text-soft-400">
                  {thread?.attachments[0].mimeType}
                </p>
              </div>
            </div>
            <RiDownloadLine className="size-4 text-text-soft-400" />
          </div>
        ) : null}
        {thread?.images && thread?.images?.length > 0 ? (
          <>
            {thread?.images.length < 3 ? (
              <Grid gap="none" className="mt-2 gap-1">
                {thread?.images.map((g) => {
                  const span = {
                    1: "col-span-12",
                    2: "col-span-6",
                  }[thread.images!.length]
                  return (
                    <Image
                      key={g.id}
                      path={g.path!}
                      lqip={{
                        active: true,
                        quality: 1,
                        blur: 50,
                      }}
                      className={cn(
                        "aspect-video w-full overflow-hidden rounded-[4px] object-cover",
                        span
                      )}
                      // alt={`Community ${c.name} image`}
                    />
                  )
                })}
              </Grid>
            ) : null}
            {thread?.images.length >= 3 ? (
              <Grid gap="none" className="mt-2 gap-1">
                {thread?.images.slice(0, 4).map((g, gi) => {
                  let span = ""
                  if (gi === 0) {
                    span = "col-span-12"
                  } else {
                    if (thread.images!.length - 1 === 2) {
                      span = "col-span-6"
                    } else {
                      span = "col-span-4"
                    }
                  }

                  const isLast = gi === 3
                  const amountExtra = thread.images!.length - 4

                  return (
                    <div
                      className={cn(
                        "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[4px]",
                        span
                      )}
                      key={g.id}
                    >
                      {g.path}
                      {isLast && amountExtra > 0 && (
                        <div className="absolute z-10 flex h-full w-full items-center justify-center bg-black/60">
                          <span className="relative z-10 text-title-h4 text-bg-white-0">
                            +{amountExtra}
                          </span>
                        </div>
                      )}
                      <Image
                        key={g.id}
                        path={g.path!}
                        lqip={{
                          active: true,
                          quality: 1,
                          blur: 50,
                        }}
                        className="absolute inset-0 z-0 h-full w-full object-cover"
                      />
                    </div>
                  )
                })}
              </Grid>
            ) : null}
          </>
        ) : null}
      </Link>
      <div className="flex items-center gap-2">
        <LikesButton
          collectionGroup={feedThread.group}
          collectionGroupDocId={feedThread.id}
          communityId={feedThread.input.communityId}
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
export default FeedTread
