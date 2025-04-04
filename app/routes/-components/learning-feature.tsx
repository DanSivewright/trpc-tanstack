import { useSuspenseQuery } from "@tanstack/react-query"

import { useTRPC } from "@/lib/trpc/react"
import * as Button from "@/components/ui/button"
import { Title } from "@/components/title"

type Props = {
  uid: string
}
const LearningHero: React.FC<Props> = ({ uid }) => {
  const trpc = useTRPC()

  const feature = useSuspenseQuery(
    trpc.enrolments.detail.queryOptions({
      params: {
        uid,
      },
      query: {
        excludeMaterial: true,
      },
    })
  )
  const enrolment = feature.data

  return (
    <>
      <header className="relative hidden h-[75dvh] w-screen flex-wrap md:flex">
        {enrolment?.publication?.featureImageUrl && (
          <img
            src={enrolment?.publication?.featureImageUrl || ""}
            alt="Learning header"
            className="bg-accent relative h-full w-full overflow-hidden object-cover md:w-[38.2%]"
          />
        )}
        <div className="flex h-full w-full flex-col justify-between gap-1.5 md:w-[61.8%]">
          <div
            // onMouseOver={() => {
            //   if (!session) return
            //   qc.prefetchQuery(
            //     q.enrolments.activity({
            //       params: {
            //         uid: enrolment?.uid || "",
            //       },
            //       session,
            //     })
            //   )
            //   qc.prefetchQuery(
            //     q.enrolments.detail({
            //       session,
            //       params: {
            //         uid: enrolment?.uid || "",
            //       },
            //       query: {
            //         excludeMaterial: true,
            //       },
            //     })
            //   )
            // }}
            className="flex h-[61.8%] w-full flex-col items-start justify-center px-6 lg:px-16 xl:px-32"
          >
            <div className="flex flex-wrap items-center gap-2 pb-1.5">
              {enrolment?.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-blue-600"></span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Due
                    {/* Due: {dateFormatter(enrolment.dueDate || "")} */}
                  </span>
                </div>
              )}
              {enrolment?.publication?.topics &&
                enrolment?.publication?.topics?.length > 0 && (
                  <>
                    <Separator
                      orientation="vertical"
                      className="h-4 rotate-12"
                    />
                    <span className="text-muted-foreground text-xs">
                      {enrolment.publication.topics?.length
                        ? enrolment.publication.topics.slice(0, 2).join(", ") +
                          (enrolment.publication.topics.length > 2
                            ? ` +${enrolment.publication.topics.length - 2}`
                            : "")
                        : ""}
                    </span>
                  </>
                )}
            </div>
            <Title
              level={1}
              showAs={2}
              style={{ marginTop: 0 }}
              className="relative z-20 line-clamp-2 text-balance text-left"
            >
              {enrolment?.publication?.title}
            </Title>
            <p className="text-muted-foreground text-balance text-left">
              {enrolment?.publication?.translations["1"]?.summary}
              {/* {enrolment?.publication?.translations["1"]?.summary ||
                generateFallbackDescription(enrolment || null)} */}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Button.Root
              // onClick={() => {
              //   qc.invalidateQueries({
              //     // queryKey: ["enrolments"],
              //     predicate: (query) =>
              //       query.queryKey[0] === "enrolments" &&
              //       query.queryKey[1] === "detail" &&
              //       query.queryKey[2] ===
              //         "43385c3f-4d1e-4e20-b027-94b784d38e51",
              //   })
              // }}
              // onClick={() => {
              //   qc.invalidateQueries()
              // }}
              // rounded="full"
              >
                Start Learning
              </Button.Root>
              <Button.Root
              // asChild
              // className="bg-background/70 backdrop-blur"
              // // rounded="full"
              // variant="outline"
              >
                View
                {/* <Link prefetch href={`/enrolments/${enrolment?.uid}`}>
                  View
                </Link> */}
              </Button.Root>
            </div>
          </div>
          {/* <DraggableScrollContainer className="h-[38.2%]">
            <div className="flex h-full w-max items-center gap-1.5 px-1.5">
              {enrolment?.publication?.material?.map((mod, modIndex) => (
                <Link
                  prefetch
                  href={`/enrolments/${enrolment?.uid}?moduleUid=${mod.uid}`}
                  key={mod.uid}
                  className="flex aspect-square h-full flex-col"
                >
                  <div className="w-full pb-1">
                    <span className="text-muted-foreground line-clamp-1 text-sm">
                      {mod.moduleVersion.module?.translations["1"]?.title}
                    </span>
                  </div>
                  <div className="bg-accent relative w-full grow overflow-hidden select-none">
                    {mod.moduleVersion.module?.featureImageUrl && (
                      <Image
                        priority={modIndex < 5}
                        //   @ts-ignore
                        src={mod.moduleVersion.module?.featureImageUrl}
                        //   @ts-ignore
                        alt={mod.moduleVersion.module?.translations["1"]?.title}
                        fill
                        quality={100}
                        className="z-0 object-cover select-none"
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </DraggableScrollContainer> */}
        </div>
      </header>
    </>
  )
}
export default LearningHero
