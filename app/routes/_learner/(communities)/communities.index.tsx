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
      {/* <DraggableScrollContainer className="fadeout-horizontal-sm">
        <section className="gutter flex w-max items-start space-x-3 py-4">
          {chips?.map((chip) => (
            <Tag.Root
              onClick={() =>
                nvaigate({
                  search: {
                    selectedChips: [...selectedChips, chip.label],
                  },
                })
              }
              key={chip.label}
            >
              <Tag.Icon as={chip.icon} />
              {chip.label}
            </Tag.Root>
          ))}
        </section>
      </DraggableScrollContainer> */}
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
    </>
  )
}
