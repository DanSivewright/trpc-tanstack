import { useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communityItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import { RiHashtag } from "@remixicon/react"
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { formatDistance, isAfter } from "date-fns"
import { AnimatePresence, motion } from "motion/react"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Divider } from "@/components/ui/divider"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section, sectionVariants } from "@/components/section"
import VideoWithConditionalBlur from "@/components/video-with-conditional-blur"

import LikesButton from "../../-components/likes-button"
import FeaturedCourse from "./featured-course"
import FeaturedThread from "./featured-thread"

type Props = {
  communityId: string
}

type communityFeedItem = z.infer<typeof communityItemSchema>
const components: {
  [K in communityFeedItem["type"]]?: React.ComponentType<{
    source: Extract<communityFeedItem, { type: K }>
    size: "small" | "large"
    className?: string
  }>
} = {
  thread: FeaturedThread,
  course: FeaturedCourse,
}

const FeaturedGrid: React.FC<Props> = ({ communityId }) => {
  const trpc = useTRPC()

  const items = useSuspenseQueries({
    queries: [
      trpc.communities.courses.all.queryOptions({
        communityId,
      }),
      trpc.communities.threads.all.queryOptions({
        communityId,
      }),
      trpc.communities.articles.all.queryOptions({
        communityId,
      }),
    ],
  })

  const featured = useMemo(() => {
    if (!items) return []

    return items
      ?.flatMap((item) =>
        item?.data?.filter(
          (x) =>
            x.isFeatured &&
            x.isFeaturedUntil &&
            isAfter(new Date(x.isFeaturedUntil), new Date())
        )
      )
      .sort((a, b) => {
        return (
          new Date(b.isFeaturedFrom || b.createdAt).getTime() -
          new Date(a.isFeaturedFrom || a.createdAt).getTime()
        )
      })
  }, [items])

  if (!featured.length) return null

  return (
    <Grid
      gap="none"
      className={cn(
        "mx-auto mt-6 max-w-screen-xl gap-4 px-4 xl:px-0",
        sectionVariants({ size: "sm", side: "b" })
      )}
    >
      {featured?.slice(0, 1)?.map((item) => {
        return <FeaturedItem key={"featured-" + item.id} source={item} />
      })}
      <div className="col-span-12 flex h-full w-full flex-col gap-4 md:col-span-6 lg:col-span-4">
        {featured?.slice(1, 3)?.map((item) => {
          return <FeaturedItem key={"featured-" + item.id} source={item} />
        })}
      </div>
      {featured?.slice(3, 4)?.map((item) => {
        return <FeaturedItem key={"featured-" + item.id} source={item} />
      })}
    </Grid>
  )
}
export default FeaturedGrid

type FeaturedItemProps = {
  source: z.infer<typeof communityItemSchema>
  className?: string
}
const FeaturedItem: React.FC<FeaturedItemProps> = ({ source, className }) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isHovered, setIsHovered] = useState(false)

  // Get first name and first letter of last name
  const getTruncatedName = (fullName: string | undefined) => {
    if (!fullName) return ""
    const nameParts = fullName.split(" ")
    if (nameParts.length === 1) return nameParts[0]
    return `${nameParts[0]} ${nameParts[1].charAt(0)}.`
  }

  const hasImages =
    (source?.images &&
      source?.images?.length &&
      source?.images?.filter((x) => x.mimeType?.startsWith("image")).length >
        0) ||
    (source?.type === "course" && source?.content?.featureImageUrl)

  const featuredImage =
    hasImages && source.type !== "course"
      ? source?.images?.find((x) => x.featured) || source?.images?.[0]
      : hasImages && source.type === "course"
        ? {
            path: getPathFromGoogleStorage(
              source?.content?.featureImageUrl || ""
            ),
          }
        : null

  const hasVideo = source?.images?.some((x) => x.mimeType?.startsWith("video"))
  const featuredVideo = featuredImage
    ? null
    : source?.images?.find(
        (x) => x.mimeType?.startsWith("video") && x.featured
      ) || source?.images?.find((x) => x.mimeType?.startsWith("video"))

  return (
    <Link
      preload="intent"
      onMouseOver={() => {
        queryClient.prefetchQuery(
          trpc.communities.comments.all.queryOptions({
            communityId: source.communityId,
            // @ts-ignore
            collectionGroup: source.type + "s",
            collectionGroupDocId: source.id,
          })
        )
      }}
      {...(source.type === "thread"
        ? {
            to: "/communities/$id/threads/$threadId",
            params: {
              id: source.communityId,
              threadId: source.id,
            },
          }
        : source.type === "course"
          ? {
              to: "/communities/$id/courses/$courseId",
              params: {
                courseId: source.id,
                id: source.communityId,
              },
              search: {
                type: source?.typeAccessor,
                typeUid: source?.typeUid,
              },
            }
          : {
              to: "/communities/$id",
              params: {
                id: source.communityId,
              },
            })}
      className={cn(
        "relative col-span-12 flex aspect-[1/2] h-full max-h-[calc(100vh-184px)] w-full flex-1 flex-col overflow-hidden rounded-10 bg-bg-weak-50 ring-1 ring-stroke-soft-200 sm:aspect-square md:col-span-6 md:aspect-[16/13] lg:col-span-4",
        className
      )}
    >
      <div
        className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-bg-white-0/90 p-0.5 text-label-xs backdrop-blur-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Avatar.Root size="20" className="shrink-0">
          {source?.author?.avatarUrl && (
            <Avatar.Image
              src={source?.author?.avatarUrl}
              alt={source?.author?.name}
            />
          )}
        </Avatar.Root>
        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.p
              key="full"
              className="m-0 whitespace-nowrap font-medium"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
            >
              {source?.author?.name}{" "}
              <span className="pr-3 opacity-75">
                •{" "}
                {source?.publishedAt || source?.createdAt
                  ? formatDistance(
                      new Date(source?.publishedAt || source?.createdAt),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )
                  : null}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div
        className={cn(
          "relative h-full w-full grow overflow-hidden rounded-b-10",
          {
            "bg-primary-base/80":
              !hasImages && !featuredImage && !hasVideo && !featuredVideo,
          }
        )}
      >
        {/* <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-bg-white-0/90 p-0.5 text-label-xs backdrop-blur-md">
          <LikesButton
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            // mode="ghost"
            variant="primary"
            mode="ghost"
            className="rounded-full text-label-xs"
            hideText
            hideWhenZero
            // @ts-ignore
            collectionGroup={source.type + "s"}
            collectionGroupDocId={source.id}
            communityId={source?.communityId}
          />
        </div> */}
        {hasImages && featuredImage?.path ? (
          <>
            <Image
              path={featuredImage?.path}
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
              // sizes="(max-width: 768px) 100vw, 768px"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        ) : (
          <>
            {hasVideo && featuredVideo && featuredVideo.url ? (
              <>
                <VideoWithConditionalBlur
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  controls
                  videoUrl={featuredVideo.url}
                  className="absolute inset-0 z-0 h-full w-full overflow-hidden rounded-10 bg-bg-weak-50"
                />
              </>
            ) : (
              <RiHashtag className="absolute left-0 top-0 size-[50vw] fill-static-white/5" />
            )}
          </>
        )}
      </div>
      <footer className="flex flex-col gap-1 bg-bg-weak-50 p-5">
        <p className="text-subheading-2xs uppercase text-text-soft-400 lg:text-subheading-xs">
          {source.type}
        </p>
        <h3 className="line-clamp-2 text-pretty text-label-md">
          {source.title}
        </h3>
      </footer>
    </Link>
  )
}
