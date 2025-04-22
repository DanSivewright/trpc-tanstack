import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { PeopleAllSchema } from "@/integrations/trpc/routers/people/schemas/people-all-schema"
import { cn } from "@/utils/cn"
import { filterFn } from "@/utils/filters"
import { RiUserLine } from "@remixicon/react"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
  type RowSelectionState,
  type SortingFn,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { ColumnDef, Row } from "@tanstack/table-core"
import type { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { useNotification } from "@/hooks/use-notification"
import * as Avatar from "@/components/ui/avatar"
import * as Table from "@/components/ui/table"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"
import { Section } from "@/components/section"
import TableFilters from "@/components/table-filters"

const LIMIT = 2

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/community/$id/members"
)({
  loader: async ({ context, params: { id } }) => {
    await Promise.all([
      await context.queryClient.ensureQueryData(
        context.trpc.communities.detail.queryOptions({
          id,
        })
      ),
      await context.queryClient.prefetchInfiniteQuery(
        context.trpc.people.all.infiniteQueryOptions({
          query: {
            limit: LIMIT,
          },
        })
      ),
    ])

    return {
      step: "members",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { notification } = useNotification()
  const navigate = useNavigate()
  const { step } = Route.useLoaderData()

  const qc = useQueryClient()
  const trpc = useTRPC()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const people = useInfiniteQuery({
    ...trpc.people.all.infiniteQueryOptions({
      query: {
        limit: LIMIT,
      },
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  const { fetchNextPage, isFetching, isLoading } = people

  const flatData = useMemo(
    () => people?.data?.pages?.flatMap((page) => page.data?.people) ?? [],
    [people?.data]
  )
  const totalDBRowCount = people?.data?.pages?.[0]?.data?.totalPeople ?? 0
  const totalFetched = flatData.length

  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    // data: people.data?.people ?? [],
    data: flatData || [],
    columns: PeopleColumns,
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

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  )

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 70, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  const headingSize = useElementSize()
  const containerHeight = useMemo(() => {
    return `calc(100dvh - 32px - ${headingSize.height}px)`
  }, [headingSize.height])

  return (
    <>
      <div
        className="gutter mx-auto flex h-[calc(100dvh-93px)] w-full max-w-screen-xl flex-col gap-2 pt-8 2xl:px-0"

        // className="h-[calc(100dvh-93px)] max-h-[calc(100dvh-93px)] w-screen justify-center overflow-x-hidden overflow-y-scroll pt-12 lg:pt-[20dvh]"
      >
        <h1 className="text-title-h6 font-normal" ref={headingSize.ref}>
          Add people from your company and jump start your community
        </h1>
        <div
          style={{
            height: containerHeight,
          }}
          onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
          ref={tableContainerRef}
          className="relative flex w-full flex-col gap-2"
        >
          {/* <TableFilters table={table} /> */}
          <Table.Root
            style={{
              display: "grid",
              // width: "100%",
            }}
          >
            <Table.Header
              style={{
                display: "grid",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row className="flex w-full" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Table.Head className="flex grow" key={header.id}>
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
            <Table.Body
              style={{
                display: "grid",
                height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                position: "relative",
                width: "100%",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((vr) => {
                const row = rows[vr.index] as Row<
                  z.infer<typeof PeopleAllSchema>["people"][number]
                >
                return (
                  <React.Fragment key={row.id}>
                    <Table.Row
                      data-index={vr.index} //needed for dynamic row height measurement
                      ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                      style={{
                        position: "absolute",
                        transform: `translateY(${vr.start}px)`, //this should always be a `style` as it changes on scroll
                        width: "100%",
                      }}
                      data-state={row.getIsSelected() && "selected"}
                      className="flex flex-1 items-center"
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <Table.Cell
                          className={cn("flex grow", {
                            "max-w-1/2 bg-blue-50": cellIndex === 0,
                            "grow bg-pink-50": cellIndex !== 0,
                          })}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                    {vr.index < rows.length - 1 && <Table.RowDivider />}
                  </React.Fragment>
                )
              })}
              {/* {table.getRowModel().rows?.length > 0 &&
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
                ))} */}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </>
  )
}

const PeopleColumns: ColumnDef<
  z.infer<typeof PeopleAllSchema>["people"][number]
>[] = [
  {
    id: "name",
    accessorFn: (row) => row.person.firstName + " " + row.person.lastName,
    header: "Name",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Name",
      type: "text",
      icon: RiUserLine,
    },
    cell: ({ row, getValue }) => {
      const value = getValue() as string
      return (
        <div className="flex items-center gap-2">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onCheckedChange: row.getToggleSelectedHandler(),
            }}
          />
          <Avatar.Root
            {...(!row.original.person.imageUrl && { color: "sky" })}
            size="32"
          >
            {row.original.person.imageUrl ? (
              <Avatar.Image src={row.original.person.imageUrl} />
            ) : (
              value
                .split(" ")
                .map((name) => name[0])
                .join("")
            )}
          </Avatar.Root>
          <span className="text-paragraph-sm font-normal">{value}</span>
        </div>
      )
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => {
      const value = getValue() as string
      return <span className="text-paragraph-sm font-normal">{value}</span>
    },
  },
]
