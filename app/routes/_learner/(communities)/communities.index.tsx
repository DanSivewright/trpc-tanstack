import { useTRPC } from "@/integrations/trpc/react"
import {
  RiAttachmentLine,
  RiBankLine,
  RiCloudLine,
  RiCompassLine,
  RiGolfBallLine,
  RiHeadphoneLine,
  RiLayoutGridLine,
  RiNewsLine,
  RiRestaurantLine,
  RiSchoolLine,
  RiShakeHandsLine,
  RiShoppingBagLine,
  RiTeamLine,
  RiTreeLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as LinkButton from "@/components/ui/link-button"
import * as Tag from "@/components/ui/tag"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import { Section } from "@/components/section"

const tabs = [
  {
    label: "All",
    icon: RiLayoutGridLine,
  },
  {
    label: "Popular",
    icon: RiLayoutGridLine,
  },
  {
    label: "Recommended",
    icon: RiLayoutGridLine,
  },
  {
    label: "Explore",
    icon: RiLayoutGridLine,
  },
]
const chips = [
  {
    label: "Navigation",
    icon: RiCompassLine,
  },
  {
    label: "Finance",
    icon: RiBankLine,
  },
  {
    label: "Music",
    icon: RiHeadphoneLine,
  },
  {
    label: "News",
    icon: RiNewsLine,
  },
  {
    label: "Weather",
    icon: RiCloudLine,
  },
  {
    label: "Productivity",
    icon: RiAttachmentLine,
  },
  {
    label: "Food & Drink",
    icon: RiRestaurantLine,
  },
  {
    label: "Business",
    icon: RiShakeHandsLine,
  },
  {
    label: "Sports",
    icon: RiGolfBallLine,
  },
  {
    label: "Shopping",
    icon: RiShoppingBagLine,
  },
  {
    label: "Lifestyle",
    icon: RiTreeLine,
  },
  {
    label: "Kids",
    icon: RiTeamLine,
  },
  {
    label: "Education",
    icon: RiSchoolLine,
  },
]

export const Route = createFileRoute("/_learner/(communities)/communities/")({
  component: RouteComponent,
  validateSearch: z.object({
    selectedChips: z
      .array(z.enum(chips.map((c) => c.label) as [string, ...string[]]))
      .default([]),
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.communities.all.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.communities.joined.queryOptions()
      ),
    ])
  },
})

