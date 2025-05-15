import React, { useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communityThreadSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { defineMeta, filterFn } from "@/utils/filters"
import { highlightText } from "@/utils/highlight-text"
import {
  RiAccountCircleLine,
  RiAddLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiForbidFill,
  RiHeading,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/table-core"
import { format } from "date-fns"
import { z } from "zod"

import { Avatar } from "@/components/ui/avatar"
import { Divider } from "@/components/ui/divider"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table } from "@/components/ui/table"
import { Section } from "@/components/section"
import TableFilters from "@/components/table-filters"

export const Route = createFileRoute("/_learner/communities/$id/threads/")({
  validateSearch: z.object({
    q: z.string().default(""),
  }),
  search: {
    middlewares: [stripSearchParams({ q: "" })],
  },
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.threads.queryOptions({
        communityId: params.id,
      })
    )
  },
  component: RouteComponent,
  pendingComponent: () => <ThreadsSkeleton />,
})

function RouteComponent() {
  const trpc = useTRPC()
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const threads = useSuspenseQuery(
    trpc.communities.threads.queryOptions({
      communityId: params.id,
    })
  )

  const updateTableFilters = (name: keyof typeof search, value: unknown) => {
    const newValue = typeof value === "function" ? value(search[name]) : value

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
    data: threads.data,
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
    onGlobalFilterChange: (updaterOrValue) =>
      updateTableFilters("q", updaterOrValue),
    state: {
      sorting,
      columnFilters,
      globalFilter: search.q,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <Section
      size="sm"
      spacer="p"
      className="mx-auto flex max-w-screen-lg flex-col gap-3 px-8 xl:px-0"
    >
      {threads?.data?.length === 0 ? (
        <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
          <h1 className="relative z-10 text-title-h4">No threads found</h1>
          <p className="relative z-10 text-label-sm font-light text-text-soft-400">
            Can't find what you're looking for? Make a new thread.
          </p>

          <RiAddLine
            className="absolute -top-24 right-24 z-0 rotate-[-20deg] text-text-soft-400 opacity-10"
            size={450}
          />
        </div>
      ) : (
        <>
          <h1 className="align-baseline text-title-h4">
            Threads{" "}
            <span className="text-label-sm font-light text-text-soft-400">
              ({threads?.data?.length || 0})
            </span>
          </h1>
          <Divider.Root />
          <div className="flex w-full flex-col gap-8">
            <div className="w-full rounded-[16px] bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200 drop-shadow-2xl">
              <div className="overflow-hidden rounded-xl ring-1 ring-stroke-soft-200 drop-shadow-xl">
                <div className="relative z-[1] rounded-xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 focus:outline-none">
                  <Input.Root size="medium">
                    <Input.Wrapper className="hover:[&:not(&:has(input:focus))]:bg-bg-white-0">
                      <Input.Field
                        value={search.q}
                        onChange={(e) => {
                          updateTableFilters("q", e.target.value)
                        }}
                        type="text"
                        placeholder="Search threads by title..."
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <div className="relative z-0 -mt-[9px] w-full bg-bg-weak-50 pt-[9px]">
                  <div className="flex w-full items-center justify-between gap-4 p-1.5">
                    <TableFilters table={table} />
                  </div>
                </div>
              </div>
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
                {table.getRowModel().rows?.length > 0 ? (
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
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={table.getAllColumns().length}>
                      <div className="gutter relative mt-4 flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-bg-weak-50 py-16">
                        <h1 className="relative z-10 text-title-h4">
                          No threads found
                        </h1>
                        <p className="relative z-10 text-label-sm font-light text-text-soft-400">
                          Can't find what you're looking for? Make a new thread.
                        </p>

                        <RiAddLine
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
      )}
    </Section>
  )
}

const columns: ColumnDef<z.infer<typeof communityThreadSchema>>[] = [
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Title",
      type: "text",
      icon: RiHeading,
    },
    cell: ({ row, getValue, table }) => {
      const value = getValue() as string
      const globalFilter = (table.getState().globalFilter || "").toLowerCase()
      const feature = row.original?.images?.find((x) => x.featured)
      return (
        <Link
          to="/communities/$id/threads/$threadId"
          params={{
            id: row.original?.communityId,
            threadId: row.original?.id,
          }}
          className="group flex items-center gap-2"
        >
          <Avatar.Root
            {...(!feature?.url && { color: "sky" })}
            placeholderType="company"
            size="32"
          >
            {feature?.url && <Avatar.Image src={feature?.url} />}
          </Avatar.Root>
          <span className="line-clamp-2 w-full max-w-56 text-paragraph-sm font-normal group-hover:text-primary-base group-hover:underline">
            {highlightText(value, globalFilter)}
          </span>
        </Link>
      )
    },
  },
  {
    id: "author",
    header: "Author",
    accessorKey: "author",
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.author, {
      displayName: "Author",
      type: "option",
      icon: RiAccountCircleLine,
      transformOptionFn: (u: any) => ({
        value: u.id,
        label: u.name,
        icon: (
          <Avatar.Root size="24">
            {u.avatarUrl ? (
              <Avatar.Image src={u.avatarUrl} />
            ) : (
              u.name
                .split(" ")
                .map((x: any) => x[0])
                .join("")
                .toUpperCase()
            )}
          </Avatar.Root>
        ),
      }),
    }),

    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Avatar.Root
            {...(!row.original?.author?.avatarUrl && { color: "sky" })}
            size="32"
          >
            {row.original?.author?.avatarUrl ? (
              <Avatar.Image src={row.original?.author?.avatarUrl} />
            ) : (
              row.original?.author?.name?.[0]
            )}
          </Avatar.Root>
          <span className="line-clamp-2 text-paragraph-sm font-normal">
            {row.original?.author?.name}
          </span>
        </div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    filterFn: filterFn("option"),
    meta: {
      displayName: "Status",
      type: "option",
      icon: RiCalendarLine,
      options: [
        {
          label: "Published",
          value: "published",
          icon: (
            <StatusBadge.Root status="completed" variant="light">
              <StatusBadge.Dot />
            </StatusBadge.Root>
          ),
        },
        {
          label: "Draft",
          value: "draft",
          icon: (
            <StatusBadge.Root status="pending" variant="light">
              <StatusBadge.Dot />
            </StatusBadge.Root>
          ),
        },
      ],
    },
    cell: ({ getValue, row }) => {
      const value = getValue() as string
      return (
        <div className="flex items-center gap-2">
          <StatusBadge.Root
            status={value === "published" ? "completed" : "pending"}
            className="capitalize"
            variant="light"
          >
            <StatusBadge.Dot />
            {value}
          </StatusBadge.Root>
          {value === "published" && (
            <span className="text-paragraph-sm font-normal text-text-soft-400">
              {format(row.original?.publishedAt, "MMM d, yyyy")}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "featured",
    header: "Featured",
    // accessorKey: "isFeatured",
    accessorFn: (row) => (row.isFeatured ? "yes" : "no"),
    filterFn: filterFn("option"),
    meta: {
      displayName: "Featured",
      type: "option",
      icon: RiStarFill,
      options: [
        {
          label: "Featured",
          value: "yes",
          icon: <RiCheckboxCircleFill className="fill-success-base" />,
        },
        {
          label: "Not Featured",
          value: "no",
          icon: <RiForbidFill className="fill-faded-base" />,
        },
      ],
    },
    cell: ({ getValue, row }) => {
      const value = getValue() as string
      if (value === "no") return null
      return (
        <div className="flex items-center gap-2">
          <StatusBadge.Root status="completed">
            <StatusBadge.Icon as={RiCheckboxCircleFill} />
            Featured{" "}
            {row.original?.isFeaturedUntil
              ? `Until: ${format(row.original?.isFeaturedUntil, "MMM d, yyyy")}`
              : ""}
          </StatusBadge.Root>
        </div>
      )
    },
  },
]

function ThreadsSkeleton() {
  return (
    <Section
      size="sm"
      spacer="p"
      className="mx-auto flex max-w-screen-lg flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <Input.Root size="medium">
          <Input.Wrapper>
            <Input.Field type="text" placeholder="Find a course..." />
          </Input.Wrapper>
        </Input.Root>
      </div>
      <div className="flex flex-col">
        <h2 className="text-label-md text-text-soft-400">Threads</h2>
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <li
              key={index}
              className="h-20 w-full animate-pulse rounded-xl bg-bg-soft-200"
            ></li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
