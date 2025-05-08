import React, { Suspense, useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { ContentEnrolmentsSchema } from "@/integrations/trpc/routers/content/schemas/content-enrolments-schema"
import { filterFn } from "@/utils/filters"
import {
  RiAccountCircleLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiHeading,
  RiUserForbidLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/table-core"
import { format } from "date-fns"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Table } from "@/components/ui/table"
import TableFilters from "@/components/table-filters"

export const Route = createFileRoute(
  "/_learner/communities/$id/courses/$courseId/enrolments"
)({
  validateSearch: z.object({
    type: z.string(),
    typeUid: z.string(),
    columnFilters: z.custom<ColumnFiltersState>().default([]).optional(),
    globalFilter: z.string().default("").optional(),
    columnVisibility: z.custom<VisibilityState>().default({}).optional(),
    rowSelection: z.custom<RowSelectionState>().default({}).optional(),
    sorting: z.custom<SortingState>().default([]).optional(),
  }),
  loaderDeps: ({ search }) => ({
    type: search.type,
    typeUid: search.typeUid,
  }),
  loader: async ({ context, deps, params }) => {
    context.queryClient.prefetchQuery(
      context.trpc.content.enrolments.queryOptions({
        params: {
          type: deps.type,
          typeUid: deps.typeUid,
        },
        query: {
          page: 1,
          limit: 10,
        },
      })
    )
    context.queryClient.ensureQueryData(
      context.trpc.communities.courseDetail.queryOptions({
        communityId: params.id,
        courseId: params.courseId,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnrolmentsTable />
    </Suspense>
  )
}

function EnrolmentsTable() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const { type, typeUid, ...rest } = Route.useSearch()
  const navigate = Route.useNavigate()

  const course = useSuspenseQuery(
    trpc.communities.courseDetail.queryOptions({
      communityId: params.id,
      courseId: params.courseId,
    })
  )

  const enrolments = useSuspenseQuery(
    trpc.content.enrolments.queryOptions({
      params: { type, typeUid },
      query: {
        page: 1,
        limit: 100,
      },
    })
  )

  const currentStateOptions = [
    {
      value: "not-started",
      label: "Not Started",
      icon: <span className="size-2 rounded-full bg-away-base"></span>,
    },
    {
      value: "in-progress",
      label: "In Progress",
      icon: <span className="size-2 rounded-full bg-information-base"></span>,
    },
    {
      value: "completed",
      label: "Completed",
      icon: <span className="size-2 rounded-full bg-success-base"></span>,
    },
    {
      value: "failed",
      label: "Failed",
      icon: <span className="size-2 rounded-full bg-error-base"></span>,
    },
  ]
  const columns = useMemo<
    ColumnDef<z.infer<typeof ContentEnrolmentsSchema>[number]>[]
  >(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.person?.firstName + " " + row.person?.lastName,
        header: "Name",
        filterFn: filterFn("text"),
        meta: {
          displayName: "Name",
          type: "text",
          icon: RiHeading,
        },
        cell: ({ getValue }) => {
          const value = getValue() as string

          return <span className="text-paragraph-sm font-normal">{value}</span>
        },
      },
      {
        id: "member",
        accessorFn: (row) =>
          course?.data?.enrolments?.find((e) => e.enrolleeUid === row.personUid)
            ? "Member"
            : "Not Member",
        filterFn: filterFn("option"),
        meta: {
          displayName: "Membership",
          type: "option",
          icon: RiAccountCircleLine,
          options: [
            {
              value: "Member",
              label: "Member",
              icon: RiAccountCircleLine,
            },
            {
              value: "Not Member",
              label: "Not Member",
              icon: RiUserForbidLine,
            },
          ],
        },
        header: "Membership",
        cell: ({ getValue }) => {
          const value = getValue() as string

          if (value === "Not Member") {
            return null
          } else {
            return (
              <Badge.Root color="blue" variant="light" className="capitalize">
                {value}
              </Badge.Root>
            )
          }
        },
      },
      {
        id: "currentState",
        accessorFn: (row) => row.currentState,
        header: "Current State",
        filterFn: filterFn("option"),
        meta: {
          displayName: "Current State",
          type: "option",
          icon: RiCheckboxCircleLine,
          options: currentStateOptions,
        },
        cell: ({ getValue }) => {
          const value = getValue() as string
          const option = currentStateOptions.find((x) => x.value === value)
          return (
            <div className="flex items-center gap-2">
              {option?.icon}
              <span className="text-paragraph-sm font-normal">
                {option?.label}
              </span>
            </div>
          )
        },
      },
      {
        id: "enrolledAt",
        accessorKey: "createdAt",
        header: "Enrolled At",
        filterFn: filterFn("date"),
        meta: {
          displayName: "Enrolled At",
          type: "date",
          icon: RiCalendarLine,
        },
        cell: ({ getValue }) => {
          const value = getValue() as string
          return (
            <span className="text-paragraph-sm font-normal">
              {format(new Date(value), "dd/MM/yyyy")}
            </span>
          )
        },
      },
      {
        id: "completedAt",
        accessorKey: "completedAt",
        header: "Completed At",
        filterFn: filterFn("date"),
        meta: {
          displayName: "Completed At",
          type: "date",
          icon: RiCalendarLine,
        },
        cell: ({ getValue }) => {
          const value = getValue() as string
          if (!value) return null
          return (
            <span className="text-paragraph-sm font-normal">
              {format(new Date(value), "dd/MM/yyyy")}
            </span>
          )
        },
      },
    ],
    [course?.data?.enrolments, currentStateOptions]
  )

  const updateTableFilters = (name: keyof typeof rest, value: unknown) => {
    const newValue = typeof value === "function" ? value(rest[name]) : value

    console.log("filt", {
      name,
      newValue,
    })
    navigate({
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  const table = useReactTable({
    columns,
    data: enrolments?.data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: (updaterOrValue) =>
      updateTableFilters("sorting", updaterOrValue),
    onColumnFiltersChange: (updaterOrValue) =>
      updateTableFilters("columnFilters", updaterOrValue),
    onColumnVisibilityChange: (updaterOrValue) =>
      updateTableFilters("columnVisibility", updaterOrValue),
    enableRowSelection: true,
    onRowSelectionChange: (updaterOrValue) =>
      updateTableFilters("rowSelection", updaterOrValue),
    onGlobalFilterChange: (updaterOrValue) =>
      updateTableFilters("globalFilter", updaterOrValue),
    debugTable: true,
    state: {
      ...rest,
    },
  })

  return (
    <>
      <div className="flex items-center gap-2 pb-2">
        <TableFilters table={table} />
      </div>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Table.Head>
                )
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows?.length > 0 &&
            table.getRowModel().rows.map((row, i, arr) => (
              <React.Fragment key={row.id}>
                <Table.Row data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
                {i < arr.length - 1 && <Table.RowDivider />}
              </React.Fragment>
            ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}
