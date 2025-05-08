import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { faker } from "@faker-js/faker"
import {
  RiAddLine,
  RiAttachmentLine,
  RiBookmarkLine,
  RiCalendarLine,
  RiDownloadLine,
  RiEyeLine,
  RiHashtag,
  RiSearchLine,
  RiSendPlaneLine,
  RiVideoAddLine,
  RiVoiceAiLine,
} from "@remixicon/react"
import { useQueries, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { formatDistance } from "date-fns"

import { useElementSize } from "@/hooks/use-element-size"
import { Avatar } from "@/components/ui/avatar"
import { FancyButton } from "@/components/ui/fancy-button"
import * as FileFormatIcon from "@/components/ui/file-format-icon"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

export const Route = createFileRoute("/_learner/communities/$id/")({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      leaf: "Feed",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({ id })
  )

  const picks = useMemo(
    () =>
      Array.from({ length: 2 }, () => ({
        id: faker.string.uuid(),
        author: {
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
        },
        category: faker.helpers.arrayElement([
          "Technology",
          "Science",
          "Business",
          "Health",
          "Environment",
        ]),
        title: faker.lorem.sentence(),
        date: faker.date.recent(),
        readTime: faker.number.int({ min: 1, max: 10 }),
        likes: faker.number.int({ min: 0, max: 1000 }),
      })),
    []
  )

  const resources = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
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
        date: faker.date.recent(),
      })),
    []
  )

  const featured = useMemo(
    () =>
      Array.from({ length: 2 }, () => ({
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
      })),
    []
  )
  const palettes = useQueries({
    queries: [
      trpc.palette.get.queryOptions({
        url: "https://ik.imagekit.io/fd0wnnfkn/20.webp",
      }),
      trpc.palette.get.queryOptions({
        url: "https://ik.imagekit.io/fd0wnnfkn/21.webp",
      }),
    ],
  })

  const comments = useMemo(() => {
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

      const paragraphs = Array.from({
        length: faker.number.int({ min: 1, max: 4 }),
      })
        .map(
          () =>
            faker.hacker.phrase() +
            " " +
            faker.company.buzzPhrase() +
            " " +
            faker.commerce.productDescription()
        )
        .join("\n\n")
      return `${intro} ${topic}: ${detail}. ${paragraphs}`
    }
    const generateCategory = () =>
      faker.word.adjective().charAt(0).toUpperCase() +
      faker.word.adjective().slice(1) +
      " " +
      faker.hacker.noun()
    return Array.from({ length: 10 }, () => ({
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
      image: {
        path: `${faker.number.int({ min: 1, max: 34 })}.webp`,
      },
      attachment: {
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
      },
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
    }))
  }, [])

  const container = useElementSize()
  const main = useElementSize()

  return (
    <>
      <div
        ref={container.ref}
        className="sticky top-12 z-0 flex w-screen items-start"
      >
        <div
          style={{
            width: `${Math.floor((container.width - main.width) / 2)}px`,
          }}
        ></div>
        <div
          style={{
            width: main.width + "px",
          }}
          className="relative flex flex-col gap-2 px-6 xl:px-0"
        ></div>
        <aside
          style={{
            width: `${Math.floor((container.width - main.width) / 2)}px`,
          }}
          className="h-[calc(100svh-48px)] max-h-[calc(100svh-48px)] overflow-y-auto"
        >
          <div className="flex w-3/4 flex-1 flex-col gap-7 pl-8 pt-4">
            <div className="flex flex-col gap-5">
              <h2 className="text-title-h6 font-normal">Currated Picks</h2>

              {picks.map((pick, i) => (
                <article
                  key={pick.id}
                  className={cn("flex flex-col gap-1.5 pb-5", {
                    "border-b border-stroke-soft-200": i < picks.length - 1,
                  })}
                >
                  <div className="flex items-start gap-2">
                    <Avatar.Root size="20">
                      <Avatar.Image src={pick.author.avatar} />
                    </Avatar.Root>
                    <p className="pt-0.5 text-label-xs font-light text-text-soft-400">
                      {pick.author.name} • {pick.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-label-sm font-light text-text-strong-950">
                      {pick.title}
                    </p>
                    <div className="aspect-video h-12 rounded-xl">
                      <Image
                        path={`${i + 1}.webp`}
                        alt={pick.title}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-label-xs font-light text-text-soft-400">
                        <RiCalendarLine className="size-5" />
                        {pick.date.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 text-label-xs font-light text-text-soft-400">
                        <RiEyeLine className="size-5" />
                        {pick.readTime} Min Read
                      </span>
                    </div>
                    <RiBookmarkLine className="size-5 text-text-soft-400" />
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-label-md font-normal">Online</h2>
              <ul className="flex flex-wrap items-center gap-1">
                {community.data?.members?.map((m, i) => (
                  <Tooltip.Root delayDuration={10} key={m.id}>
                    <Tooltip.Trigger asChild>
                      <Avatar.Root size="32">
                        {m.avatarUrl ? (
                          <Avatar.Image src={m.avatarUrl ?? undefined} />
                        ) : (
                          m.firstName?.[0]
                        )}
                        {i === 1 && (
                          <Avatar.Indicator position="top">
                            <CustomVerifiedIconSVG />
                          </Avatar.Indicator>
                        )}
                      </Avatar.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>
                        {m.firstName} {m.lastName}
                      </p>
                    </Tooltip.Content>
                  </Tooltip.Root>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-label-md font-normal">Resources</h2>
              <ul className="flex flex-col gap-2">
                {resources.map((r) => (
                  <li
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-10 py-2 transition-all hover:bg-bg-weak-50 hover:px-3"
                    key={r.id}
                  >
                    <div className="flex items-center gap-2">
                      <FileFormatIcon.Root
                        size="small"
                        format={r.status}
                        color={r.color}
                      />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-label-sm font-light text-text-sub-600">
                          {r.title}
                        </p>
                        <p className="text-label-xs font-light text-text-soft-400">
                          {r.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <RiDownloadLine className="size-4 text-text-soft-400" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div
        ref={main.ref}
        className="relative -top-[calc(100svh-48px)] z-10 mx-auto flex w-full max-w-screen-md flex-col gap-2 pt-6"
      >
        <div className="flex w-full flex-col gap-1 rounded-10 bg-bg-soft-200 p-1 pb-1.5 shadow-regular-md">
          <Input.Root className="shadow-none">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Field type="text" placeholder="What's on your mind?" />
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
        <Grid gap="none" className="gap-2">
          {[featured?.[0]].map((f, i) => (
            <div
              key={f.id}
              style={{
                color: palettes[i].data?.LightMuted?.titleTextColor,
              }}
              className="aspect-sqaure relative col-span-6 w-full overflow-hidden rounded-xl bg-pink-100"
            >
              <Image
                path={`${i + 20}.webp`}
                alt={f.title}
                className="z-0 h-full w-full object-cover"
              />
              <div
                style={{
                  background: `linear-gradient(0deg, rgba(${palettes[i].data?.LightMuted.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                }}
                className="absolute inset-x-0 bottom-0 h-[85%]"
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
              <div className="absolute inset-0 z-10 flex flex-col items-start justify-between p-6">
                <Tag.Root className="rounded-full">
                  🔥 Trending #{i + 1}
                </Tag.Root>
                <div className="flex w-full flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <Avatar.Root size="20">
                      <Avatar.Image src={f.author.avatar} />
                    </Avatar.Root>
                    <p className="pt-0.5 text-label-xs font-light">
                      {f.author.name} • {f.category}
                    </p>
                  </div>
                  <h2 className="line-clamp-2 text-pretty text-title-h6 font-light">
                    {f.title}
                  </h2>
                  <p className="line-clamp-3 text-pretty text-label-sm font-light">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {[featured?.[1]].map((f, index) => {
            const i = index + 1
            return (
              <div
                key={f.id}
                className="aspect-sqaure relative col-span-6 w-full overflow-hidden rounded-xl bg-primary-base *:text-white"
              >
                <RiHashtag
                  className="absolute left-0 top-0 fill-primary-darker"
                  size={300}
                />
                <div className="absolute inset-0 z-10 flex flex-col items-start justify-between p-6">
                  <div className="flex items-center gap-2">
                    <Tag.Root className="rounded-full">
                      🔥 Trending #{i + 1}
                    </Tag.Root>
                    <Tag.Root className="rounded-full"># Thread</Tag.Root>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <Avatar.Root size="20">
                        <Avatar.Image src={f.author.avatar} />
                      </Avatar.Root>
                      <p className="pt-0.5 text-label-xs font-light">
                        {f.author.name} • {f.category}
                      </p>
                    </div>
                    <h2 className="line-clamp-2 text-pretty text-title-h6 font-light">
                      {f.title}
                    </h2>
                    <p className="line-clamp-3 text-pretty text-label-sm font-light">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </Grid>
        <ul className="mt-6 flex flex-col gap-16">
          {comments.map((c) => {
            if (c.type === "article") {
              const f = c.article
              return (
                <article
                  className="flex flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-1"
                  key={f.id}
                >
                  <header className="flex items-center gap-2 px-4 py-2">
                    <Avatar.Root size="40">
                      <Avatar.Image src={c.author.avatar} />
                    </Avatar.Root>
                    <div className="flex flex-col">
                      <p className="text-label-md font-normal">
                        {c.author.name}
                      </p>
                      <p className="text-label-xs font-light text-text-sub-600">
                        Posted a new article •{" "}
                        {formatDistance(c.date, new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </header>
                  <div
                    style={{
                      color: palettes[1].data?.LightMuted?.titleTextColor,
                    }}
                    className="aspect-sqaure relative col-span-6 w-full overflow-hidden rounded-xl bg-pink-100"
                  >
                    <Image
                      path={`${1}.webp`}
                      alt={f.title}
                      className="z-0 h-full w-full object-cover"
                    />
                    <div
                      style={{
                        background: `linear-gradient(0deg, rgba(${palettes[1].data?.LightMuted.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                      }}
                      className="absolute inset-x-0 bottom-0 h-[85%]"
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
                    <div className="absolute inset-0 z-10 flex flex-col items-start justify-between p-6">
                      <span></span>
                      {/* <Tag.Root className="rounded-full">Article</Tag.Root> */}
                      <div className="flex w-full flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <Avatar.Root size="20">
                            <Avatar.Image src={f.author.avatar} />
                          </Avatar.Root>
                          <p className="pt-0.5 text-label-xs font-light">
                            {f.author.name} • {f.category}
                          </p>
                        </div>
                        <h2 className="line-clamp-2 text-pretty text-title-h6 font-light">
                          {f.title}
                        </h2>
                        <p className="line-clamp-3 text-pretty text-label-sm font-light">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            }
            return (
              <Link
                to="/communities/$id/threads/$threadId"
                params={{
                  id,
                  threadId: c.id,
                }}
                key={c.id}
              >
                <li className="flex items-start gap-5">
                  <Avatar.Root className="mt-1" size="48">
                    <Avatar.Image src={c.author.avatar} />

                    {c.author.admin && (
                      <Avatar.Indicator position="bottom">
                        <CustomVerifiedIconSVG />
                      </Avatar.Indicator>
                    )}
                    {c.author.admin && (
                      <Avatar.Indicator position="top">
                        <Avatar.Status status="online" />
                      </Avatar.Indicator>
                    )}
                  </Avatar.Root>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-label-lg font-medium">
                        {c.author.name.split(" ")[0]}{" "}
                        {c.author.name.split(" ")[1][0]}.
                      </p>
                      <p className="mt-0.5 text-label-xs font-light text-text-soft-400">
                        {formatDistance(c.date, new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-label-md font-light text-text-sub-600">
                      {c.title}
                    </p>
                    {c.type === "attachment" && (
                      <div className="mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-10 border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 transition-all">
                        <div className="flex items-center gap-2">
                          <FileFormatIcon.Root
                            size="small"
                            format={c.attachment.status}
                            color={c.attachment.color}
                          />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-label-sm font-light text-text-sub-600">
                              {c.attachment.title}
                            </p>
                            <p className="text-label-xs font-light text-text-soft-400">
                              {c.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <RiDownloadLine className="size-4 text-text-soft-400" />
                      </div>
                    )}
                    {c.type === "gallery" && (
                      <>
                        {c.gallery.length < 3 && (
                          <Grid gap="none" className="mt-2 gap-1">
                            {c.gallery.map((g) => {
                              const span = {
                                1: "col-span-12",
                                2: "col-span-6",
                              }[c.gallery.length]
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
                                  // alt={`Community ${c.name} image`}
                                />
                              )
                            })}
                          </Grid>
                        )}
                        {c.gallery.length >= 3 && (
                          <Grid gap="none" className="mt-2 gap-1">
                            {c.gallery.slice(0, 4).map((g, gi) => {
                              let span = ""
                              if (gi === 0) {
                                span = "col-span-12"
                              } else {
                                if (c.gallery.length - 1 === 2) {
                                  span = "col-span-6"
                                } else {
                                  span = "col-span-4"
                                }
                              }

                              const isLast = gi === 3
                              const amountExtra = c.gallery.length - 4

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
                              // }[c.gallery.length]
                            })}
                          </Grid>
                        )}
                      </>
                    )}
                  </div>
                </li>
              </Link>
            )
          })}
        </ul>
        <Section className="gutter">
          <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
            <h1 className="relative z-10 text-title-h4">
              Your community has no posts
            </h1>
            <p className="relative z-10 text-label-sm font-light text-text-soft-400">
              Be the first to post in this community.
            </p>
            <div className="flex items-center gap-3">
              <FancyButton.Root
                size="xsmall"
                variant="primary"
                className="relative z-10"
              >
                <FancyButton.Icon as={RiAddLine} />
                Create a thread
              </FancyButton.Root>
              <FancyButton.Root
                size="xsmall"
                variant="basic"
                className="relative z-10"
              >
                <FancyButton.Icon as={RiAddLine} />
                Create a article
              </FancyButton.Root>
              <FancyButton.Root
                size="xsmall"
                variant="basic"
                className="relative z-10"
              >
                <FancyButton.Icon as={RiAddLine} />
                Create a course
              </FancyButton.Root>
            </div>

            <RiAddLine
              className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
              size={450}
            />
          </div>
        </Section>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-video w-full rounded-xl bg-pink-100" />
        ))}
      </div>
    </>
  )
}

function CustomVerifiedIconSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.3431 5.51481L20.1212 3.29299C18.9497 2.12141 17.0502 2.12141 15.8786 3.29299L13.6568 5.51481H10.5146C8.85778 5.51481 7.51463 6.85796 7.51463 8.51481V11.6569L5.2928 13.8788C4.12123 15.0503 4.12123 16.9498 5.2928 18.1214L7.51463 20.3432V23.4854C7.51463 25.1422 8.85777 26.4854 10.5146 26.4854H13.6568L15.8786 28.7072C17.0502 29.8788 18.9497 29.8788 20.1212 28.7072L22.3431 26.4854H25.4852C27.142 26.4854 28.4852 25.1422 28.4852 23.4854V20.3432L30.707 18.1214C31.8786 16.9498 31.8786 15.0503 30.707 13.8788L28.4852 11.6569V8.51481C28.4852 6.85796 27.142 5.51481 25.4852 5.51481H22.3431ZM21.2217 7.22192C21.4093 7.40946 21.6636 7.51481 21.9288 7.51481H25.4852C26.0375 7.51481 26.4852 7.96253 26.4852 8.51481V12.0712C26.4852 12.3364 26.5905 12.5907 26.7781 12.7783L29.2928 15.293C29.6833 15.6835 29.6833 16.3167 29.2928 16.7072L26.7781 19.2219C26.5905 19.4095 26.4852 19.6638 26.4852 19.929V23.4854C26.4852 24.0377 26.0375 24.4854 25.4852 24.4854H21.9288C21.6636 24.4854 21.4093 24.5907 21.2217 24.7783L18.707 27.293C18.3165 27.6835 17.6833 27.6835 17.2928 27.293L14.7781 24.7783C14.5905 24.5907 14.3362 24.4854 14.071 24.4854H10.5146C9.96234 24.4854 9.51463 24.0377 9.51463 23.4854V19.929C9.51463 19.6638 9.40927 19.4095 9.22174 19.2219L6.70702 16.7072C6.31649 16.3167 6.31649 15.6835 6.70702 15.293L9.22174 12.7783C9.40927 12.5907 9.51463 12.3364 9.51463 12.0712V8.51481C9.51463 7.96253 9.96234 7.51481 10.5146 7.51481H14.071C14.3362 7.51481 14.5905 7.40946 14.7781 7.22192L17.2928 4.7072C17.6833 4.31668 18.3165 4.31668 18.707 4.7072L21.2217 7.22192Z"
        className="fill-bg-white-0"
      />
      <path
        d="M21.9288 7.51457C21.6636 7.51457 21.4092 7.40921 21.2217 7.22167L18.707 4.70696C18.3164 4.31643 17.6833 4.31643 17.2927 4.70696L14.778 7.22167C14.5905 7.40921 14.3361 7.51457 14.0709 7.51457H10.5146C9.96228 7.51457 9.51457 7.96228 9.51457 8.51457V12.0709C9.51457 12.3361 9.40921 12.5905 9.22167 12.778L6.70696 15.2927C6.31643 15.6833 6.31643 16.3164 6.70696 16.707L9.22167 19.2217C9.40921 19.4092 9.51457 19.6636 9.51457 19.9288V23.4851C9.51457 24.0374 9.96228 24.4851 10.5146 24.4851H14.0709C14.3361 24.4851 14.5905 24.5905 14.778 24.778L17.2927 27.2927C17.6833 27.6833 18.3164 27.6833 18.707 27.2927L21.2217 24.778C21.4092 24.5905 21.6636 24.4851 21.9288 24.4851H25.4851C26.0374 24.4851 26.4851 24.0374 26.4851 23.4851V19.9288C26.4851 19.6636 26.5905 19.4092 26.778 19.2217L29.2927 16.707C29.6833 16.3164 29.6833 15.6833 29.2927 15.2927L26.778 12.778C26.5905 12.5905 26.4851 12.3361 26.4851 12.0709V8.51457C26.4851 7.96228 26.0374 7.51457 25.4851 7.51457H21.9288Z"
        fill="#47C2FF"
      />
      <path
        d="M23.3737 13.3739L16.6666 20.081L13.2928 16.7073L14.707 15.2931L16.6666 17.2526L21.9595 11.9597L23.3737 13.3739Z"
        className="fill-text-white-0"
      />
    </svg>
  )
}
