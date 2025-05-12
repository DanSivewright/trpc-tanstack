import { useCallback, useEffect, useRef } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { faker } from "@faker-js/faker"
import {
  RiArrowLeftSLine,
  RiAttachmentLine,
  RiHashtag,
  RiLoaderLine,
  RiMessage2Line,
  RiSearchLine,
  RiSendPlaneLine,
  RiShareLine,
  RiThumbDownLine,
  RiThumbUpLine,
  RiVideoAddLine,
  RiVoiceAiLine,
} from "@remixicon/react"
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import { AnimatePresence, motion, useInView } from "motion/react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FancyButton } from "@/components/ui/fancy-button"
import { FileFormatIcon } from "@/components/ui/file-format-icon"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

import LikesButton from "../../-components/likes-button"

export const Route = createFileRoute(
  "/_learner/communities/$id/threads/$threadId/"
)({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.threadDetail.queryOptions({
        communityId: params.id,
        threadId: params.threadId,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const queryClient = useQueryClient()

  const navigate = Route.useNavigate()
  const onBack = useCallback(() => {
    return canGoBack
      ? router.history.back()
      : navigate({ to: "/communities/$id", params })
  }, [canGoBack])

  const thread = useSuspenseQuery(
    trpc.communities.threadDetail.queryOptions({
      communityId: params.id,
      threadId: params.threadId,
    })
  )
  const me = useQuery(trpc.people.me.queryOptions())
  const comments = useQuery(
    trpc.communities.comments.queryOptions({
      communityId: params.id,
      collectionGroup: "threads",
      collectionGroupDocId: params.threadId,
    })
  )

  const commentMutation = useMutation({
    ...trpc.communities.comment.mutationOptions(),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
        (old) => [...(old && old.length ? old : []), newComment]
      )
      return undefined
    },
    onError: (_, previousComments) => {
      queryClient.setQueryData(
        trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
        // @ts-ignore
        previousComments
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.communities.comments.queryOptions({
          collectionGroup: "threads",
          collectionGroupDocId: params.threadId,
          communityId: params.id,
        }).queryKey,
      })
    },
  })

  const titleRef = useRef(null)
  const isFirstRender = useRef(true)

  const titleInView = useInView(titleRef, {
    initial: true,
    margin: "-100px 0px 0px 0px",
    amount: 0.5,
  })

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      <Section
        side="t"
        className="sticky top-12 z-20 mb-5 bg-white/70 backdrop-blur"
      >
        <nav className="mx-auto flex w-full max-w-screen-lg items-center gap-6 px-8 py-2 xl:px-0">
          <Link
            onClick={(e) => {
              e.preventDefault()
              onBack()
              return false
            }}
            className="flex items-center gap-3"
            to="/communities/$id"
            params={params}
          >
            <RiArrowLeftSLine />
            <AnimatePresence mode="wait">
              {titleInView ? (
                <motion.h2
                  key="back"
                  initial={
                    isFirstRender.current ? false : { y: -20, opacity: 0 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="text-title-h6 font-light text-text-soft-400"
                >
                  <span className="text-text-strong-950">Your </span>Feed
                </motion.h2>
              ) : (
                <motion.div
                  key="title"
                  initial={
                    isFirstRender.current ? false : { y: 20, opacity: 0 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="flex items-center gap-2"
                >
                  <Avatar.Root size="20">
                    <Avatar.Image src={thread?.data?.author.avatarUrl} />
                  </Avatar.Root>
                  <h1 className="w-full truncate text-label-md font-normal">
                    {thread?.data?.title}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </nav>
      </Section>

      <header className="mx-auto flex w-full max-w-screen-lg flex-col items-start justify-end gap-4 px-8 xl:px-0">
        <div className="flex items-center gap-2">
          <Avatar.Root size="40">
            <Avatar.Image src={thread?.data?.author.avatarUrl} />
          </Avatar.Root>
          <div className="flex flex-col gap-0">
            <span className="text-label-lg font-normal">
              {thread?.data?.author.name}
            </span>
            <span className="text-label-sm font-light text-text-soft-400">
              {formatDistance(thread?.data?.createdAt!, new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex w-3/4 flex-wrap gap-2">
          <Badge.Root color="blue">
            <Badge.Icon as={RiHashtag} />
            Thread
          </Badge.Root>
          {thread?.data?.tags?.map((tag) => (
            <Badge.Root key={tag} variant="light">
              {tag}
            </Badge.Root>
          ))}
        </div>
        <h1 ref={titleRef} className="text-pretty text-title-h2">
          {thread?.data?.title}
        </h1>
        <p className="text-label-md font-normal text-text-sub-600">
          {thread?.data?.caption}
        </p>

        <div className="flex w-full flex-col gap-2">
          {thread?.data?.attachments?.length ? (
            <h2 className="text-label-sm font-normal">
              Attachments{" "}
              <span className="font-light text-text-soft-400">
                ({thread?.data?.attachments?.length || 0})
              </span>
            </h2>
          ) : null}
          <div className="flex w-3/4 flex-wrap gap-2">
            {thread?.data?.attachments?.map((att) => (
              <Tag.Root key={att.id}>
                <Tag.Icon
                  as={FileFormatIcon.Root}
                  size="small"
                  format={att.mimeType?.split("/")[1]}
                />
                {att.name}
              </Tag.Root>
            ))}
          </div>
        </div>
        <div className="w-full">
          {thread?.data?.images && thread?.data?.images?.length < 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread?.data?.images?.map((g, gi) => {
                const span = {
                  1: "col-span-12",
                  2: "col-span-6",
                }[thread?.data?.images?.length || 0]
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
                    // alt={`Community ${thread.name} image`}
                  />
                )
              })}
            </Grid>
          )}
          {thread?.data?.images && thread?.data?.images?.length >= 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread?.data?.images?.slice(0, 4).map((g, gi) => {
                let span = ""
                if (gi === 0) {
                  span = "col-span-12"
                } else {
                  if (
                    thread?.data?.images?.length &&
                    thread?.data?.images?.length - 1 === 2
                  ) {
                    span = "col-span-6"
                  } else {
                    span = "col-span-4"
                  }
                }

                const isLast = gi === 3
                const amountExtra =
                  thread?.data?.images?.length &&
                  thread?.data?.images?.length - 4

                return (
                  <div
                    className={cn(
                      "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[4px]",
                      span
                    )}
                    key={g.id}
                  >
                    {g.path}
                    {isLast && amountExtra && amountExtra > 0 && (
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
          )}
        </div>
        <div className="flex items-center gap-2">
          <LikesButton
            collectionGroup="threads"
            collectionGroupDocId={thread?.data?.id}
            communityId={params.id}
          />

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button.Root size="xxsmall" variant="neutral" mode="stroke">
                <Button.Icon as={RiMessage2Line} />
                <Badge.Root square variant="light" color="gray">
                  101
                </Badge.Root>
              </Button.Root>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
              <span>Comment</span>
            </Tooltip.Content>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button.Root size="xxsmall" variant="neutral" mode="stroke">
                <Button.Icon as={RiShareLine} />
              </Button.Root>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
              <span>Share</span>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </header>
      <Section className="mx-auto flex w-full max-w-screen-lg flex-col items-start justify-end gap-4 px-8 xl:px-0">
        <div className="flex w-full flex-col gap-1 rounded-10 bg-bg-soft-200 p-1 pb-1.5 shadow-regular-md">
          <Input.Root className="shadow-none">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Field type="text" placeholder="Join the conversation" />
            </Input.Wrapper>
          </Input.Root>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiAttachmentLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Attach</span>
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiVideoAddLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Video</span>
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <FancyButton.Root size="xsmall" variant="basic">
                    <FancyButton.Icon as={RiVoiceAiLine} />
                  </FancyButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Voice</span>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <FancyButton.Root
              onClick={async () => {
                const generateTitle = () => {
                  const intro = faker.helpers.arrayElement([
                    "How to",
                    "Why You Should",
                    "The Ultimate Guide to",
                    "Top 10 Ways to",
                    "Understanding",
                    "What You Need to Know About",
                    "The Hidden Secrets of",
                  ])

                  const topic = faker.hacker.noun() // or use faker.commerce.productName()
                  const detail = faker.company.catchPhrase() // or faker.hacker.phrase()

                  return `${intro} ${topic}: ${detail}`
                }
                commentMutation.mutate({
                  authorUid: me.data?.uid || "",
                  author: {
                    id: me.data?.uid || "",
                    name: `${me.data?.firstName} ${me.data?.lastName}` || "",
                    avatarUrl: me.data?.imageUrl || "",
                  },
                  id: crypto.randomUUID(),
                  content: generateTitle(),
                  createdAt: new Date().toISOString(),
                  status: "posted",
                  communityId: params.id,
                  collectionGroup: "threads",
                  collectionGroupDocId: thread?.data?.id,
                  byMe: true,
                })
              }}
              disabled={commentMutation.isPending || me.isLoading}
              size="xsmall"
              variant="neutral"
            >
              Share
              <FancyButton.Icon
                className={cn(commentMutation.isPending && "animate-spin")}
                as={commentMutation.isPending ? RiLoaderLine : RiSendPlaneLine}
              />
            </FancyButton.Root>
          </div>
        </div>
        <ul className="flex flex-col gap-8 pl-6">
          {comments.data?.map((c) => (
            <li className="relative flex flex-col gap-2 pl-6" key={c.id}>
              <div className="relative flex flex-col gap-2">
                {/* {comment.replies && comment?.replies?.length ? (
                  <div className="absolute -left-[25px] bottom-0 top-10 w-px bg-stroke-soft-200"></div>
                  ) : null} */}
                <div className="-ml-10 flex items-center gap-2">
                  <Avatar.Root size="32">
                    <Avatar.Image src={c.author.avatarUrl} />
                  </Avatar.Root>
                  <span className="text-label-sm font-medium">
                    {c.author.name}{" "}
                    <span className="text-label-sm font-light text-text-soft-400">
                      •{" "}
                      {formatDistance(c.createdAt, new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </div>
                <p className="text-label-md font-normal text-text-sub-600">
                  {c.content}
                </p>
                <footer className="flex items-center gap-2">
                  <Button.Root size="xxsmall" variant="neutral" mode="ghost">
                    <Button.Icon as={RiThumbUpLine} />
                    {c.upvotesCount}
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
            </li>
          ))}
        </ul>
        {/* <pre>{JSON.stringify(comments.data, null, 2)}</pre> */}
      </Section>
    </>
  )
}
