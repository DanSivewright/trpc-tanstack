import type { threadFeedItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { Link } from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"

type Props = z.infer<typeof threadFeedItemSchema>
const FeedTread: React.FC<Props> = (feedThread) => {
  return (
    <Link
      to="/communities/$id/threads/$threadId"
      params={{
        id: feedThread.input.communityId,
        threadId: feedThread.input.threadId,
      }}
      className="relative flex flex-col gap-1.5"
    >
      <Avatar.Root className="absolute -left-14 top-0" size="48">
        {feedThread?.author?.avatarUrl ? (
          <Avatar.Image src={feedThread?.author?.avatarUrl} />
        ) : (
          feedThread?.author?.name?.[0]
        )}
      </Avatar.Root>
      <div className="flex items-center gap-2">
        <p className="text-label-lg font-medium">
          {feedThread?.author?.name?.split(" ")[0]}{" "}
          {feedThread?.author?.name?.split(" ")[1][0]}.
        </p>
        <p className="mt-0.5 text-label-xs font-light text-text-soft-400">
          {formatDistance(feedThread.createdAt, new Date(), {
            addSuffix: true,
          })}
        </p>
      </div>
      <pre>{JSON.stringify(feedThread, null, 2)}</pre>
    </Link>
  )
}
export default FeedTread
