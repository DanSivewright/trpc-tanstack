import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
} from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentActivityType } from "@/integrations/trpc/routers/enrolments/schemas/enrolment-activity-schema"
import type { EnrolmentSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { cn } from "@/utils/cn"
import {
  enrolmentColumns,
  formatEnrolment,
  formatModule,
} from "@/utils/format-table-enrolments"
import { getTotalTrackableActivity } from "@/utils/get-total-trackable-activity"
import {
  RiArrowRightSLine,
  RiFilterLine,
  RiSearchLine,
  RiSortDesc,
} from "@remixicon/react"
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TableType,
  type VisibilityState,
} from "@tanstack/react-table"
import type { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"

type Props = {
  enrolments: z.infer<typeof EnrolmentsDetailSchema>[]
  activity: {
    flat: Map<string, EnrolmentActivityType>
    detail: Map<string, EnrolmentActivityType[]>
    progress: Map<string, number>
  }
}
const CoursesEnrolmentsTable: React.FC<Props> = ({ enrolments, activity }) => {
  const trpc = useTRPC()

  const me = useSuspenseQuery(trpc.people.me.queryOptions())

  const data = useMemo(
    () => enrolments.map((enrolment) => formatEnrolment(enrolment, activity)),
    [enrolments, activity.flat]
  )

  return (
    <section className="col-span-12 flex flex-col gap-6">
      <Breadcrumb.Root>
        <Breadcrumb.Item>
          <Avatar.Root size="20">
            {me?.data?.imageUrl ? (
              <Avatar.Image src={me?.data?.imageUrl} />
            ) : (
              me?.data?.firstName?.[0]
            )}
          </Avatar.Root>
          <span>Learning</span>
        </Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
        <Breadcrumb.Item>Courses</Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
        <Breadcrumb.Item active>
          The Power of Minimalism in Design
        </Breadcrumb.Item>
      </Breadcrumb.Root>
      <EnrolmentTable
        columns={enrolmentColumns}
        data={data}
        getSubRows={(row) => row.subRows}
        getRowCanExpand={(row) => row.subRows !== undefined}
      />
    </section>
  )
}

const getCommonPinningStyles = (
  column: Column<z.infer<typeof EnrolmentSchema>>
): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px gray inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

type EnrolmentTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getSubRows?:
    | ((originalRow: TData, index: number) => TData[] | undefined)
    | undefined
  getRowCanExpand?: ((row: Row<TData>) => boolean) | undefined
  setTable?: Dispatch<React.SetStateAction<TableType<TData> | undefined>>
}
function EnrolmentTable<TData, TValue>({
  columns,
  data,
  getSubRows,
  getRowCanExpand,
  setTable,
}: EnrolmentTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const search = useSearch({
    from: "/_learner/communities/$id/courses/",
  })
  const navigate = useNavigate({
    from: "/communities/$id/courses",
  })

  const updateTableFilters = (name: keyof typeof search, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value
    navigate({
      to: "/communities/$id/courses",
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSubRows,
    getRowCanExpand,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: (updaterOrValue) =>
      updateTableFilters("expanded", updaterOrValue),
    onGlobalFilterChange: (updaterOrValue) =>
      updateTableFilters("q", updaterOrValue),
    state: {
      sorting,
      columnFilters,
      globalFilter: search.q,
      columnVisibility,
      rowSelection,
      expanded: search.expanded,
    },
    debugTable: true,
  })

  useEffect(() => {
    if (setTable) {
      setTable(table)
    }
  }, [table, setTable])

  return (
    <>
      <div className="flex items-center gap-2">
        <Input.Root className="max-w-[400px]" size="xsmall">
          <Input.Wrapper>
            <Input.Icon as={RiSearchLine} />
            <Input.Field
              value={search.q}
              onChange={(e) => {
                updateTableFilters("q", e.target.value)
              }}
              type="text"
              placeholder="Search"
            />
          </Input.Wrapper>
        </Input.Root>
        <Button.Root size="xsmall" variant="neutral" mode="stroke">
          <Button.Icon as={RiFilterLine} />
          Filters
        </Button.Root>
        <Button.Root size="xsmall" variant="neutral" mode="stroke">
          <Button.Icon as={RiSortDesc} />
          Sort by
        </Button.Root>
      </div>
      <div className="no-scrollbar w-full max-w-full overflow-x-auto">
        <Table.Root
          {...{
            style: {
              width: table.getCenterTotalSize(),
            },
          }}
        >
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.Head
                      colSpan={header.colSpan}
                      className="sticky left-0 z-10"
                      key={header.id}
                    >
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
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex, arr) => (
                <React.Fragment key={row.id}>
                  <Table.Row data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <Table.Cell
                        className={cn(
                          "relative h-9 w-full items-center bg-bg-white-0 py-0",
                          {
                            "first:rounded-none first:border-l-4 first:border-primary-base last:rounded-none":
                              row.getIsExpanded() || row?.depth > 0,
                            "bg-bg-weak-50": row?.depth > 0,
                            // "bg-bg-weak-50":
                            //   row.getIsExpanded() && row?.depth === 0,
                            // "bg-bg-soft-200/80 group-hover/row:bg-bg-soft-200":
                            //   (row.getIsExpanded() && row?.depth === 1) ||
                            //   row?.depth === 1,
                            // "bg-bg-sub-300/60 group-hover/row:bg-bg-sub-300/70":
                            //   row?.depth === 2,
                          }
                        )}
                        style={{
                          ...getCommonPinningStyles(cell.column as any),
                        }}
                        key={cell.id}
                      >
                        {cellIndex === 0 &&
                          row.depth === 1 &&
                          row?.getIsExpanded() && (
                            <span className="absolute inset-y-0 left-0 w-1 bg-success-base"></span>
                          )}
                        {cellIndex === 0 && row?.depth === 2 && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-success-base"></span>
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                </React.Fragment>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={table.getAllColumns().length}>
                  <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
                    <h1 className="relative z-10 text-title-h4">
                      No learning found
                    </h1>
                    <p className="relative z-10 text-label-sm font-light text-text-soft-400">
                      Can't find what you're looking for?
                    </p>
                    <RiSearchLine
                      className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
                      size={450}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </>
  )
}

export default CoursesEnrolmentsTable
