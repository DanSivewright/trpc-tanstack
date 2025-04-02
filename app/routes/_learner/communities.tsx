import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "motion/react"

import { useTRPC } from "@/lib/trpc/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Icon } from "@/components/icon"
import Image from "@/components/image"
import { Section } from "@/components/section"
import { Title } from "@/components/title"

export const Route = createFileRoute("/_learner/communities")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.all.queryOptions()
    )
  },
})
const filters = [
  { title: "Most Active", icon: "Flame" },
  { title: "Recently Created", icon: "Clock" },
  { title: "Beginner Friendly", icon: "Sparkles" },
  { title: "Professional", icon: "Briefcase" },
  { title: "Creative Arts", icon: "Palette" },
  { title: "Technology", icon: "Laptop" },
  { title: "Business", icon: "Building" },
  { title: "Language Learning", icon: "Languages" },
  { title: "Health & Wellness", icon: "Heart" },
  { title: "Science", icon: "Atom" },
  { title: "Music", icon: "Music" },
  { title: "Photography", icon: "Camera" },
  { title: "Writing", icon: "PenTool" },
  { title: "Digital Marketing", icon: "TrendingUp" },
  { title: "Personal Development", icon: "UserPlus" },
  { title: "Certification Available", icon: "Award" },
  { title: "Project Based", icon: "FolderKanban" },
  { title: "Mentorship", icon: "Users" },
  { title: "Live Sessions", icon: "Video" },
  { title: "Self-Paced", icon: "Clock3" },
  { title: "Discussion Active", icon: "MessageCircle" },
  { title: "Resource Rich", icon: "Library" },
  { title: "Collaboration", icon: "UsersRound" },
  { title: "Workshop Style", icon: "Hammer" },
  { title: "International", icon: "Globe" },
]
function RouteComponent() {
  const trpc = useTRPC()
  const communities = useQuery(trpc.communities.all.queryOptions())

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const hasTouched = useRef(false)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <>
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent className="basis-full gap-0 space-x-0">
          {communities.data?.slice(0, 6)?.map((community) => (
            <CarouselItem
              style={{
                color: community.meta.colors.Vibrant?.titleTextColor,
              }}
              className="relative aspect-square max-h-[75dvh] w-full overflow-hidden p-0 *:z-10 lg:aspect-[16/7] lg:max-h-[45dvh]"
              key={community.id + "-carousel"}
            >
              <Image
                path={`community-${community.id}-image.jpg`}
                transformation={[{ quality: 100 }]}
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                sizes="100vw"
                className="absolute inset-0 z-0 h-full w-full object-cover"
                alt={`Community ${community.name} image`}
              />

              <div
                className="gutter relative flex h-full w-full flex-col items-start justify-between pt-12 pb-20 *:z-10"
                style={{
                  background: `linear-gradient(0deg, rgba(${community.meta.colors.Vibrant?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                }}
              >
                <header className="flex w-full flex-col">
                  <Title margin="t" className="w-2/5 font-light text-pretty">
                    {community.name}
                  </Title>
                </header>
                <div className="flex w-full flex-col gap-8">
                  <div className="flex w-full items-end justify-between">
                    <div className="flex w-1/3 flex-col gap-3">
                      <div
                        style={{
                          background: `rgba(${community.meta.colors.DarkVibrant.rgb.join(",")}, 0.4)`,
                          border: `1px solid rgba(${community.meta.colors.DarkVibrant.rgb.join(",")}, 0.5)`,
                        }}
                        className="flex w-fit items-center rounded-full p-1 pl-[8px]"
                      >
                        <Avatar size={24} grouped>
                          <AvatarFallback>DS</AvatarFallback>
                          <AvatarImage
                            src={community.logoUrl}
                            className="object-cover"
                          />
                        </Avatar>
                        <Avatar size={24} grouped>
                          <AvatarFallback>DS</AvatarFallback>
                          <AvatarImage
                            src={community.logoUrl}
                            className="object-cover"
                          />
                        </Avatar>
                        <Avatar size={24} grouped>
                          <AvatarFallback>DS</AvatarFallback>
                          <AvatarImage
                            src={community.logoUrl}
                            className="object-cover"
                          />
                        </Avatar>
                        <Avatar size={24} grouped>
                          <AvatarFallback>+7</AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="w-full text-sm font-light text-pretty opacity-75">
                        {community.headline}
                      </p>
                      <div className="flex items-center gap-2">
                        {community.tags?.map((tag) => (
                          <Badge
                            style={{
                              background: `rgba(${community.meta.colors.DarkVibrant.rgb.join(",")}, 0.9)`,
                              border: `1px solid rgba(${community.meta.colors.DarkVibrant.rgb.join(",")}, 1)`,
                              color:
                                community.meta.colors.DarkVibrant.bodyTextColor,
                            }}
                            key={tag + community.id}
                            className="rounded-full px-2 py-1 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <button
                      style={{
                        background: community.meta?.colors?.DarkVibrant.hex,
                        color:
                          community.meta?.colors?.DarkVibrant.titleTextColor,
                      }}
                      className="flex h-16 w-fit cursor-pointer items-center gap-4 rounded-full p-1 pe-8 transition-colors hover:shadow-2xl"
                    >
                      <div
                        style={{
                          background: community.meta?.colors?.LightVibrant.hex,
                        }}
                        className="flex aspect-square h-full items-center justify-center rounded-full"
                      >
                        <Icon name="ArrowRight" className="h-6 w-6" />
                      </div>
                      <span className="shrink-0">Go to community</span>
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <ul className="gutter relative z-10 -mt-8 mb-7 -ml-4 flex w-[calc(100%+1rem)] items-center gap-4">
        {communities?.data?.slice(0, 6)?.map((c, i) => (
          <li
            key={c.id + "-dot"}
            className="bg-background/50 relative h-1 grow cursor-pointer overflow-hidden rounded-full"
            onClick={() => {
              if (i + 1 !== current) {
                api?.scrollTo(i)
              }
            }}
          >
            <AnimatePresence>
              {i + 1 === current && (
                <>
                  <motion.span
                    className="bg-background absolute inset-0 rounded-r-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: i + 1 === current ? 3 : 0.15 }}
                    layoutId={`dot-${i + 1}`}
                  />
                </>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
      <DraggableScrollContainer className="bg-background sticky top-[57px] shadow">
        <ul className="gutter flex w-max items-center gap-16">
          {filters.map((filter, i) => (
            <li
              key={filter.title}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-2 py-4 text-center",
                {
                  "text-muted-foreground": i !== 0,
                }
              )}
            >
              <Icon name={filter.icon as any} className="size-6" />
              <span className="shrink-0 text-xs">{filter.title}</span>
              {i === 0 ? (
                <span className="bg-foreground absolute inset-x-0 bottom-0 h-0.5 rounded-full"></span>
              ) : (
                <span className="bg-foreground/30 absolute inset-x-0 bottom-0 h-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></span>
              )}
            </li>
          ))}
        </ul>
      </DraggableScrollContainer>
      <Section
        side="b"
        className="gutter columns-1 gap-2 pt-4 md:columns-2 lg:columns-4"
      >
        {communities.data?.map((community, i) => (
          <div
            key={community.id + "-list"}
            className="mb-2 flex break-inside-avoid flex-col gap-2"
          >
            <Image
              path={`community-${community.id}-image.jpg`}
              lqip={{ active: true, quality: 1, blur: 50 }}
            />
            <p className="text-xs">
              {community.name}: {i}
            </p>
          </div>
        ))}
      </Section>
    </>
  )
}
