import { useCallback, useEffect, useMemo, useRef } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { cn } from "@/utils/cn"
import { getModuleDueDate } from "@/utils/format-table-enrolments"
import { getPathFromGoogleStorage } from "@/utils/get-path-from-google-storage"
import {
  RiArrowRightSLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiClockwiseFill,
  RiClockwiseLine,
  RiCloseCircleFill,
  RiFilterLine,
  RiRecordCircleLine,
  RiTimeLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { format, intervalToDuration } from "date-fns"
import { motion, useScroll, useTransform } from "motion/react"
import type { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { AlertToast } from "@/components/ui/toast-alert"
import { Grid } from "@/components/grid"
import Image from "@/components/image"

type Props = {
  enrolment: z.infer<typeof EnrolmentsDetailSchema>
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
}
const EnrolmentsModuleDrawer: React.FC<Props> = ({ enrolment, activity }) => {
  const trpc = useTRPC()

  const navigate = useNavigate({
    from: "/enrolments/$uid",
  })
  const search = useSearch({
    from: "/_learner/enrolments/$uid/",
  })
  const drawerScrollRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    container: drawerScrollRef,
  })
  const drawerScrollY = useTransform(
    scrollY,
    [0, 500],
    [0, -100],
    { clamp: true } // This ensures the animation stops at the endpoints
  )

  const drawerModule = useMemo(() => {
    if (!search.moduleUid) return false
    const foundModule = enrolment?.publication?.material?.find(
      (material) => material.uid === search.moduleUid
    )
    return foundModule
  }, [search.moduleUid, enrolment])

  const palette = useQuery({
    ...trpc.palette.get.queryOptions({
      // @ts-ignore
      url: drawerModule?.moduleVersion?.module?.featureImageUrl || "",
    }),
    enabled: !!(
      // @ts-ignore
      (drawerModule?.moduleVersion?.module?.featureImageUrl && drawerModule)
    ),
  })

  const onModuleDrawerOpenChange = useCallback((open: boolean) => {
    if (!open) {
      navigate({
        resetScroll: false,
        search: (prev) => ({
          ...prev,
          moduleUid: "",
          highlightUid: "",
        }),
      })
    }
  }, [])

  const imagePath = useMemo(() => {
    if (!drawerModule) return ""
    return getPathFromGoogleStorage(
      drawerModule?.moduleVersion?.module?.featureImageUrl || ""
    )
  }, [drawerModule])

  const moduleActivity = useMemo(() => {
    if (!drawerModule) return null
    return activity.flat.get(drawerModule.uid) || null
  }, [drawerModule, activity])

  useEffect(() => {
    if (!drawerModule && search.moduleUid !== "") {
      onModuleDrawerOpenChange(false)
    }
  }, [drawerModule, search.moduleUid])

  const approxDuration = useMemo(() => {
    if (!drawerModule) return null
    const DEAFULT_DURATION = 30
    const totalMinutes = Object.entries(drawerModule?.duration ?? {}).reduce(
      (total, [key, value]) => {
        if (!key || !value || value === 0 || key === "0") return total
        return total + value * DEAFULT_DURATION
      },
      0
    )
    const duration = intervalToDuration({
      start: 0,
      end: totalMinutes * 60 * 1000,
    })
    const hours = duration.hours || 0
    const minutes = duration.minutes || 0
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`
  }, [drawerModule])

  return (
    <Drawer.Root open={!!drawerModule} onOpenChange={onModuleDrawerOpenChange}>
      <Drawer.Content className="relative h-screen max-w-screen-md">
        <Drawer.Header
          showCloseButton={false}
          className={cn("relative aspect-[16/8] w-full bg-primary-base", {
            "animate-pulse bg-bg-weak-50": palette?.isLoading,
          })}
        >
          {!palette?.isLoading && drawerModule && (
            <>
              <Image
                path={imagePath || ""}
                alt={
                  drawerModule?.moduleVersion?.module?.translations?.["1"]
                    ?.title + " feature image"
                }
                lqip={{
                  active: true,
                  quality: 1,
                  blur: 50,
                }}
                sizes="(max-width: 768px) 100vw, 768px"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {palette?.data && (
                <div
                  style={{
                    background: `linear-gradient(0deg, rgba(${palette?.data?.LightMuted?.rgb?.join(",")}, 1) 0%, rgba(255,255,255,0) 100%)`,
                  }}
                  className="absolute inset-x-0 bottom-0 z-[1] h-[65%]"
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
              )}
              <div className="relative z-10 flex h-full flex-col justify-end gap-6 pb-8">
                <div
                  style={{
                    color: palette?.data?.LightMuted?.titleTextColor,
                  }}
                  className="flex w-full flex-col justify-end gap-2"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {drawerModule?.dueDate && (
                      <Badge.Root>
                        <Badge.Icon as={RiCalendarLine} />
                        {format(
                          new Date(
                            getModuleDueDate(
                              drawerModule?.dueDate,
                              enrolment?.createdAt
                            )
                          ),
                          "MMM d, yyyy"
                        )}
                      </Badge.Root>
                    )}
                    <span className="flex items-center gap-2 text-label-xs opacity-80">
                      {Object.entries(drawerModule?.duration ?? {}).length >
                        0 &&
                      !Object.entries(drawerModule?.duration ?? {}).every(
                        ([_, value]) => value === 0
                      )
                        ? Object.entries(drawerModule?.duration ?? {})
                            .map(([key, value]) => {
                              if (!key || !value || value === 0 || key === "0")
                                return "No Duration"
                              return (
                                <span
                                  className="flex items-center gap-1"
                                  key={key}
                                >
                                  <RiTimeLine className="size-4" />
                                  {value} {key}
                                </span>
                              )
                            })
                            .filter(Boolean)
                        : "No Duration"}
                    </span>

                    <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                    <div className="flex items-center gap-2 capitalize">
                      <Badge.Root
                        variant="filled"
                        {...(moduleActivity?.status === "completed" && {
                          color: "green",
                        })}
                        {...(moduleActivity?.status === "in-progress" && {
                          color: "blue",
                        })}
                        {...(moduleActivity?.status === "not-started" && {
                          color: "gray",
                          variant: "stroke",
                        })}
                        {...(moduleActivity?.status === "failed" && {
                          color: "red",
                        })}
                        className="capitalize"
                      >
                        {moduleActivity?.status === "completed" && (
                          <Badge.Icon as={RiCheckboxCircleFill} />
                        )}
                        {moduleActivity?.status === "in-progress" && (
                          <Badge.Icon as={RiRecordCircleLine} />
                        )}
                        {moduleActivity?.status === "failed" && (
                          <Badge.Icon as={RiCloseCircleFill} />
                        )}
                        {moduleActivity?.status.replace("-", " ")}
                      </Badge.Root>

                      {/* {isLocked(material.uid, materialIndex) && (
                            <>
                              <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <RiLockLine className="size-3 text-yellow-600" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>
                                    Locked! Complete previous modules first.
                                  </p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </>
                          )} */}
                    </div>
                  </div>
                  <h1 className="line-clamp-3 text-title-h2">
                    {
                      drawerModule?.moduleVersion?.module?.translations?.["1"]
                        ?.title
                    }
                  </h1>
                  {drawerModule?.tags && (
                    <div className="flex flex-wrap gap-2">
                      {drawerModule?.tags?.map((topic) => (
                        <Badge.Root
                          {...(palette?.data?.LightMuted?.rgb
                            ? {
                                style: {
                                  backgroundColor: `rgba(${palette?.data?.DarkVibrant?.rgb?.join(",")}, 1)`,
                                },
                              }
                            : {
                                color: "blue",
                              })}
                          key={topic}
                        >
                          {topic}
                        </Badge.Root>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-3">
                    <Button.Root
                      variant="neutral"
                      mode="lighter"
                      className="rounded-full p-0.5 pl-3"
                      onClick={() => {
                        toast.custom((t) => (
                          <AlertToast.Root
                            t={t}
                            status="feature"
                            message="Comming soon..."
                          />
                        ))
                      }}
                    >
                      <span>Continue Learning</span>
                      <div className="flex aspect-square h-full items-center justify-center rounded-full bg-bg-strong-950">
                        <Button.Icon
                          className="fill-bg-white-0"
                          as={RiArrowRightSLine}
                        />
                      </div>
                    </Button.Root>
                  </div>
                </div>
              </div>
            </>
          )}
        </Drawer.Header>
        {drawerModule && (
          <Drawer.Body className="relative z-10 -mt-5 rounded-t-20 bg-bg-white-0 p-8 drop-shadow-xl">
            <div className="flex items-end justify-between">
              <h1 className="text-title-h5">Lessons</h1>
              <div className="text-label-sm text-text-soft-400">
                <span className="font-extrabold text-text-sub-600">
                  {drawerModule?.learning?.length || 0}
                </span>{" "}
                Lesson
                {drawerModule?.learning?.length === 1 ? "" : "s"}
                <span className="font-semibold text-text-sub-600"> • </span>
                <span className="font-semibold text-text-sub-600">
                  {approxDuration}{" "}
                </span>
                total length
              </div>
            </div>
            <div className="my-2 flex items-center justify-between rounded-[12px] bg-bg-weak-50 p-1">
              <Input.Root size="xsmall">
                <Input.Wrapper>
                  <Input.Field placeholder="Search" />
                </Input.Wrapper>
              </Input.Root>
              <div className="flex items-center gap-2">
                <Button.Root
                  className="rounded-l-none ring-1 ring-primary-base"
                  size="xxsmall"
                >
                  <Button.Icon as={RiFilterLine} />
                </Button.Root>
              </div>
            </div>
          </Drawer.Body>
        )}
      </Drawer.Content>
    </Drawer.Root>
  )
}
export default EnrolmentsModuleDrawer
