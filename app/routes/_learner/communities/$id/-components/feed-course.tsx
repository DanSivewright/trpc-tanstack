import type { courseFeedItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { z } from "zod"

type Props = z.infer<typeof courseFeedItemSchema>
const FeedCourse: React.FC<Props> = (feedItem) => {
  return (
    <div>
      {feedItem.type}: {feedItem.id}
    </div>
  )
}
export default FeedCourse
