import { useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import type { ExpandedState } from "@tanstack/table-core"
import { z } from "zod"

import { Grid } from "@/components/grid"
import { Section } from "@/components/section"
import Bookmarks from "@/components/widgets/bookmarks"

import CoursesEnrolmentsTable from "./-components/courses-enrolments-table"
import CoursesHeader from "./-components/courses-header"
import CoursesLastActive from "./-components/courses-last-active"
import CoursesNotes from "./-components/courses-notes"
import CoursesSchedule from "./-components/courses-schedule"

export const Route = createFileRoute("/_learner/communities/$id/courses/")({
  validateSearch: z.object({
    q: z.string().default(""),
    expanded: z.custom<ExpandedState>().default({}),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        q: "",
        expanded: {},
      }),
    ],
  },
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.communities.courses.all.queryOptions({
          communityId: params.id,
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.enrolments.all.queryOptions({
          query: {
            contentType: "digital,mixded",
            include: "completed",
            limit: 100,
          },
        })
      ),
      context.queryClient.ensureQueryData(
        context.trpc.people.me.queryOptions()
      ),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const courses = useSuspenseQuery(
    trpc.communities.courses.all.queryOptions({
      communityId: params.id,
    })
  )

  const enrolments = useSuspenseQuery(
    trpc.enrolments.all.queryOptions({
      query: {
        contentType: "digital,mixded",
        include: "completed",
        limit: 100,
      },
    })
  )

  const enrolmentDetails = useSuspenseQueries({
    queries: enrolments?.data?.enrolments
      .filter((x) => {
        if (x.publication?.type !== "course") return false
        if (courses?.data?.find((c) => c.publicationUid === x.publication?.uid))
          return true
        return false
      })
      ?.map((e) => ({
        ...trpc.enrolments.detail.queryOptions({
          params: {
            uid: e.uid,
          },
          query: {
            excludeMaterial: true,
          },
          addOns: {
            withActivity: true,
          },
        }),
      })),
  })

  const flatEnrolmentDetails = useMemo(() => {
    return enrolmentDetails?.map((e) => e.data)
  }, [enrolmentDetails])

  const activity = useMemo(() => {
    const activityObj = {
      flat: new Map<string, EnrolmentActivityType>(),
      detail: new Map<string, EnrolmentActivityType[]>(),
      progress: new Map<string, number>(),
    }

    if (
      !enrolmentDetails ||
      enrolmentDetails.length === 0 ||
      enrolmentDetails.some((q) => q.isLoading)
    )
      return activityObj

    enrolmentDetails?.forEach((e) => {
      activityObj.detail.set(e?.data?.uid, e?.data?.activity || [])
      const totalTrackableActivity = getTotalTrackableActivity(e?.data)
      const totalCompletedActivity =
        (e?.data?.activity || []).filter(
          (activity) =>
            (activity.type === "lesson" ||
              activity.type === "assessment" ||
              activity.type === "module" ||
              activity.type === "assignment") &&
            activity.status === "completed"
        ).length || 0

      const enrolmentProgress =
        totalCompletedActivity > 0
          ? Math.round((totalCompletedActivity / totalTrackableActivity) * 100)
          : 0

      activityObj.progress.set(
        e?.data?.uid,
        enrolmentProgress > 100 ? 100 : enrolmentProgress
      )

      e?.data?.activity?.forEach((activity) => {
        activityObj.flat.set(activity.typeUid, activity)
      })
    })
    return activityObj
  }, [enrolmentDetails])

  type tableParams = Pick<typeof search, "q" | "expanded">
  const updateTableFilters = (name: keyof tableParams, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value
    navigate({
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  return (
    <>
      <CoursesHeader activity={activity} />
      <div className="absolute inset-x-0 top-[calc(50vh-20px)] z-0 h-24 w-full rounded-t-20 bg-bg-white-0 drop-shadow-2xl"></div>
      <Section
        size="sm"
        spacer="p"
        className="gutter relative z-10 -mt-5 w-full rounded-t-20 bg-bg-white-0"
      >
        <Grid gap="none" className="w-full gap-6">
          <CoursesLastActive
            enrolments={flatEnrolmentDetails}
            activity={activity}
          />
          <div className="col-span-12 flex aspect-[1/2] flex-col gap-6 md:col-span-6 md:aspect-square xl:col-span-4">
            <Bookmarks
              identifierKey="enrolmentUid"
              identifiers={flatEnrolmentDetails?.map((e) => e?.uid)}
            />
            <CoursesNotes enrolments={flatEnrolmentDetails} />
          </div>

          <CoursesSchedule enrolments={flatEnrolmentDetails} />
          <CoursesEnrolmentsTable
            q={search.q}
            expanded={search.expanded}
            updateTableFilters={updateTableFilters}
            enrolments={flatEnrolmentDetails}
            activity={activity}
          />
        </Grid>
      </Section>
    </>
  )
}