function RouteComponent() {
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())
  const joined = useQuery(trpc.communities.joined.queryOptions())
  return (
    <>
      <Section className="flex flex-col">
        <h2 className="gutter mt-8 text-paragraph-sm text-text-sub-600 lg:mt-0">
          Your Communities
        </h2>
        <DraggableScrollContainer>
          <section className="few no-scrollbar gutter flex w-max items-start space-x-4 py-3">
            {joined?.data?.map((community, i) => {
              const opts = [
                "online",
                "offline",
                "busy",
                "away",
                undefined,
              ] as const

              const randomIndex = Math.floor(Math.random() * opts.length)
              const randomOpt = opts[randomIndex]

              return (
                <button
                  key={community?.id + "-joined"}
                  className="flex aspect-[13/16] max-h-[240px] w-[40vw] max-w-[230px] flex-col justify-between gap-2 rounded-10 p-2 pt-4 md:w-[25vw] lg:w-[15vw]"
                  style={{
                    backgroundColor: community.meta.colors.DarkVibrant.hex,
                    color: community.meta.colors.DarkVibrant.titleTextColor,
                  }}
                >
                  <h3 className="line-clamp-2 px-2 text-left text-title-h6 font-light">
                    {community?.name}
                  </h3>
                  <Image
                    path={`community-${community.id}-image.jpg`}
                    transformation={[{ quality: 100 }]}
                    lqip={{
                      active: true,
                      quality: 1,
                      blur: 50,
                    }}
                    sizes="33vw"
                    className="aspect-video max-h-[115px] w-full overflow-hidden rounded-md object-cover"
                    alt={`Community ${community.name} image`}
                  />
                </button>
              )
            })}
          </section>
        </DraggableScrollContainer>
      </Section>
      <Section className="gutter flex flex-col gap-5">
        <h3 className="text-title-h3 font-light text-text-strong-950">
          Editor Picks
        </h3>
        <Grid>
          <Image
            path="community-wvxnO56olQ8TdQAA0Vco-image.jpg"
            className="col-span-6 overflow-hidden rounded-20 object-contain"
            lqip={{
              active: true,
              quality: 1,
              blur: 50,
            }}
          />
          <div className="col-span-6 flex flex-col items-start justify-center gap-6">
            <div className="flex items-center gap-3">
              <Avatar.Root size="24">
                <Avatar.Image src={communities?.data?.[0]?.featureImageUrl} />
              </Avatar.Root>
              <span className="text-label-sm font-light">
                {communities?.data?.[0]?.name}
              </span>
              <span className="text-label-sm font-light text-text-sub-600">
                {" "}
                • 12 Mins Ago
              </span>
            </div>
            <h3 className="text-pretty text-title-h2 font-light">
              The Ultimate Digital Detox: How to Unplug Without Falling Behind
            </h3>
            <p className="text-pretty text-paragraph-md text-text-sub-600">
              Struggling to balance screen time with real life? A digital detox
              doesn’t mean going off the grid—it’s about using technology
              intentionally. Learn how to unplug, recharge, and stay productive
              without missing out. Your mind (and focus) will thank you!
            </p>
            <div className="flex items-center gap-2.5">
              <LinkButton.Root className="text-warning-base">
                Tech
              </LinkButton.Root>
              <span className="text-label-sm text-text-sub-600">
                {" "}
                • 4 Min Read
              </span>
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <Image
              path="t0jgshpo6nnllwzg1eq81"
              className="aspect-video w-full overflow-hidden rounded-20 object-cover"
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
            />
            <div className="flex items-center gap-3">
              <Avatar.Root size="24">
                <Avatar.Image src={communities?.data?.[0]?.featureImageUrl} />
              </Avatar.Root>
              <span className="text-label-sm font-light">
                {communities?.data?.[0]?.name}
              </span>
              <span className="text-label-sm font-light text-text-sub-600">
                {" "}
                • 12 Mins Ago
              </span>
            </div>
            <h3 className="text-pretty text-title-h4 font-light">
              The Ultimate Digital Detox: How to Unplug Without Falling Behind
            </h3>
            <p className="text-pretty text-paragraph-xs text-text-sub-600">
              Struggling to balance screen time with real life? A digital detox
              doesn’t mean going off the grid—it’s about using technology
              intentionally. Learn how to unplug, recharge, and stay productive
              without missing out. Your mind (and focus) will thank you!
            </p>
            <div className="flex items-center gap-2.5">
              <LinkButton.Root className="text-warning-base">
                Tech
              </LinkButton.Root>
              <span className="text-label-sm text-text-sub-600">
                {" "}
                • 4 Min Read
              </span>
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <Image
              path="community-tkqBf6PK01T46xXqiI7X-image.jpg"
              className="aspect-video w-full overflow-hidden rounded-20 object-cover"
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
            />
            <div className="flex items-center gap-3">
              <Avatar.Root size="24">
                <Avatar.Image src={communities?.data?.[0]?.featureImageUrl} />
              </Avatar.Root>
              <span className="text-label-sm font-light">
                {communities?.data?.[0]?.name}
              </span>
              <span className="text-label-sm font-light text-text-sub-600">
                {" "}
                • 12 Mins Ago
              </span>
            </div>
            <h3 className="text-pretty text-title-h4 font-light">
              The Ultimate Digital Detox: How to Unplug Without Falling Behind
            </h3>
            <p className="text-pretty text-paragraph-xs text-text-sub-600">
              Struggling to balance screen time with real life? A digital detox
              doesn’t mean going off the grid—it’s about using technology
              intentionally. Learn how to unplug, recharge, and stay productive
              without missing out. Your mind (and focus) will thank you!
            </p>
            <div className="flex items-center gap-2.5">
              <LinkButton.Root className="text-warning-base">
                Tech
              </LinkButton.Root>
              <span className="text-label-sm text-text-sub-600">
                {" "}
                • 4 Min Read
              </span>
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <Image
              path="igcyx1cmgcrce36p32ppu"
              className="aspect-video w-full overflow-hidden rounded-20 object-cover"
              lqip={{
                active: true,
                quality: 1,
                blur: 50,
              }}
            />
            <div className="flex items-center gap-3">
              <Avatar.Root size="24">
                <Avatar.Image src={communities?.data?.[0]?.featureImageUrl} />
              </Avatar.Root>
              <span className="text-label-sm font-light">
                {communities?.data?.[0]?.name}
              </span>
              <span className="text-label-sm font-light text-text-sub-600">
                {" "}
                • 12 Mins Ago
              </span>
            </div>
            <h3 className="text-pretty text-title-h4 font-light">
              The Ultimate Digital Detox: How to Unplug Without Falling Behind
            </h3>
            <p className="text-pretty text-paragraph-xs text-text-sub-600">
              Struggling to balance screen time with real life? A digital detox
              doesn’t mean going off the grid—it’s about using technology
              intentionally. Learn how to unplug, recharge, and stay productive
              without missing out. Your mind (and focus) will thank you!
            </p>
            <div className="flex items-center gap-2.5">
              <LinkButton.Root className="text-warning-base">
                Tech
              </LinkButton.Root>
              <span className="text-label-sm text-text-sub-600">
                {" "}
                • 4 Min Read
              </span>
            </div>
          </div>
        </Grid>
      </Section>
      <Section className="bg-bg-weak-50" spacer="p">
        <header className="gutter flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar.Root size="32">
              <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
              <Avatar.Indicator position="top">
                <CustomVerifiedIconSVG />
              </Avatar.Indicator>
            </Avatar.Root>
            <h3 className="text-pretty text-title-h4 font-light">
              Published in: Origami & Paper Crafts
            </h3>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Button.Root
              className="w-fit rounded-full"
              variant="neutral"
              size="small"
            >
              All
              <Badge.Root square color="green">
                66
              </Badge.Root>
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Articles
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Events
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Threads
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Courses
            </Button.Root>
          </div>
        </header>
        <DraggableScrollContainer>
          <section className="no-scrollbar gutter flex w-max items-start space-x-8">
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
          </section>
        </DraggableScrollContainer>
      </Section>
      <Section className="bg-bg-weak-50" spacer="p" side="b">
        <header className="gutter flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar.Root size="32">
              <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
              <Avatar.Indicator position="top">
                <CustomVerifiedIconSVG />
              </Avatar.Indicator>
            </Avatar.Root>
            <h3 className="text-pretty text-title-h4 font-light">
              Published in: Origami & Paper Crafts
            </h3>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Button.Root
              className="w-fit rounded-full"
              variant="neutral"
              size="small"
            >
              All
              <Badge.Root square color="green">
                66
              </Badge.Root>
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Articles
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Events
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Threads
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Courses
            </Button.Root>
          </div>
        </header>
        <DraggableScrollContainer>
          <section className="no-scrollbar gutter flex w-max items-start space-x-8">
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
            <div className="flex w-[85dvw] flex-col gap-4 *:select-none md:w-[60dvw] lg:w-[50dvw] xl:w-[35dvw] 2xl:w-[29dvw]">
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <Avatar.Root size="56">
                  <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
                </Avatar.Root>
                <div className="flex grow items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className="line-clamp-1 text-title-h5 font-light">
                      Lorem, ipsum dolor.
                    </h4>
                    <p className="line-clamp-2 text-pretty text-label-xs font-light text-text-soft-400">
                      Lorem ipsum dolor sit amet consectetur adipisicing.
                    </p>
                  </div>
                  <Button.Root variant="primary" mode="lighter" size="xxsmall">
                    Open
                  </Button.Root>
                </div>
              </div>
            </div>
          </section>
        </DraggableScrollContainer>
      </Section>
      <Section spacer="p" className="gutter flex flex-col gap-8 bg-bg-weak-50">
        <header className="flex flex-col">
          <div className="mb-11 flex items-center gap-4">
            <Button.Root
              className="w-fit rounded-full"
              variant="neutral"
              size="small"
            >
              All
              <Badge.Root square color="green">
                66
              </Badge.Root>
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Articles
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Events
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Threads
            </Button.Root>
            <Button.Root
              className="w-fit rounded-full bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600"
              variant="neutral"
              size="small"
            >
              Courses
            </Button.Root>
          </div>
          <h2 className="text-pretty text-title-h3 font-light">
            Everything.{" "}
            <span className="text-text-soft-400">
              That happened in your communities
            </span>
          </h2>
        </header>
        <div className="columns-1 gap-3 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5">
          {communities?.data?.map((community) => (
            <div
              className="mb-3 w-full break-inside-avoid"
              key={community.id + "today"}
            >
              <Image
                path={`community-${community.id}-image.jpg`}
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                className="block rounded-10"
                alt={`Community ${community.name} image`}
              />
            </div>
          ))}
        </div>
      </Section>
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
