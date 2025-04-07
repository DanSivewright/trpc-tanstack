import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { dateFormatter } from "@/utils/date-formatter"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import Image from "@/components/image"
import { Section, sectionVariants } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities/today"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const communities = useQuery(trpc.communities.all.queryOptions())
  return (
    <>
      <DraggableScrollContainer
        className={cn(sectionVariants({}), "fadeout-right gutter")}
      >
        <section className="relative flex w-max items-center space-x-4">
          <div className="sticky left-0 aspect-[9/16] w-[20vw]">
            <div className="absolute inset-y-0 -left-6 z-0 h-full w-full to-transparent backdrop-blur lg:-left-12 xl:-left-24">
              <div className="h-full w-full bg-gradient-to-r from-bg-white-0 to-transparent"></div>
            </div>
            <article className="relative z-10 h-full w-full rounded-10 bg-bg-soft-200"></article>
          </div>
          <div className="flex flex-col gap-4">
            <Badge.Root
              className="sticky left-[calc(20vw+1rem)] w-fit"
              color="green"
              variant="light"
              size="medium"
            >
              <Badge.Dot />
              New Releases
            </Badge.Root>
            <h3 className="sticky left-[calc(20vw+1rem)] w-fit text-pretty text-title-h3 font-light">
              Lorem ipsum dolor sit amet consectetur.
            </h3>
            <ul className="flex items-center gap-4">
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
              <article className="aspect-video w-[33vw] rounded-10 bg-bg-sub-300"></article>
            </ul>
            <p className="sticky left-[calc(20vw+1rem)] w-fit max-w-[20%] text-pretty text-label-sm font-light text-text-soft-400">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Obcaecati, consectetur? Autem vel doloribus et molestiae ipsam
              consectetur iure reiciendis hic alias. Alias odit suscipit
              laborum, recusandae aut voluptates corporis voluptate!
            </p>
          </div>
        </section>
      </DraggableScrollContainer>
      <Section>
        <header className="gutter">
          <h3 className="text-pretty text-title-h4 font-light">
            Popular Articles
          </h3>
          <p className="text-pretty text-label-sm font-light text-text-soft-400">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
            aliquid quasi quibusdam.
          </p>
        </header>
        <DraggableScrollContainer>
          <section className="no-scrollbar gutter mt-8 flex w-max items-start space-x-8">
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
      <Section>
        <header className="gutter">
          <h3 className="text-pretty text-title-h4 font-light">
            Active Threads
          </h3>
          <p className="text-pretty text-label-sm font-light text-text-soft-400">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
            aliquid quasi quibusdam.
          </p>
        </header>
        <DraggableScrollContainer>
          <section className="no-scrollbar gutter mt-8 flex w-max items-start space-x-8">
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
              That happened in the last week
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
