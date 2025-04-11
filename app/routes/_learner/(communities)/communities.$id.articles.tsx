import React, { useState } from "react"
import { cn } from "@/utils/cn"
import { defineMeta, filterFn } from "@/utils/filters"
import {
  RiAccountCircleLine,
  RiCalendarCheckLine,
  RiCircleLine,
  RiClockwiseLine,
  RiDonutChartLine,
  RiH1,
  RiPriceTagLine,
} from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { z } from "zod"

import * as Avatar from "@/components/ui/avatar"
import * as Table from "@/components/ui/table"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"
import { Section } from "@/components/section"
import TableFilters from "@/components/table-filters"

import { issues } from "./-components/data"
import {
  issueLabels,
  issueStatuses,
  labelStyles,
  labelStylesBg,
  type Issue,
  type IssueLabel,
  type User,
} from "./-components/types"

const dataTableFilterQuerySchema = z
  .object({
    id: z.string(),
    value: z.object({
      operator: z.string(),
      values: z.any(),
    }),
  })
  .array()
  .min(0)
export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/articles"
)({
  validateSearch: dataTableFilterQuerySchema,
  loader: () => ({
    leaf: "Articles",
  }),
  component: RouteComponent,
})

const columnHelper = createColumnHelper<Issue>()
export const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <IndeterminateCheckbox
      // {...{
      //   checked: table.getIsAllRowsSelected(),
      //   indeterminate: table.getIsSomeRowsSelected(),
      //   onChange: table.getToggleAllRowsSelectedHandler(),
      // }}
      />
      // <Checkbox
      //   checked={
      //     table.getIsAllPageRowsSelected() ||
      //     (table.getIsSomePageRowsSelected() && "indeterminate")
      //   }
      //   onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      //   aria-label="Select all"
      // />
    ),
    cell: ({ row }) => (
      <IndeterminateCheckbox
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onCheckedChange: row.getToggleSelectedHandler(),
        }}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = issueStatuses.find(
        (x) => x.value === row.getValue("status")
      )!

      const StatusIcon = status.icon

      return (
        <div className="flex items-center gap-2">
          <StatusIcon className="size-4" />
          <span>{status.name}</span>
        </div>
      )
    },
    filterFn: filterFn("option"),
    meta: {
      displayName: "Status",
      type: "option",
      icon: RiCircleLine,
      // icon: CircleDotDashedIcon,
      options: issueStatuses.map((x) => ({ ...x, label: x.name })),
    },
  }),
  columnHelper.accessor("title", {
    id: "title",
    header: "Title",
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
    meta: {
      displayName: "Title",
      type: "text",
      icon: RiH1,
    },
    filterFn: filterFn("text"),
  }),
  columnHelper.accessor("assignee", {
    id: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.getValue<User | undefined>("assignee")
      if (!assignee) {
        return <RiDonutChartLine className="text-border size-5" />
      }

      const initials = assignee.name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .toUpperCase()

      return (
        <Avatar.Root size="24">
          {assignee.picture ? (
            <Avatar.Image src={assignee.picture} />
          ) : (
            initials
          )}
        </Avatar.Root>
      )
    },
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.assignee, {
      displayName: "Assignee",
      type: "option",
      icon: RiAccountCircleLine,
      transformOptionFn: (u) => ({
        value: u.id,
        label: u.name,
        icon: (
          <Avatar.Root size="24">
            {u.picture ? (
              <Avatar.Image src={u.picture} />
            ) : (
              u.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .toUpperCase()
            )}
          </Avatar.Root>
        ),
      }),
    }),
  }),
  columnHelper.accessor((row) => row.assignee?.name, {
    id: "assigneeName",
    header: "Assignee (Name)",
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.assignee?.name, {
      displayName: "Assignee name",
      type: "option",
      icon: RiAccountCircleLine,
      transformOptionFn: (name) => ({
        value: name,
        label: name,
      }),
    }),
  }),
  columnHelper.accessor("labelIds", {
    id: "labels",
    header: "Labels",
    filterFn: filterFn("multiOption"),
    cell: ({ row }) => {
      const labelIds = row.getValue<string[]>("labels")

      if (!labelIds) {
        return null
      }

      const labels = labelIds
        .map((labelId) => issueLabels.find((l) => l.value === labelId))
        .filter((l): l is IssueLabel => !!l)

      return (
        <div className="flex items-center gap-x-2">
          {labels.map((label) => (
            <span key={label.value} className={cn(labelStyles[label.color])}>
              badge: {label.name}
            </span>
          ))}
        </div>
      )
    },
    meta: defineMeta((row) => row.labelIds, {
      displayName: "Labels",
      type: "multiOption",
      icon: RiPriceTagLine,
      options: issueLabels.map((x) => ({
        ...x,
        label: x.name,
        icon: (
          <div className={cn("size-2 rounded-full", labelStylesBg[x.color])} />
        ),
      })),
    }),
  }),
  columnHelper.accessor("estimatedHours", {
    id: "estimatedHours",
    header: "Estimated Hours",
    cell: ({ row }) => {
      const estimatedHours = row.getValue<number>("estimatedHours")

      if (!estimatedHours) {
        return null
      }

      return (
        <span>
          <span className="tabular-nums tracking-tighter">
            {estimatedHours}
          </span>
          <span className="text-muted-foreground ml-0.5">h</span>
        </span>
      )
    },
    meta: {
      displayName: "Estimated Hours",
      type: "number",
      icon: RiClockwiseLine,
      max: 100,
    },
    filterFn: filterFn("number"),
  }),
  columnHelper.accessor("startDate", {
    id: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.getValue<Issue["startDate"]>("startDate")

      if (!startDate) {
        return null
      }

      const formatted = format(startDate, "MMM dd")

      return <span>{formatted}</span>
    },
    meta: {
      displayName: "Start Date",
      type: "date",
      icon: RiCalendarCheckLine,
    },
    filterFn: filterFn("date"),
  }),
  columnHelper.accessor("endDate", {
    id: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.getValue<Issue["endDate"]>("endDate")

      if (!endDate) {
        return null
      }

      const formatted = format(endDate, "MMM dd")

      return <span>{formatted}</span>
    },
    meta: {
      displayName: "End Date",
      type: "date",
      icon: RiCalendarCheckLine,
    },
    filterFn: filterFn("date"),
  }),
]

function initializeFiltersFromQuery<TData, TValue>(
  filters: z.infer<typeof dataTableFilterQuerySchema>,
  columns: ColumnDef<TData, TValue>[]
) {
  return filters && filters.length > 0
    ? filters.map((f) => {
        const columnMeta = columns.find((c) => c.id === f.id)!.meta!

        const values =
          columnMeta.type === "date"
            ? f.value.values.map((v: string) => new Date(v))
            : f.value.values

        return {
          ...f,
          value: {
            operator: f.value.operator,
            values,
            columnMeta,
          },
        }
      })
    : []
}

function RouteComponent() {
  const queryFilters = Route.useSearch()
  // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
  //   initializeFiltersFromQuery(queryFilters, columns as ColumnDef<Issue>[])
  // )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: issues,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  // useEffect(() => {
  //   setQueryFilters(
  //     columnFilters.map((f) => ({
  //       id: f.id,
  //       // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  //       value: { ...(f.value as any), columnMeta: undefined },
  //     })),
  //   )
  // }, [columnFilters, setQueryFilters])

  return (
    <Section side="b" className="w-full flex-col px-3">
      <div className="flex items-center gap-2 py-4">
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
    </Section>
  )
}
