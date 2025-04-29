import { useCallback, useEffect, useMemo, useRef } from "react"
import { cn } from "@/utils/cn"
import { faker } from "@faker-js/faker"
import {
  RiArrowLeftSLine,
  RiAttachmentLine,
  RiHashtag,
  RiMessage2Line,
  RiSearchLine,
  RiSendPlaneLine,
  RiShareLine,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
  RiVideoAddLine,
  RiVoiceAiLine,
} from "@remixicon/react"
import {
  createFileRoute,
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { formatDistance } from "date-fns"
import { AnimatePresence, motion, useInView } from "motion/react"

import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as FancyButton from "@/components/ui/fancy-button"
import * as FileFormatIcon from "@/components/ui/file-format-icon"
import * as Input from "@/components/ui/input"
import * as Tag from "@/components/ui/tag"
import * as Tooltip from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

import { commentsData } from "./-components/comments-data"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/threads/$threadId"
)({
  component: RouteComponent,
})

type Comment = {
  id: string
  author: {
    name: string
    avatar: string
    admin: boolean
    online: boolean
  }
  date: Date
  content: string
  likes: number
  replies?: Comment[]
}

function RouteComponent() {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const params = Route.useParams()
  const navigate = useNavigate()
  const onBack = useCallback(() => {
    return canGoBack
      ? router.history.back()
      : navigate({ to: "/communities/$id", params })
  }, [canGoBack])
  const thread = useMemo(() => {
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
    const generateCategory = () =>
      faker.word.adjective().charAt(0).toUpperCase() +
      faker.word.adjective().slice(1) +
      " " +
      faker.hacker.noun()

    return {
      id: faker.string.uuid(),
      title: generateTitle(),
      date: faker.date.recent(),
      category: generateCategory(),
      likes: faker.number.int({ min: 0, max: 1000 }),
      comments: faker.number.int({ min: 0, max: 100 }),
      author: {
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),

        admin: faker.number.int({ min: 0, max: 10 }) <= 2,
        online: faker.number.int({ min: 0, max: 10 }) <= 2,
      },
      type: faker.helpers.arrayElement([
        "text",
        "gallery",
        "attachment",
        "article",
      ]),
      gallery: Array.from(
        { length: faker.number.int({ min: 1, max: 7 }) },
        () => {
          const length = faker.number.int({ min: 1, max: 34 })
          return {
            id: faker.string.uuid(),
            path: `${length}.${length === 26 || length === 27 ? "png" : "webp"}`,
          }
        }
      ),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
        return faker.hacker.adjective()
      }),
      image: {
        path: `${faker.number.int({ min: 1, max: 34 })}.webp`,
      },
      attachments: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => {
          return {
            title: faker.book.title(),
            status: faker.helpers.shuffle(["PDF", "DOC"])[0],
            color: faker.helpers.shuffle([
              "red",
              "orange",
              "sky",
              "blue",
              "green",
              "yellow",
              "purple",
              "pink",
            ])[0],
          }
        }
      ),
      article: {
        id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        description: Array.from({ length: 2 }).map(() => faker.hacker.phrase()),
        author: {
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
          admin: faker.datatype.boolean({ probability: 0.2 }),
          online: faker.datatype.boolean({ probability: 0.2 }),
        },
        category: faker.helpers.arrayElement([
          "Technology",
          "Science",
          "Business",
          "Health",
          "Environment",
          "Technology",
          "Health",
          "Travel",
          "Finance",
          "Food",
          "Lifestyle",
          "DIY",
          "Education",
          "Entertainment",
          "Productivity",
        ]),
        date: faker.date.recent(),
      },
    }
  }, [])

  // const comments = useMemo<Comment[]>(() => {
  //   const generateComment = (depth = 0): Comment => {
  //     const intro = faker.helpers.arrayElement([
  //       "How to",
  //       "Why You Should",
  //       "The Ultimate Guide to",
  //       "Top 10 Ways to",
  //       "Understanding",
  //       "What You Need to Know About",
  //       "The Hidden Secrets of",
  //     ])

  //     const topic = faker.hacker.noun()
  //     const detail = faker.company.catchPhrase()

  //     const paragraphs = Array.from({
  //       length: faker.number.int({ min: 1, max: 4 }),
  //     })
  //       .map(
  //         () =>
  //           faker.hacker.phrase() +
  //           " " +
  //           faker.company.buzzPhrase() +
  //           " " +
  //           faker.commerce.productDescription()
  //       )
  //       .join("\n\n")

  //     const comment = {
  //       id: faker.string.uuid(),
  //       author: {
  //         name: faker.person.fullName(),
  //         avatar: faker.image.avatar(),
  //         admin: faker.number.int({ min: 0, max: 10 }) <= 2,
  //         online: faker.number.int({ min: 0, max: 10 }) <= 2,
  //       },
  //       date: faker.date.recent(),
  //       content: `${intro} ${topic}: ${detail}. ${paragraphs}`,
  //       likes: faker.number.int({ min: 0, max: 1000 }),
  //       replies: [],
  //     }

  //     // Generate replies if we haven't reached max depth
  //     if (depth < 2) {
  //       const numReplies = faker.number.int({ min: 0, max: 3 })
  //       comment.replies = Array.from({ length: numReplies }, () =>
  //         generateComment(depth + 1)
  //       )
  //     }

  //     return comment
  //   }

  //   return Array.from({ length: 2 }, () => generateComment())
  // }, [])
  // console.log("comments:::", comments)

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
      <div role="separator" className="h-[25dvh]"></div>
      <div className="sticky top-12 z-20 mb-5 bg-white/70 backdrop-blur">
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
                    <Avatar.Image src={thread.author.avatar} />
                  </Avatar.Root>
                  <h1 className="w-full truncate text-label-md font-normal">
                    {thread.title}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </nav>
      </div>

      <header className="mx-auto flex w-full max-w-screen-lg flex-col items-start justify-end gap-4">
        <div className="flex items-center gap-2">
          <Avatar.Root size="40">
            <Avatar.Image src={thread.author.avatar} />
          </Avatar.Root>
          <div className="flex flex-col gap-0">
            <span className="text-label-lg font-normal">
              {thread.author.name}
            </span>
            <span className="text-label-sm font-light text-text-soft-400">
              {formatDistance(thread.date, new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <h1 ref={titleRef} className="text-pretty text-title-h2">
          {thread.title}
        </h1>
        <div className="flex w-3/4 flex-wrap gap-2">
          <Badge.Root color="blue">
            <RiHashtag className="size-4" />
            Thread
            {/* {thread.category} */}
          </Badge.Root>
          {thread.tags.map((tag) => (
            <Badge.Root key={tag} variant="light">
              {tag}
            </Badge.Root>
          ))}
        </div>
        <div className="mt-4 flex w-full flex-col gap-2">
          <h2 className="text-label-sm font-normal">
            Attachments{" "}
            <span className="font-light text-text-soft-400">
              ({thread.attachments.length})
            </span>
          </h2>
          <div className="flex w-3/4 flex-wrap gap-2">
            {thread.attachments.map((att) => (
              <Tag.Root key={att.title}>
                <Tag.Icon
                  as={FileFormatIcon.Root}
                  size="small"
                  format={att.status}
                  color={att.color}
                />
                {att.title}
              </Tag.Root>
            ))}
          </div>
        </div>
        <div className="w-full">
          {thread.gallery.length < 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread.gallery.map((g, gi) => {
                const span = {
                  1: "col-span-12",
                  2: "col-span-6",
                }[thread.gallery.length]
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
          {thread.gallery.length >= 3 && (
            <Grid gap="none" className="mt-2 gap-1">
              {thread.gallery.slice(0, 4).map((g, gi) => {
                let span = ""
                if (gi === 0) {
                  span = "col-span-12"
                } else {
                  if (thread.gallery.length - 1 === 2) {
                    span = "col-span-6"
                  } else {
                    span = "col-span-4"
                  }
                }

                const isLast = gi === 3
                const amountExtra = thread.gallery.length - 4

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
                // let span = gi === 0 ? "col-span-12" : "col-span-6"
                // const span = {
                //   1: "col-span-12",
                //   2: "col-span-6",
                // }[thread.gallery.length]
              })}
            </Grid>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button.Root
                  size="xsmall"
                  className="rounded-r-none"
                  variant="neutral"
                  mode="stroke"
                >
                  <Button.Icon
                    className="fill-primary-darker"
                    as={RiThumbUpFill}
                  />
                  <Badge.Root square variant="light" color="blue">
                    66
                  </Badge.Root>
                </Button.Root>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                <span>Like</span>
              </Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button.Root
                  size="xsmall"
                  className="rounded-l-none"
                  variant="neutral"
                  mode="lighter"
                >
                  <Button.Icon as={RiThumbDownLine} />
                </Button.Root>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                <span>Dislike</span>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button.Root size="xsmall" variant="neutral" mode="stroke">
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
              <Button.Root size="xsmall" variant="neutral" mode="stroke">
                <Button.Icon as={RiShareLine} />
              </Button.Root>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
              <span>Share</span>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
        <div className="flex w-full flex-col gap-1 rounded-10 bg-bg-soft-200 p-1 pb-1.5 shadow-regular-md">
          <Input.Root className="shadow-none">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input type="text" placeholder="Join the conversation" />
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
            <FancyButton.Root size="xsmall" variant="neutral">
              Share
              <FancyButton.Icon as={RiSendPlaneLine} />
            </FancyButton.Root>
          </div>
        </div>
      </header>

      <Section size="sm" className="mx-auto flex max-w-screen-lg flex-col">
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
