import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { useQueries } from "@tanstack/react-query"
import { format } from "date-fns"
import { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"

const bookmarkColorMap = {
  card: {
    color: "text-purple-900",
    bg: "bg-purple-200",
    bar: "bg-purple-700",
    date: "text-purple-600",
    outline: "ring-purple-700",
  },
  page: {
    color: "text-feature-dark",
    bg: "bg-feature-base/25",
    bar: "bg-feature-dark",
    date: "text-feature-dark/80",
    outline: "ring-feature-base",
  },
  module: {
    color: "text-teal-900",
    bg: "bg-teal-200",
    bar: "bg-teal-700",
    date: "text-teal-600",
    outline: "ring-teal-700",
  },
  enrolment: {
    color: "text-red-900",
    bg: "bg-red-200",
    bar: "bg-red-700",
    date: "text-red-600",
    outline: "ring-red-700",
  },
}

const schema = z.object({
  identifierKey: z.enum(["enrolmentUid", "moduleUid", "lessonUid", "cardId"]),
  identifiers: z.array(z.string()),
})

type Props = z.infer<typeof schema>
const Bookmarks: React.FC<Props> = ({ identifierKey, identifiers }) => {
  const trpc = useTRPC()
  const bookmarks = useQueries({
    queries: identifiers?.map((identifier) =>
      trpc.enrolments.bookmarks.queryOptions({
        identifierKey,
        identifier,
      })
    ),
  })
  const flatBookmarks = useMemo(() => {
    return bookmarks.flatMap((x) => x.data).filter((x) => x?.bookmarked)
  }, [bookmarks])

  const enrolments = useQueries({
    queries: flatBookmarks
      ?.filter((en) => en?.enrolmentUid)
      ?.map((bm) => {
        return {
          ...trpc.enrolments.detail.queryOptions({
            params: {
              uid: bm?.enrolmentUid!,
            },
            addOns: {
              withActivity: true,
            },
            query: {
              excludeMaterial: true,
            },
          }),
        }
      }),
  })

  const materialAndLessonsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        uid: string
        type: string
        title: string
        imageUrl?: string
      }
    >()

    enrolments?.flatMap?.((detail) => {
      detail?.data?.publication?.material?.forEach((material) => {
        map.set(material.uid, {
          uid: material.uid,
          type: "module",
          title: material.moduleVersion?.module?.translations["1"].title,
          imageUrl:
            material.moduleVersion?.module?.featureImageUrl ?? undefined,
        })
        material.learning.forEach((learning) => {
          map.set(learning.uid, {
            uid: learning.uid,
            type: learning.type,
            title: learning?.title || "",
            imageUrl: undefined,
          })
        })
      })
    })

    return map
  }, [enrolments])

  const { ref, height } = useElementSize()

  const availableHeight = useMemo(() => {
    return height - 85
  }, [height])
  const max = useMemo(() => {
    return Math.floor(availableHeight / 44)
  }, [availableHeight])
  const extra = useMemo(() => {
    if (!flatBookmarks || flatBookmarks.length === 0) return 0
    return flatBookmarks.length - max
  }, [flatBookmarks, max])
  return (
    <div
      ref={ref}
      className="group relative flex h-1/2 flex-col rounded-[22px] bg-bg-white-0 p-4 ring-1 ring-stroke-soft-200"
    >
      <header className="flex gap-1.5">
        <p className="text-paragraph-xl font-bold text-blue-500">Bookmarks</p>
        <p className="text-paragraph-xl font-bold text-black">
          {flatBookmarks.length ?? 0}
        </p>
      </header>
      <div className="my-2 flex flex-1 flex-col gap-2">
        {flatBookmarks?.slice(0, max).map((bookmark, index) => {
          if (!bookmark) return null
          const materialFromBookmark = materialAndLessonsMap.get(
            (bookmark?.key === "card"
              ? bookmark?.cardId
              : bookmark?.key === "module"
                ? bookmark?.moduleUid
                : bookmark?.key === "lesson" || bookmark?.key === "page"
                  ? bookmark?.lessonUid
                  : bookmark?.enrolmentUid) ?? ""
          )

          return (
            <button
              key={bookmark.id}
              className={cn(
                "relative flex h-10 w-full items-center gap-2 overflow-hidden rounded-md pl-1 transition-all",
                bookmarkColorMap[
                  materialFromBookmark?.type as keyof typeof bookmarkColorMap
                ].bg
              )}
            >
              <div
                className={cn(
                  "h-8 w-1 rounded-sm",
                  bookmarkColorMap[
                    materialFromBookmark?.type as keyof typeof bookmarkColorMap
                  ].bar
                )}
              ></div>
              <div className="flex-col items-center justify-center text-left">
                <h4
                  className={cn(
                    "line-clamp-1 text-label-sm font-bold",
                    bookmarkColorMap[
                      materialFromBookmark?.type as keyof typeof bookmarkColorMap
                    ].color
                  )}
                >
                  {materialFromBookmark?.title}
                </h4>
                <p
                  className={cn(
                    "whitespace-pre text-label-xs capitalize",
                    bookmarkColorMap[
                      materialFromBookmark?.type as keyof typeof bookmarkColorMap
                    ].date
                  )}
                >
                  {bookmark.key} - {format(bookmark.updatedAt, "MMM d, yyyy")}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {extra ? (
        <>
          {flatBookmarks && flatBookmarks?.slice(max).length > 0 && (
            <>
              <div className="flex h-8 w-full items-center justify-between rounded-md bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200">
                <p className="text-label-xs font-bold text-neutral-800">
                  {flatBookmarks?.slice(max).length} more bookmarks
                </p>
              </div>
              {flatBookmarks?.slice(max, max + 3).map((bookmark, index) => (
                <div
                  key={bookmark?.id}
                  style={{
                    paddingInline: `${(index + 1) * 6}px`,
                  }}
                >
                  <div className="mt-[1px] h-[2px] w-full rounded-full bg-bg-weak-50" />
                </div>
              ))}
            </>
          )}
        </>
      ) : (
        <div className="w-full text-center text-label-xs font-bold text-text-sub-600">
          No bookmarks
        </div>
      )}
    </div>
  )
}
export default Bookmarks
