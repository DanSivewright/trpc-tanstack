import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  RiLoader2Line,
  RiLoader3Line,
  RiLoaderLine,
  RiRecordCircleLine,
  RiTimeLine,
} from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { Command, CommandEmpty } from "cmdk"
import { format, intervalToDuration } from "date-fns"
import { motion, useScroll, useTransform } from "motion/react"
import type { z } from "zod"

import useDebouncedCallback from "@/hooks/use-debounced-callback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommandMenu } from "@/components/ui/command-menu"
import { Drawer } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { AlertToast } from "@/components/ui/toast-alert"
import { Grid } from "@/components/grid"
import Image from "@/components/image"
import Bookmarks from "@/components/widgets/bookmarks"

import CoursesNotes from "../../communities/$id/courses/-components/courses-notes"

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

  const params = useParams({
    from: "/_learner/enrolments/$uid/",
  })
  const navigate = useNavigate({
    from: "/enrolments/$uid",
  })
  const search = useSearch({
    from: "/_learner/enrolments/$uid/",
  })
  const [q, setQ] = useState(search.q || "")
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
        replace: true,
        search: (prev) => ({
          ...prev,
          q: "",
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

  const handleSearch = useDebouncedCallback(async (query: string) => {
    navigate({
      replace: true,
      resetScroll: false,
      search: (old) => ({
        ...old,
        q: query,
      }),
    })
  }, 500)

  const handleScope = (
    scope: "all" | "not-started" | "in-progress" | "completed" | "failed"
  ) => {
    if (scope == "all") {
      navigate({
        resetScroll: false,
        search: (old) => ({
          ...old,
          scope: ["all"],
        }),
        replace: true,
      })
      return
    }

    if (search.scope?.includes(scope)) {
      const newScope = search.scope?.filter((s) => s !== scope)
      navigate({
        resetScroll: false,
        search: (old) => ({
          ...old,
          scope: newScope?.length > 0 ? newScope : ["all"],
        }),
        replace: true,
      })
      return
    }
    navigate({
      resetScroll: false,
      search: (old) => ({
        ...old,
        scope: [...(old.scope?.filter((x) => x !== "all") || []), scope],
      }),
      replace: true,
    })
  }

  const map = useMemo(() => {
    if (!drawerModule)
      return {
        all: [],
        "in-progress": [],
        "not-started": [],
        completed: [],
        failed: [],
      }
    return {
      all: drawerModule?.learning,
      "in-progress": drawerModule?.learning?.filter(
        (lesson) => activity.flat.get(lesson?.uid)?.status === "in-progress"
      ),
      "not-started": drawerModule?.learning?.filter(
        (lesson) => activity.flat.get(lesson?.uid)?.status === "not-started"
      ),
      completed: drawerModule?.learning?.filter(
        (lesson) => activity.flat.get(lesson?.uid)?.status === "completed"
      ),
      failed: drawerModule?.learning?.filter(
        (lesson) => activity.flat.get(lesson?.uid)?.status === "failed"
      ),
    }
  }, [drawerModule, activity.flat])

  const smartJoin = (arr: string[]) => {
    if (!arr?.length) return ""
    if (arr.length === 1) return arr[0]
    if (arr.length === 2) return `${arr[0]} & ${arr[1]}`
    return `${arr.slice(0, -1).join(", ")} & ${arr[arr.length - 1]}`
  }
  if (!drawerModule) return null

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
        <Drawer.Body className="relative z-10 -mt-5 rounded-t-20 bg-bg-white-0 px-2 py-8 drop-shadow-xl md:px-8">
          <div className="flex items-end justify-between px-2 md:px-0">
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
          <div className="mx-2 my-2.5 flex flex-col gap-2 rounded-10 bg-bg-weak-50 p-2 md:mx-0">
            <Input.Root size="xsmall">
              <Input.Wrapper>
                <Input.Field
                  value={q}
                  onInput={(e) => {
                    const value = e.currentTarget.value
                    setQ(value)
                    handleSearch(value)
                  }}
                  placeholder={`Search lessons in: ${drawerModule?.moduleVersion?.module?.translations?.["1"]?.title}`}
                />
                {q !== "" && search.q !== q && (
                  <Input.Icon as={RiLoader3Line} className="animate-spin" />
                )}
              </Input.Wrapper>
            </Input.Root>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button.Root
                    variant="neutral"
                    size="xxsmall"
                    className={cn("w-fit rounded-full", {
                      "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                        search.scope !== undefined,
                    })}
                    onClick={() => handleScope("all")}
                  >
                    All Lessons
                    <Badge.Root square color="green">
                      {map.all?.length}
                    </Badge.Root>
                  </Button.Root>
                  <Button.Root
                    variant="neutral"
                    size="xxsmall"
                    className={cn("w-fit rounded-full", {
                      "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                        !search.scope?.includes("in-progress"),
                    })}
                    onClick={() => handleScope("in-progress")}
                  >
                    In Progress
                    <Badge.Root
                      square
                      {...(map["in-progress"]?.length > 0
                        ? {
                            color: "blue",
                          }
                        : {
                            color: "gray",
                          })}
                    >
                      {map["in-progress"]?.length}
                    </Badge.Root>
                  </Button.Root>
                  <Button.Root
                    variant="neutral"
                    size="xxsmall"
                    className={cn("w-fit rounded-full", {
                      "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                        !search.scope?.includes("not-started"),
                    })}
                    onClick={() => handleScope("not-started")}
                  >
                    Not Started
                    <Badge.Root
                      square
                      {...(map["not-started"]?.length > 0
                        ? {
                            color: "purple",
                          }
                        : {
                            color: "gray",
                          })}
                    >
                      {map["not-started"]?.length}
                    </Badge.Root>
                  </Button.Root>
                  <Button.Root
                    variant="neutral"
                    size="xxsmall"
                    className={cn("w-fit rounded-full", {
                      "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                        !search.scope?.includes("completed"),
                    })}
                    onClick={() => handleScope("completed")}
                  >
                    Completed
                    <Badge.Root
                      square
                      {...(map.completed?.length > 0
                        ? {
                            color: "green",
                          }
                        : {
                            color: "gray",
                          })}
                    >
                      {map.completed?.length}
                    </Badge.Root>
                  </Button.Root>
                  <Button.Root
                    variant="neutral"
                    size="xxsmall"
                    className={cn("w-fit rounded-full", {
                      "bg-neutral-200 text-text-strong-950 hover:bg-bg-sub-300 hover:text-text-sub-600":
                        !search.scope?.includes("failed"),
                    })}
                    onClick={() => handleScope("failed")}
                  >
                    Failed
                    <Badge.Root
                      square
                      {...(map.failed?.length > 0
                        ? {
                            color: "orange",
                          }
                        : {
                            color: "gray",
                          })}
                    >
                      {map.failed?.length}
                    </Badge.Root>
                  </Button.Root>
                </div>
                {q !== "" || search.scope !== undefined ? (
                  <Button.Root
                    variant="error"
                    mode="lighter"
                    size="xxsmall"
                    className="w-fit rounded-full"
                    onClick={() => {
                      setQ("")
                      handleScope("all")
                    }}
                  >
                    Clear (
                    {0 + (q !== "" ? 1 : 0) + (search.scope?.length || 0)})
                    <Button.Icon as={RiCloseCircleFill} />
                  </Button.Root>
                ) : null}
              </div>
              {search.scope && (
                <span className="text-subheading-xs font-normal text-text-soft-400">
                  Searching lessons that are:{" "}
                  <strong>{smartJoin(search.scope)}</strong>
                </span>
              )}
            </div>
          </div>
          <Command>
            <CommandMenu.Input
              value={q}
              onValueChange={setQ}
              className="sr-only hidden"
            />
            <CommandMenu.List>
              {Object.entries(map).map(([key, value]) => {
                if (search.scope === undefined && key !== "all") return null
                if (
                  search.scope &&
                  !search.scope.includes(key as keyof typeof map)
                )
                  return null
                if (value?.length === 0) return null
                return (
                  <CommandMenu.Group
                    className="capitalize"
                    {...(key !== "all" && {
                      heading: key.replace("-", " "),
                    })}
                  >
                    {value?.map((learning, learningIndex) => {
                      const act = activity.flat.get(learning.uid)
                      return (
                        <CommandMenu.Item
                          key={`${key}:${learning.uid}`}
                          value={learning?.title!}
                          className={cn(
                            "flex w-full flex-col items-start justify-between gap-2 md:flex-row md:items-center",
                            {
                              "relative z-10 bg-primary-alpha-10 ring-1 ring-primary-base hover:bg-primary-alpha-16":
                                learning.uid === search.highlightUid,
                            }
                          )}
                        >
                          <p className="line-clamp-2 text-label-lg font-medium md:text-inherit md:font-normal">
                            {learning.title}
                          </p>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <p className="text-label-xs capitalize text-text-soft-400">
                              {learning.kind === "lesson"
                                ? learning?.type
                                : learning.kind}
                            </p>

                            <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                            <span className="flex items-center gap-2 text-label-xs text-text-soft-400">
                              {Object.entries(learning?.duration ?? {}).length >
                                0 &&
                              !Object.entries(learning?.duration ?? {}).every(
                                ([_, value]) => value === 0
                              )
                                ? Object.entries(learning?.duration ?? {})
                                    .map(([key, value]) => {
                                      if (
                                        !key ||
                                        !value ||
                                        value === 0 ||
                                        key === "0"
                                      )
                                        return "No Duration"
                                      return (
                                        <React.Fragment key={key}>
                                          <span>
                                            {value} {key}
                                          </span>
                                          <div className="h-3 w-px rotate-[15deg] bg-bg-sub-300" />
                                        </React.Fragment>
                                      )
                                    })
                                    .filter(Boolean)
                                : null}
                            </span>
                            <Badge.Root
                              variant="filled"
                              {...(act?.status === "completed" && {
                                color: "green",
                              })}
                              {...(act?.status === "in-progress" && {
                                color: "blue",
                              })}
                              {...(act?.status === "not-started" && {
                                color: "gray",
                              })}
                              {...(act?.status === "failed" && {
                                color: "red",
                              })}
                              size="medium"
                              className="shrink-0 capitalize"
                            >
                              {act?.status === "completed" && (
                                <Badge.Icon as={RiCheckboxCircleFill} />
                              )}
                              {act?.status === "in-progress" && (
                                <Badge.Icon as={RiRecordCircleLine} />
                              )}
                              {act?.status === "failed" && (
                                <Badge.Icon as={RiCloseCircleFill} />
                              )}
                              {act?.status.replace("-", " ")}
                            </Badge.Root>
                          </div>
                        </CommandMenu.Item>
                      )
                    })}
                  </CommandMenu.Group>
                )
              })}
            </CommandMenu.List>
          </Command>
          <Grid
            gap="none"
            className="my-4 aspect-auto w-full gap-4 md:aspect-video"
          >
            {search.moduleUid && (
              <Bookmarks
                className="col-span-12 h-fit md:col-span-6 md:h-full"
                identifierKey="moduleUid"
                identifiers={[search.moduleUid]}
                forceEnrolmentUid={params.uid}
              />
            )}
            <CoursesNotes
              className="col-span-12 aspect-square h-full md:col-span-6 md:aspect-auto"
              enrolments={[]}
            />
          </Grid>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
export default EnrolmentsModuleDrawer
