import type { commentFeedItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { Link } from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import type { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { LinkButton } from "@/components/ui/link-button"

type Props = z.infer<typeof commentFeedItemSchema>
const FeedComment: React.FC<Props> = (feedComment) => {
  const contentSize = useElementSize()
  const { notification } = useNotification()
  return (
    <Link
      {...(feedComment?.input?.accessorGroup === "threads"
        ? {
            to: "/communities/$id/threads/$threadId",
            params: {
              id: feedComment?.input?.communityId,
              threadId: feedComment?.input?.accessorGroupDocId,
            },
            preload: "intent",
            hash: feedComment?.input?.commentId,
          }
        : {
            to: "/",
            onClick: (e) => {
              e.preventDefault()
              e.stopPropagation()
              notification({
                title: "Coming soon",
                description: "This feature is coming soon",
              })
            },
          })}
      className="relative flex w-full flex-col gap-1.5"
    >
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-2">
          <Avatar.Root className="relative size-6 xl:absolute xl:-left-16 xl:top-0 xl:block xl:size-12">
            {feedComment?.author?.avatarUrl ? (
              <Avatar.Image src={feedComment?.author?.avatarUrl} />
            ) : (
              feedComment?.author?.name?.[0]
            )}
          </Avatar.Root>
          <p className="text-label-lg font-medium">
            {feedComment?.author?.name?.split(" ")[0]}{" "}
            {feedComment?.author?.name?.split(" ")[1][0]}.
          </p>
        </div>
        <p className="mb-0.5 text-label-xs font-light text-text-soft-400">
          <span className="font-normal capitalize text-text-strong-950">
            {feedComment?.verb}
          </span>{" "}
          in{" "}
          <LinkButton.Root
            className="font-normal"
            variant="primary"
            size="small"
            underline
          >
            {feedComment?.groupData?.title}
          </LinkButton.Root>{" "}
          •{" "}
          {formatDistance(feedComment.createdAt, new Date(), {
            addSuffix: true,
          })}
        </p>
      </div>

      {feedComment?.descriptor && (
        <div className="relative max-h-72 w-full overflow-hidden">
          <div
            ref={contentSize.ref}
            dangerouslySetInnerHTML={{
              __html: feedComment?.descriptor,
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
    </Link>
  )
}
export default FeedComment
