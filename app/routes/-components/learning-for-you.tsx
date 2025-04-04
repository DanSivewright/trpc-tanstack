import { useCallback } from "react"
import { dateFormatter } from "@/utils/date-formatter"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { z } from "zod"

import { useTRPC } from "@/lib/trpc/react"
import type { EnrolmentsAllSchema } from "@/lib/trpc/routers/enrolments/schemas/enrolments-all-schema"
import { cn } from "@/lib/utils"
import DraggableScrollContainer from "@/components/draggable-scroll-container"
import { Section } from "@/components/section"
import { Title } from "@/components/title"

type Props = {}
const LearningForYou: React.FC<Props> = ({}) => {
  const trpc = useTRPC()
  const { data: enrolments } = useQuery(
    trpc.enrolments.all.queryOptions({
      query: {
        limit: 9,
        contentType: "digital,mixed",
      },
    })
  )
  const { data: me } = useQuery(trpc.people.me.queryOptions())

  const renderImage = useCallback(
    (en: z.infer<typeof EnrolmentsAllSchema>["enrolments"][number]) => {
      return en?.publication?.featureImageUrl ? (
        <img
          src={en?.publication.featureImageUrl || ""}
          alt={`Featured course image for ${en?.publication.content.title}`}
          className="pointer-events-none z-0 object-cover object-center"
        />
      ) : (
        <p
          style={{
            lineHeight: "7rem",
          }}
          className="absolute left-[25%] top-[8rem] text-[10rem] font-black italic text-white/10"
        >
          {en?.publication.content.title}
        </p>
      )
    },
    []
  )
  const qc = useQueryClient()

  return (
    <Section>
      <div className="gutter my-5 space-y-1 lg:my-6 xl:my-7">
        x
        {/* <Avatar className="size-8 text-sm">
          <AvatarImage
            className="object-cover"
            src={me?.imageUrl || undefined}
          />
          <AvatarFallback>{me?.firstName?.[0] || ""}</AvatarFallback>
        </Avatar> */}
        <Title showAs={6} level={2} style={{ margin: 0 }} className="mt-1.5">
          For your today
        </Title>
        <p className="text-muted-foreground/60 text-xs">
          {dateFormatter(new Date().toISOString(), {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <DraggableScrollContainer>
        <Section
          spacer="p"
          side="b"
          className="no-scrollbar gutter flex w-max items-center space-x-4"
        >
          {enrolments?.enrolments?.map((enrolment) => (
            <article
              className="flex flex-col gap-1.5"
              key={"for-you-" + enrolment.uid}
              onMouseEnter={() => {
                qc.prefetchQuery({
                  ...trpc.enrolments.detail.queryOptions({
                    params: {
                      uid: enrolment.uid,
                    },
                  }),
                  staleTime: 1000 * 30,
                })
              }}
            >
              <Link
                to="/enrolments/$uid"
                params={{
                  uid: enrolment.uid,
                }}
                className={cn(
                  "bg-accent relative aspect-square h-[35dvh] overflow-hidden rounded-sm md:aspect-video",
                  {
                    "bg-blue-500": !enrolment?.publication.featureImageUrl,
                  }
                )}
              >
                {renderImage(enrolment)}
              </Link>
              <footer className="flex items-center justify-between">
                <Link
                  to="/enrolments/$uid"
                  params={{
                    uid: enrolment.uid,
                  }}
                  className="w-4/5"
                >
                  <Title
                    className="line-clamp-1"
                    level={3}
                    margin={false}
                    showAs={6}
                  >
                    {enrolment.publication.content.title}
                  </Title>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="border-border bg-background/70 flex shrink-0 items-center gap-2 rounded-full border px-2 py-0.5 capitalize backdrop-blur">
                    <span className="relative flex size-2">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75",
                          {
                            "bg-blue-600":
                              enrolment.currentState === "in-progress",
                            "bg-red-500":
                              enrolment.currentState === "not-started",
                          }
                        )}
                      ></span>
                      <span
                        className={cn(
                          "relative inline-flex size-2 rounded-full bg-green-500",
                          {
                            "bg-blue-500":
                              enrolment.currentState === "in-progress",
                            "bg-red-500":
                              enrolment.currentState === "not-started",
                          }
                        )}
                      ></span>
                    </span>
                    <span className="text-xs">
                      {enrolment.currentState.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </Section>
      </DraggableScrollContainer>
    </Section>
  )
}
export default LearningForYou
