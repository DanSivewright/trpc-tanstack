import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import {
  RiLoaderLine,
  RiMessage2Line,
  RiThumbDownLine,
  RiThumbUpLine,
} from "@remixicon/react"
import { useQueries, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useLocation } from "@tanstack/react-router"
import { formatDistance, intervalToDuration } from "date-fns"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/section"

import { commentsData } from "../-components/comments-data"

export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId/"
)({
  loader: async ({ context, params: { id, courseId } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.communities.courseDetail.queryOptions({
          communityId: id,
          courseId,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.communities.detail.queryOptions({
          id,
        })
      ),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const trpc = useTRPC()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id: params.id,
    })
  )

  const modules = useQuery(
    trpc.content.modules.queryOptions({
      params: {
        type: course.data?.typeAccessor,
        typeUid: course.data?.typeUid,
      },
    })
  )

  const moduleVersions = useQueries({
    queries: (modules?.data || []).map((m) => ({
      ...trpc.content.modulesVersion.queryOptions({
        params: {
          moduleVersionUid: m?.moduleVersionUid,
        },
      }),
      enabled: !!(!modules?.isLoading && m.moduleVersionUid),
    })),
  })

  const lessons = useMemo(() => {
    return moduleVersions.reduce((total, module) => {
      return total + (module.data?.material?.length || 0)
    }, 0)
  }, [moduleVersions])

  const duration = useMemo(() => {
    const totalMinutes = lessons * 30
    const duration = intervalToDuration({
      start: 0,
      end: totalMinutes * 60 * 1000,
    })
    const hours = duration.hours || 0
    const minutes = duration.minutes || 0
    return `${hours}h ${minutes}m`
  }, [lessons])

  return (
    <>
      <header className="flex items-end justify-between">
        <h2 className="text-title-h6">Course Overview</h2>
        <div className="text-label-sm text-text-soft-400">
          <span className="font-extrabold text-text-sub-600">{lessons}</span>{" "}
          Lesson
          {lessons === 1 ? "" : "s"}
          <span className="font-semibold text-text-sub-600"> • </span>
          <span className="font-semibold text-text-sub-600">{duration} </span>
          total length
        </div>
      </header>

      <ul className="mt-4 flex flex-col gap-5">
        {moduleVersions?.some((x) => x.isLoading) ? (
          <RiLoaderLine className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {moduleVersions?.map((mv) => {
              return (
                <li
                  className="rounded-20 bg-bg-weak-50 ring-1 ring-stroke-soft-200 drop-shadow-xl"
                  key={mv.data?.uid}
                >
                  <header className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar.Root size="20">
                        {mv?.data?.module?.featureImageUrl ? (
                          <Avatar.Image
                            src={mv?.data?.module?.featureImageUrl}
                          />
                        ) : (
                          mv?.data?.module?.content?.title?.[0]
                        )}
                      </Avatar.Root>
                      {mv?.data?.module?.content?.title}
                    </div>
                  </header>
                  <div className="flex flex-col gap-4 rounded-20 bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200">
                    {mv?.data?.material?.map((lesson) => {
                      return (
                        <div
                          className="flex items-center justify-between gap-4"
                          key={lesson.uid}
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-label-md font-medium">
                              {lesson.content.title}
                            </h3>
                            <Badge.Root
                              className="capitalize"
                              color={
                                lesson.kind === "lesson" ? "green" : "blue"
                              }
                              variant="light"
                            >
                              <Badge.Dot />
                              {lesson.kind}
                            </Badge.Root>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-label-xs capitalize text-text-soft-400">
                              {lesson.kind}
                            </p>
                            {lesson.passScore && (
                              <>
                                <div className="h-3 w-px bg-stroke-soft-200"></div>
                                <p className="text-label-xs capitalize text-text-soft-400">
                                  {lesson.passScore}% Pass Score
                                </p>
                              </>
                            )}
                            {lesson?.allowedAttempts && (
                              <>
                                <div className="h-3 w-px bg-stroke-soft-200"></div>
                                <p className="text-label-xs capitalize text-text-soft-400">
                                  {lesson.allowedAttempts} attempt
                                  {lesson.allowedAttempts === "1" ? "" : "s"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </>
        )}
      </ul>
      <Section className="flex flex-col gap-5">
        <header className="flex items-end justify-between">
          <h3 className="text-title-h6">Comments</h3>
        </header>
        <ul className="flex flex-col gap-8 pl-6">
          {commentsData.map((comment, commentIndex) => {
            return (
              <li
                className="relative flex flex-col gap-2 pl-6"
                key={comment.id}
              >
                <div className="relative flex flex-col gap-2">
                  {comment.replies && comment?.replies?.length ? (
                    <div className="absolute -left-[25px] bottom-0 top-10 w-px bg-stroke-soft-200"></div>
                  ) : null}
                  <div className="-ml-10 flex items-center gap-2">
                    <Avatar.Root size="32">
                      <Avatar.Image src={comment.author.avatar} />
                    </Avatar.Root>
                    <span className="text-label-sm font-medium">
                      {comment.author.name}{" "}
                      <span className="text-label-sm font-light text-text-soft-400">
                        •{" "}
                        {formatDistance(comment.date, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                  </div>
                  <p className="text-label-md font-normal text-text-sub-600">
                    {comment.content}
                  </p>
                  <footer className="flex items-center gap-2">
                    <Button.Root size="xxsmall" variant="neutral" mode="ghost">
                      <Button.Icon as={RiThumbUpLine} />
                      {comment.likes}
                    </Button.Root>
                    <Button.Root size="xxsmall" variant="neutral" mode="ghost">
                      <Button.Icon as={RiThumbDownLine} />
                    </Button.Root>
                    <Button.Root size="xxsmall" variant="neutral" mode="ghost">
                      <Button.Icon as={RiMessage2Line} />
                      Reply
                    </Button.Root>
                  </footer>
                </div>
                <ul className="flex flex-col gap-8 pl-6">
                  {comment?.replies?.map((r, ri) => {
                    const isNotLast = ri !== comment?.replies?.length - 1
                    return (
                      <li
                        className="relative flex flex-col gap-2 pl-6"
                        key={r.id}
                      >
                        {isNotLast && (
                          <div className="absolute -bottom-4 -left-[49px] top-0 w-px bg-stroke-soft-200"></div>
                        )}
                        <div className="absolute -left-[49px] -top-4 h-[33px] w-[26px] rounded-bl-xl border-b border-l border-stroke-soft-200"></div>
                        <div className="relative flex flex-col gap-2">
                          {r.replies && r?.replies?.length ? (
                            <div className="absolute -left-[25px] bottom-0 top-10 w-px bg-stroke-soft-200"></div>
                          ) : null}
                          <div className="-ml-10 flex items-center gap-2">
                            <Avatar.Root size="32">
                              <Avatar.Image src={r.author.avatar} />
                            </Avatar.Root>
                            <span className="text-label-sm font-medium">
                              {r.author.name}{" "}
                              <span className="text-label-sm font-light text-text-soft-400">
                                •{" "}
                                {formatDistance(r.date, new Date(), {
                                  addSuffix: true,
                                })}
                              </span>
                            </span>
                          </div>
                          <p className="text-label-md font-normal text-text-sub-600">
                            {r.content}
                          </p>
                          <footer className="flex items-center gap-2">
                            <Button.Root
                              size="xxsmall"
                              variant="neutral"
                              mode="ghost"
                            >
                              <Button.Icon as={RiThumbUpLine} />
                              {r.likes}
                            </Button.Root>
                            <Button.Root
                              size="xxsmall"
                              variant="neutral"
                              mode="ghost"
                            >
                              <Button.Icon as={RiThumbDownLine} />
                            </Button.Root>
                            <Button.Root
                              size="xxsmall"
                              variant="neutral"
                              mode="ghost"
                            >
                              <Button.Icon as={RiMessage2Line} />
                              Reply
                            </Button.Root>
                          </footer>
                        </div>
                        <ul className="flex flex-col gap-8 pl-6">
                          {r?.replies?.map((sr, ri) => {
                            const isNotLast = ri !== r?.replies?.length - 1
                            return (
                              <li
                                className="relative flex flex-col gap-2 pl-6"
                                key={sr.id}
                              >
                                {isNotLast && (
                                  <div className="absolute -bottom-4 -left-[49px] top-0 w-px bg-stroke-soft-200"></div>
                                )}
                                <div className="absolute -left-[49px] -top-4 h-[33px] w-[26px] rounded-bl-xl border-b border-l border-stroke-soft-200"></div>
                                <div className="relative flex flex-col gap-2">
                                  {sr.replies && sr?.replies?.length ? (
                                    <div className="absolute -left-[25px] bottom-0 top-10 w-px bg-stroke-soft-200"></div>
                                  ) : null}
                                  <div className="-ml-10 flex items-center gap-2">
                                    <Avatar.Root size="32">
                                      <Avatar.Image src={sr.author.avatar} />
                                    </Avatar.Root>
                                    <span className="text-label-sm font-medium">
                                      {sr.author.name}{" "}
                                      <span className="text-label-sm font-light text-text-soft-400">
                                        •{" "}
                                        {formatDistance(sr.date, new Date(), {
                                          addSuffix: true,
                                        })}
                                      </span>
                                    </span>
                                  </div>
                                  <p className="text-label-md font-normal text-text-sub-600">
                                    {sr.content}
                                  </p>
                                  <footer className="flex items-center gap-2">
                                    <Button.Root
                                      size="xxsmall"
                                      variant="neutral"
                                      mode="ghost"
                                    >
                                      <Button.Icon as={RiThumbUpLine} />
                                      {sr.likes}
                                    </Button.Root>
                                    <Button.Root
                                      size="xxsmall"
                                      variant="neutral"
                                      mode="ghost"
                                    >
                                      <Button.Icon as={RiThumbDownLine} />
                                    </Button.Root>
                                    <Button.Root
                                      size="xxsmall"
                                      variant="neutral"
                                      mode="ghost"
                                    >
                                      <Button.Icon as={RiMessage2Line} />
                                      Reply
                                    </Button.Root>
                                  </footer>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
