import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communityItemSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { useSuspenseQueries } from "@tanstack/react-query"
import { isAfter } from "date-fns"
import type { z } from "zod"

import { Divider } from "@/components/ui/divider"
import { Tooltip } from "@/components/ui/tooltip"
import { Grid } from "@/components/grid"
import { Section } from "@/components/section"

import FeaturedCourse from "./featured-course"
import FeaturedThread from "./featured-thread"

type Props = {
  communityId: string
}

type communityFeedItem = z.infer<typeof communityItemSchema>
const components: {
  [K in communityFeedItem["type"]]?: React.ComponentType<{
    source: Extract<communityFeedItem, { type: K }>
    size: "small" | "large"
    className?: string
  }>
} = {
  thread: FeaturedThread,
  course: FeaturedCourse,
}

const FeaturedGrid: React.FC<Props> = ({ communityId }) => {
  const trpc = useTRPC()

  const items = useSuspenseQueries({
    queries: [
      trpc.communities.courses.all.queryOptions({
        communityId,
      }),
      trpc.communities.threads.all.queryOptions({
        communityId,
      }),
      trpc.communities.articles.all.queryOptions({
        communityId,
      }),
    ],
  })

  const featured = useMemo(() => {
    if (!items) return []

    return items
      ?.flatMap((item) =>
        item?.data?.filter(
          (x) =>
            x.isFeatured &&
            x.isFeaturedUntil &&
            isAfter(new Date(x.isFeaturedUntil), new Date())
        )
      )
      .sort((a, b) => {
        return (
          new Date(b.isFeaturedFrom || b.createdAt).getTime() -
          new Date(a.isFeaturedFrom || a.createdAt).getTime()
        )
      })
  }, [items])

  if (!featured.length) return null

  return (
    <Section className="flex w-full flex-col items-center">
      <header className="flex w-full max-w-screen-sm flex-col items-center gap-4 text-center">
        <Divider.Root className="w-fit" variant="text">
          FEATURED
        </Divider.Root>
        <h1 className="text-title-h3">Featured In Your Community</h1>
        <p className="mt-2">
          A curated collection of articles and courses capturing the essence of
          our community and the stories we tell.
        </p>
      </header>
      <Section
        className="grid h-[65vh] w-full max-w-screen-2xl grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))] 2xl:px-0"
        side="t"
        size="sm"
      >
        {featured?.slice(0, 1)?.map((item) => {
          return (
            <div
              key={"featured-" + item.id}
              className="aspect-[16/14] h-full w-full bg-red-50 md:aspect-auto"
            ></div>
          )
        })}
        <div className="flex h-full w-full flex-col gap-4">
          {featured?.slice(1, 3)?.map((nestedItem, nestedItemIndex) => {
            return (
              <div
                key={"featured-" + nestedItem.id}
                className="aspect-[16/14] h-full w-full bg-red-50 lg:aspect-auto"
              ></div>
            )
          })}
        </div>
        {featured?.slice(3, 4)?.map((item) => {
          return (
            <div
              key={"featured-" + item.id}
              className="aspect-[16/14] h-full w-full bg-red-50 md:aspect-auto"
            ></div>
          )
        })}
        {/* {featured?.map((item, itemIndex) => {
          if (itemIndex > 3) return null
          if (itemIndex === 1 || itemIndex === 2) {
            return (
              <div className="flex h-full w-full flex-col gap-4">
                {featured?.slice(1, 3)?.map((nestedItem, nestedItemIndex) => {
                  return (
                    <div
                      key={"featured-" + nestedItem.id}
                      className="aspect-[16/14] h-full w-full bg-red-50 lg:aspect-auto"
                    ></div>
                  )
                })}
              </div>
            )
          }
          return (
            <div
              key={"featured-" + item.id}
              className="aspect-[16/14] h-full w-full bg-red-50 md:aspect-auto"
            ></div>
          )
        })} */}
        {/* <div className="aspect-[16/14] h-full w-full bg-red-50 md:aspect-auto"></div>
        <div className="flex h-full w-full flex-col gap-4">
          <div className="aspect-[16/14] h-full w-full bg-red-50 lg:aspect-auto"></div>
          <div className="aspect-[16/14] h-full w-full bg-red-50 lg:aspect-auto"></div>
        </div>
        <div className="aspect-[16/14] h-full w-full bg-red-50 lg:aspect-auto"></div> */}
      </Section>
    </Section>
    // <Grid gap="none" className="h-fit w-full gap-4">
    //   {featured?.length === 1 ? (
    //     <>
    //       {featured?.map((item) => {
    //         const Block = components[item.type]
    //         if (!Block) return null
    //         return (
    //           <Block
    //             key={"featured-" + item.id}
    //             // @ts-ignore
    //             source={item}
    //             className="col-span-12"
    //             size="large"
    //           />
    //         )
    //       })}
    //     </>
    //   ) : (
    //     <>
    //       {featured?.slice(0, 1)?.map((item) => {
    //         const Block = components[item.type]
    //         if (!Block) return null
    //         return (
    //           <Block
    //             key={"featured-" + item.id}
    //             // @ts-ignore
    //             source={item}
    //             className="aspect-[16/13]"
    //             size="large"
    //           />
    //         )
    //       })}
    //       <div className="col-span-4 flex h-full flex-1 flex-col justify-between gap-4 rounded-10">
    //         {featured
    //           ?.slice(1)
    //           .slice(0, 3)
    //           ?.map((item, itemIndex) => {
    //             const length = featured?.slice(1)?.slice(0, 3)?.length
    //             const Block = components[item.type]
    //             if (!Block) return null
    //             return (
    //               <Tooltip.Root key={"featured-" + item.id}>
    //                 <Tooltip.Trigger asChild>
    //                   <Block
    //                     key={"featured-" + item.id}
    //                     // @ts-ignore
    //                     source={item}
    //                     size="small"
    //                     className={cn("", {
    //                       "max-h-[33%]": length < 3,
    //                     })}
    //                   />
    //                 </Tooltip.Trigger>
    //                 <Tooltip.Content side="bottom">
    //                   <p>{item.title}</p>
    //                 </Tooltip.Content>
    //               </Tooltip.Root>
    //             )
    //           })}
    //       </div>
    //     </>
    //   )}
    // </Grid>
  )
}
export default FeaturedGrid
