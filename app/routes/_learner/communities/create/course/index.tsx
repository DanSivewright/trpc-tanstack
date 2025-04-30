import React, { useEffect, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communitiesAllSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import { cn } from "@/utils/cn"
import { dateFormatter } from "@/utils/date-formatter"
import { defineMeta, filterFn } from "@/utils/filters"
import {
  RiAccountCircleLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiFileTextLine,
  RiGlobalLine,
  RiLoaderLine,
  RiPriceTag3Line,
  RiUserLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
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
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Badge } from "@/components/ui/badge"
import { FancyButton } from "@/components/ui/fancy-button"
import { Table } from "@/components/ui/table"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"
import TableFilters from "@/components/table-filters"

export const Route = createFileRoute("/_learner/communities/create/course/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.adminOf.queryOptions()
    )
    return {
      step: "community",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const communities = useSuspenseQuery(trpc.communities.adminOf.queryOptions())
  const { step } = Route.useLoaderData()
  const { notification } = useNotification()
  const navigate = useNavigate()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])

  const authors = useMemo(() => {
    return communities.data?.map((x) => x.author) || []
  }, [communities.data])

  const columns = useMemo<
    ColumnDef<z.infer<typeof communitiesAllSchema>[number]>[]
  >(
    () => [
      {
        id: "name",
        accessorKey: "name",
        filterFn: filterFn("text"),
        header: "Name",
        meta: {
          displayName: "Name",
          type: "text",
          icon: RiGlobalLine,
        },
        cell: ({ row, getValue }) => {
          const value = getValue() as string
          const logo = row.original.images?.find((x) => x.logo)
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
              <Avatar.Root {...(!logo?.url && { color: "sky" })} size="32">
                {logo?.url ? (
                  <Avatar.Image src={logo.url} />
                ) : (
                  value
                    .split(" ")
                    .filter((_, i) => i < 2)
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
        id: "members",
        accessorKey: "members",
        header: "Members",
        filterFn: filterFn("multiOption"),
        // @ts-ignore
        meta: defineMeta((row) => row.members, {
          displayName: "Members",
          type: "multiOption",
          icon: RiAccountCircleLine,
          transformOptionFn: (u) => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName}`,
            icon: (
              <Avatar.Root size="24">
                {u.avatarUrl ? (
                  <Avatar.Image src={u.avatarUrl} />
                ) : (
                  u.firstName?.[0]
                )}
              </Avatar.Root>
            ),
          }),
        }),
        cell: ({ getValue }) => {
          const members = getValue() as z.infer<
            typeof communitiesAllSchema
          >[number]["members"]
          if (members && members?.length > 0) {
            return (
              <AvatarGroupCompact.Root size="24" variant="stroke">
                <AvatarGroupCompact.Stack>
                  {members.slice(0, 3).map((m) => (
                    <Avatar.Root {...(!m?.avatarUrl && { color: "sky" })}>
                      {m?.avatarUrl ? (
                        <Avatar.Image src={m?.avatarUrl} />
                      ) : (
                        m?.firstName?.[0]
                      )}
                    </Avatar.Root>
                  ))}
                </AvatarGroupCompact.Stack>
                {members.length > 3 && (
                  <AvatarGroupCompact.Overflow>
                    {`+${members.length - 3}`}
                  </AvatarGroupCompact.Overflow>
                )}
              </AvatarGroupCompact.Root>
            )
          }
          return (
            <Button.Root variant="neutral" mode="ghost" size="xxsmall">
              <Button.Icon as={RiAccountCircleLine} />
              None
            </Button.Root>
          )
        },
      },
      {
        id: "articles",
        accessorKey: "articlesCount",
        header: "Articles",
        meta: {
          displayName: "Articles",
          type: "number",
          icon: RiFileTextLine,
        },
        cell: ({ getValue }) => {
          const value = getValue() as number
          return <span className="text-paragraph-sm font-normal">{value}</span>
        },
      },
      {
        id: "tags",
        accessorKey: "tags",
        header: "Tags",
        filterFn: filterFn("multiOption"),
        // @ts-ignore
        meta: defineMeta((row) => row.tags, {
          displayName: "Tags",
          type: "multiOption",
          icon: RiPriceTag3Line,
          transformOptionFn: (opts) => {
            return {
              value: opts,
              label: opts,
              icon: RiPriceTag3Line,
            }
          },
        }),
        cell: ({ getValue }) => {
          const value = getValue() as string[]
          return (
            <div className="flex items-center gap-1">
              {value.slice(0, 2).map((tag) => (
                <Badge.Root size="small" variant="lighter" key={tag}>
                  {tag}
                </Badge.Root>
              ))}
              {value.length > 2 && (
                <Badge.Root size="small" variant="lighter">
                  +{value.length - 2}
                </Badge.Root>
              )}
            </div>
          )
        },
      },
      {
        id: "author",
        accessorKey: "authorUid",
        filterFn: filterFn("multiOption"),
        header: "Created By",
        // @ts-ignore
        meta: defineMeta((row) => row.authorUid, {
          displayName: "Created By",
          type: "multiOption",
          icon: RiUserLine,
          transformOptionFn: (opts) => {
            const author = authors.find((x) => x.uid === opts)
            return {
              value: author?.uid || "",
              label: `${author?.firstName} ${author?.lastName}`,
              icon: (
                <Avatar.Root size="24">
                  {author?.avatarUrl ? (
                    <Avatar.Image src={author.avatarUrl} />
                  ) : (
                    author?.firstName?.[0]
                  )}
                </Avatar.Root>
              ),
            }
          },
        }),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Avatar.Root
                {...(!row.original?.author.avatarUrl && { color: "sky" })}
                size="32"
              >
                {row.original?.author.avatarUrl ? (
                  <Avatar.Image src={row.original?.author.avatarUrl} />
                ) : (
                  row.original?.author.firstName?.[0]
                )}
              </Avatar.Root>
              <div className="flex flex-col">
                <span className="text-paragraph-sm font-normal">
                  {row.original?.author.firstName}{" "}
                  {row.original?.author.lastName}
                </span>
                <span className="text-paragraph-xs text-text-soft-400">
                  {row.original?.author.email}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        filterFn: filterFn("date"),
        header: "Created At",
        meta: {
          displayName: "Created At",
          type: "date",
          icon: RiCalendarLine,
        },
        cell: ({ getValue }) => {
          const value = getValue() as string

          return (
            <div className="flex items-center gap-2 *:text-text-sub-600">
              <RiCalendarLine className="size-4" />
              <span className="text-paragraph-sm font-normal">
                {value ? dateFormatter(value) : "None"}
              </span>
            </div>
          )
        },
      },
    ],
    [authors]
  )

  const table = useReactTable({
    data: communities.data,
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    debugTable: true,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  const form = useForm({
    defaultValues: {
      communityIds: [] as string[],
    },

    onSubmit: (data) => {
      console.log("data:::", data)
      if (data.value.communityIds.length === 0) {
        notification({
          title: "Select a community",
          description: "Please select at least one community to continue",
          variant: "filled",
          status: "error",
        })
        return
      }
      navigate({
        to: "/communities/create/course/select-courses",
        search: { communityIds: data.value.communityIds },
      })
    },
  })

  useEffect(() => {
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)

    form.setFieldValue(
      "communityIds",
      selectedData?.map((c) => c.id)
    )
  }, [rowSelection, table])

  return (
    <>
      <div className="gutter mx-auto flex h-[calc(100dvh-93px)] w-full max-w-screen-xl flex-col gap-2 pt-8 2xl:px-0">
        <h1 className="text-title-h6 font-normal">
          Select the communities you want to add courses to
        </h1>
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
      </div>
      <footer className="dark:bg-gray-950/80 gutter fixed inset-x-0 bottom-0 border-t border-bg-soft-200 bg-white/80 backdrop-blur-sm 2xl:px-0">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
          <span></span>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex items-center gap-4"
          >
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <FancyButton.Root
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Next
                  <FancyButton.Icon
                    className={cn(isSubmitting && "animate-spin")}
                    as={isSubmitting ? RiLoaderLine : RiArrowRightSLine}
                  />
                </FancyButton.Root>
              )}
            />
          </form>
        </div>
      </footer>
    </>
  )
}
