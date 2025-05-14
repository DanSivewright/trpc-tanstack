import { Suspense, useCallback, useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { RiLoaderLine } from "@remixicon/react"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { intervalToDuration } from "date-fns"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Section } from "@/components/section"

import CommentWysiwyg from "../../-components/comment-wysiwyg"
import Comments from "../../-components/comments"

export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId/"
)({
  loaderDeps: ({ search }) => {
    return {
      type: search.type,
      typeUid: search.typeUid,
      replyToCommentId: search.replyToCommentId,
      replyContent: search.replyContent,
    }
  },
  loader: async ({ context, params: { id, courseId }, deps }) => {
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
      context.queryClient.ensureQueryData(
        context.trpc.content.modules.queryOptions({
          params: {
            type: deps.type,
            typeUid: deps.typeUid,
          },
        })
      ),
    ])
  },

  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const params = Route.useParams()
  const navigate = Route.useNavigate()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )
  const modules = useSuspenseQuery(
    trpc.content.modules.queryOptions({
      params: {
        type: search.type,
        typeUid: search.typeUid,
      },
    })
  )
  const me = useQuery(trpc.people.me.queryOptions())
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
    return modules.data?.reduce((total, module) => {
      return (
        total +
        (module?.moduleVersion?.assessments?.length || 0) +
        (module?.moduleVersion?.lessons?.length || 0) +
        (module?.moduleVersion?.assignments?.length || 0)
      )
    }, 0)
  }, [modules])

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

  const commentMutation = useMutation({
    ...trpc.communities.comment.mutationOptions(),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "courses",
          collectionGroupDocId: params.courseId,
          communityId: params.id,
        }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "courses",
          collectionGroupDocId: params.courseId,
          communityId: params.id,
        }).queryKey,
        (old) => [newComment, ...(old && old.length ? old : [])]
      )

      return undefined
    },
    onError: (_, previousComments) => {
      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "courses",
          collectionGroupDocId: params.courseId,
          communityId: params.id,
        }).queryKey,
        // @ts-ignore
        previousComments
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "courses",
          collectionGroupDocId: params.courseId,
          communityId: params.id,
        }).queryKey,
      })
    },
  })
  const commentsCount = useQuery(
    trpc.communities.interactionsCountForCollectionGroup.queryOptions({
      collectionGroup: "courses",
      collectionGroupDocId: params.courseId,
      interactionType: "comments",
      communityId: params.id,
    })
  )

  const onShowReply = useCallback((commentId: string, content?: string) => {
    navigate({
      resetScroll: false,
      search: (old) => ({
        ...old,
        replyToCommentId: commentId,
        ...(content && { replyContent: content }),
      }),
    })
  }, [])

  const handleComment = async ({
    htmlString,
    parentCommentId,
    rootParentCommentId,
  }: {
    htmlString: string
    parentCommentId: string | null
    rootParentCommentId: string | null
  }) => {
    const id = crypto.randomUUID()
    commentMutation.mutate({
      authorUid: me.data?.uid || "",
      author: {
        id: me.data?.uid || "",
        name: `${me.data?.firstName} ${me.data?.lastName}` || "",
        avatarUrl: me.data?.imageUrl || "",
      },
      id,
      content: htmlString,
      createdAt: new Date().toISOString(),
      status: "posted",
      communityId: params.id,
      collectionGroup: "courses",
      collectionGroupDocId: params.courseId,
      rootParentCommentId: id,
      parentCommentId,
      likesCount: 0,
      deletedAt: null,
      byMe: true,
    })
  }

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
          <h3 className="text-title-h6">
            Comments ({commentsCount.data?.total || 0})
          </h3>
        </header>
        <CommentWysiwyg
          placeholder="Join the conversation..."
          handleComment={handleComment}
          isPending={commentMutation.isPending}
          parentCommentId={null}
          rootParentCommentId={null}
        />
        <Suspense fallback={<div>Loading comments...</div>}>
          <Comments
            opUid={course?.data?.authorUid}
            communityId={params.id}
            collectionGroup="courses"
            collectionGroupDocId={params.courseId}
            onShowReply={onShowReply}
            replyToCommentId={search.replyToCommentId}
            replyContent={search.replyContent}
          />
        </Suspense>
      </Section>
    </>
  )
}
