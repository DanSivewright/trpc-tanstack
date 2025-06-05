import { useTRPC } from "@/integrations/trpc/react"
import type { communityItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { RiChat3Line, RiHashtag, RiTimeLine } from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { formatDistance, formatDistanceStrict } from "date-fns"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/image"
import VideoWithConditionalBlur from "@/components/video-with-conditional-blur"

import LikesButton from "../../-components/likes-button"

type Props = {
  // source: z.infer<typeof communityItemSchema> & { type: "thread" }
  source: Extract<z.infer<typeof communityItemSchema>, { type: "thread" }>
  size: "small" | "large"
  className?: string
}
const FeaturedThread: React.FC<Props> = ({ source, size, className }) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const thread = source
  const hasImages =
    thread?.images &&
    thread?.images?.length &&
    thread?.images?.filter((x) => x.mimeType?.startsWith("image")).length > 0

  const featuredImage = hasImages
    ? thread?.images?.find((x) => x.featured) || thread?.images?.[0]
    : null

  const hasVideo = thread?.images?.some((x) => x.mimeType?.startsWith("video"))
  const featuredVideo = featuredImage
    ? null
    : thread?.images?.find(
        (x) => x.mimeType?.startsWith("video") && x.featured
      ) || thread?.images?.find((x) => x.mimeType?.startsWith("video"))

  return (
    <Link
      to="/communities/$id/threads/$threadId"
      params={{
        id: thread?.communityId,
        threadId: thread?.id,
      }}
      onMouseOver={() => {
        queryClient.prefetchQuery(
          trpc.communities.threads.detail.queryOptions({
            communityId: thread?.communityId,
            threadId: thread?.id,
          })
        )
        queryClient.prefetchQuery(
          trpc.communities.comments.all.queryOptions({
            communityId: thread?.communityId,
            collectionGroup: "threads",
            collectionGroupDocId: thread?.id,
          })
        )
      }}
      preload="intent"
      {...(size === "small"
        ? {
            className: cn(
              "relative h-full overflow-hidden w-full grow rounded-10 ring-1 ring-stroke-soft-200",
              {
                "bg-primary-base/80": !hasImages && !featuredImage,
              },
              className
            ),
          }
        : {
            className: cn(
              "relative col-span-8 w-full overflow-hidden rounded-10 ring-1 ring-stroke-soft-200",
              {
                "aspect-[16/13] h-full bg-primary-base/80":
                  !hasImages && !featuredImage && !hasVideo && !featuredVideo,
                "flex aspect-auto h-full max-h-[calc(100vh-128px)] flex-1 flex-col overflow-auto bg-bg-weak-50":
                  hasVideo && featuredVideo,
                "aspect-[16/13] h-full":
                  hasImages && featuredImage && !hasVideo && !featuredVideo,
              },
              className
            ),
          })}
    >
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
            className="absolute inset-0 object-cover"
          />
        </>
      ) : (
        <>
          {hasVideo && featuredVideo && size !== "small" ? (
            <>
              <VideoWithConditionalBlur
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                controls
                videoUrl={
                  thread?.images?.find((x) => x.mimeType?.startsWith("video"))
                    ?.url!
                }
                className="h-full overflow-hidden rounded-10 bg-bg-weak-50"
              />
            </>
          ) : (
            <RiHashtag
              className={cn(
                "absolute left-0 top-0 size-[50vw] fill-static-white/5",
                {
                  "size-[10vw]": size === "small",
                }
              )}
            />
          )}
        </>
      )}
      {((!hasVideo && !featuredVideo) || size === "small") && (
        <div
          style={
            hasImages && thread?.meta?.colors
              ? {
                  background: `linear-gradient(0deg, rgba(${thread?.meta?.colors?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                }
              : {}
          }
          className={cn("absolute inset-x-0 bottom-0 z-[1] h-[65%]", {
            "bg-gradient-to-t from-primary-darker to-transparent":
              !hasImages || !thread?.meta?.colors,
          })}
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
      <div
        {...(!hasVideo && !featuredVideo && size !== "small"
          ? {
              style: {
                color:
                  thread?.meta?.colors?.LightMuted?.titleTextColor || "#FFFFFF",
              },
            }
          : {})}
        className={cn("z-10 flex h-full flex-col justify-between p-8", {
          "h-fit gap-2 bg-bg-weak-50":
            hasVideo && featuredVideo && size !== "small",
          relative: !hasVideo && !featuredVideo,
          "relative justify-end p-2": size === "small",
        })}
      >
        <div
          className={cn("flex items-center gap-3 p-0.5 pr-3", {
            "absolute left-2 top-2 z-10 rounded-full bg-bg-white-0/90 backdrop-blur":
              hasVideo && featuredVideo,
            "absolute left-2 top-2 z-10 gap-0 rounded-full bg-bg-white-0/90 backdrop-blur":
              size === "small",
          })}
        >
          <div
            className={cn("flex items-center gap-2 text-label-xs", {
              "text-subheading-2xs": size === "small",
            })}
          >
            <Avatar.Root size="20">
              {thread?.author?.avatarUrl && (
                <Avatar.Image
                  src={thread?.author?.avatarUrl}
                  alt={thread?.author?.name}
                />
              )}
            </Avatar.Root>
            <p className="font-medium">
              {thread?.author?.name}{" "}
              <span className="font-medium opacity-75">
                •{" "}
                {thread?.publishedAt || thread?.createdAt
                  ? formatDistance(
                      new Date(thread?.publishedAt || thread?.createdAt),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )
                  : null}
              </span>
            </p>
          </div>
        </div>
        <div
          className={cn("flex flex-col gap-6", {
            "gap-4": hasVideo && featuredVideo,
            "gap-2": size === "small",
          })}
          {...(size === "small"
            ? {
                style: {
                  color:
                    thread?.meta?.colors?.LightMuted?.titleTextColor ||
                    "#FFFFFF",
                },
              }
            : {})}
        >
          <div className="flex flex-col gap-2">
            <h3
              className={cn("font-normal", {
                "text-title-h5 lg:text-title-h4": size !== "small",
                "text-label-md": size === "small",
              })}
            >
              {thread?.title}
            </h3>
            {thread?.tags && (
              <div className="flex flex-wrap items-center gap-2">
                {thread?.tags.slice(0, size === "small" ? 1 : 3).map((tag) => (
                  <Badge.Root
                    size={size === "small" ? "small" : "medium"}
                    color="blue"
                    {...(!hasImages || thread?.meta?.colors
                      ? {
                          variant: "lighter",
                        }
                      : {})}
                    className="capitalize"
                    key={thread?.id + tag}
                  >
                    {tag}
                  </Badge.Root>
                ))}
                {thread?.tags?.length > (size === "small" ? 1 : 3) && (
                  <Badge.Root
                    size={size === "small" ? "small" : "medium"}
                    color="blue"
                    {...(!hasImages || thread?.meta?.colors
                      ? {
                          variant: "lighter",
                        }
                      : {})}
                    className="capitalize"
                  >
                    +{thread?.tags?.length - 3}
                  </Badge.Root>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 *:text-label-xs *:opacity-75">
            <div className="flex items-center gap-2">
              <RiChat3Line size={15} name="MessageCircle" />
              <span>{thread?.commentsCount || "No Comments"}</span>
            </div>
            <LikesButton
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              mode="ghost"
              className="text-inherit text-label-xs hover:bg-transparent"
              // @ts-ignore
              collectionGroup={thread.type + "s"}
              collectionGroupDocId={thread.id}
              communityId={thread?.communityId}
            />

            {thread?.duration && (
              <div className="flex items-center gap-2">
                <RiTimeLine size={15} name="Clock" />
                <span>
                  {thread?.duration
                    ? formatDistanceStrict(0, thread.duration * 1000, {
                        unit:
                          thread.duration < 60
                            ? "second"
                            : thread?.duration > 3600
                              ? "hour"
                              : "minute",
                        roundingMethod: "floor",
                      })
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
export default FeaturedThread
