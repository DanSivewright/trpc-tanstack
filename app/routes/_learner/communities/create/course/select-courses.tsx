import React, { useEffect, useMemo } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { ContentAllSchema } from "@/integrations/trpc/routers/content/schemas/content-all-schema"
import { cn } from "@/utils/cn"
import { filterFn } from "@/utils/filters"
import {
  RiArrowRightSLine,
  RiBookOpenLine,
  RiHashtag,
  RiHeading,
  RiLoaderLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Avatar } from "@/components/ui/avatar"
import { FancyButton } from "@/components/ui/fancy-button"
import { Table } from "@/components/ui/table"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"
import { Section } from "@/components/section"
import TableFilters from "@/components/table-filters"

const searchSchema = z.object({
  communityIds: z
    .array(z.string())
    .min(1, "Please select at least one community"),
  columnFilters: z.custom<ColumnFiltersState>().default([]).optional(),
  globalFilter: z.string().default("").optional(),
  columnVisibility: z.custom<VisibilityState>().default({}).optional(),
  rowSelection: z.custom<RowSelectionState>().default({}).optional(),
  sorting: z.custom<SortingState>().default([]).optional(),
})

export const Route = createFileRoute(
  "/_learner/communities/create/course/select-courses"
)({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (!search.communityIds?.length) {
      throw redirect({
        to: "/communities/create/course",
      })
    }
  },
  loaderDeps: ({ search }) => ({
    communityIds: search.communityIds,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.content.all.queryOptions({
          query: {
            status: "published",
          },
        })
      ),
      ...deps.communityIds.map((id) =>
        context.queryClient.ensureQueryData(
          context.trpc.communities.detail.queryOptions({ id })
        )
      ),
    ])
    return {
      step: "courses",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { communityIds, ...rest } = Route.useSearch()

  const navigate = useNavigate()
  const { notification } = useNotification()

  // const communities = useSuspenseQueries({
  //   queries: communityIds.map((id) =>
  //     trpc.communities.detail.queryOptions({ id })
  //   ),
  // })
  const content = useSuspenseQuery(
    trpc.content.all.queryOptions({
      query: {
        status: "published",
      },
    })
  )
  const contentWithOutModules = useMemo(() => {
    return content?.data?.filter((x) => x.kind !== "module")
  }, [content?.data])

  const updateTableFilters = (name: keyof typeof rest, value: unknown) => {
    const newValue = typeof value === "function" ? value(rest[name]) : value

    navigate({
      // @ts-ignore
      search: (prev) => ({
        ...prev,
        [name]: newValue,
      }),
    })
  }

  const table = useReactTable({
    columns,
    data: contentWithOutModules || [],
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

  const form = useForm({
    defaultValues: {
      content: [] as {
        type: string
        typeUid: string
      }[],
    },
    onSubmit: (data) => {
      if (data.value.content.length === 0) {
        notification({
          title: "Select a course",
          description: "Please select at least one course to continue",
          variant: "filled",
          status: "error",
        })
        return
      }
      navigate({
        to: "/communities/create/course/enrolments",
        search: {
          communityIds,
          content: data.value.content,
        },
      })
    },
  })

  useEffect(() => {
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)

    form.setFieldValue(
      "content",
      selectedData?.map((c) => ({
        type: c.kind,
        typeUid: c.uid,
      }))
    )
  }, [rest.rowSelection, table])

  return (
    <>
      <Section
        side="b"
        className="gutter mx-auto flex w-full max-w-screen-xl flex-col gap-2 pt-8 2xl:px-0"
      >
        <h1 className="text-title-h6 font-normal">
          Select the courses you want to add to the communities
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
      </Section>
      <footer className="bg-bg-white-0/80backdrop-blur-sm gutter fixed inset-x-0 bottom-0 border-t border-bg-soft-200 2xl:px-0">
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

const labelStylesBg = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  lime: "bg-lime-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  fuchsia: "bg-fuchsia-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
  neutral: "bg-neutral-500",
}
const kinds = [
  {
    value: "course",
    name: "Course",
    icon: <div className={cn("size-2 rounded-full", labelStylesBg.blue)} />,
  },
  {
    value: "module",
    name: "Module",
    icon: <div className={cn("size-2 rounded-full", labelStylesBg.green)} />,
  },
  {
    value: "program",
    name: "Program",
    icon: <div className={cn("size-2 rounded-full", labelStylesBg.neutral)} />,
  },
]

const columns: ColumnDef<z.infer<typeof ContentAllSchema>[number]>[] = [
  {
    id: "name",
    accessorKey: "content.title",
    header: "Name",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Name",
      type: "text",
      icon: RiHeading,
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
            {...(!row.original?.featureImageUrl && { color: "sky" })}
            size="32"
          >
            {row.original?.featureImageUrl ? (
              <Avatar.Image src={row.original?.featureImageUrl} />
            ) : (
              value?.[0]
            )}
          </Avatar.Root>
          <span className="text-paragraph-sm font-normal">{value}</span>
        </div>
      )
    },
  },
  {
    id: "type",
    accessorKey: "kind",
    header: "Type",
    filterFn: filterFn("option"),
    meta: {
      displayName: "Type",
      type: "option",
      icon: RiBookOpenLine,
      options: kinds.map((x) => ({
        ...x,
        label: x.name,
        icon: x.icon,
      })),
    },
    cell: ({ getValue }) => {
      const kindValue = getValue() as string
      const kind = kinds.find((x) => x.value === kindValue)!

      return (
        <div className="flex items-center gap-2">
          {kind.icon && kind.icon}
          {kind.name}
        </div>
      )
    },
  },
  {
    id: "courseCode",
    accessorKey: "humanCode",
    header: "Course Code",
    filterFn: filterFn("option"),
    meta: {
      displayName: "Course Code",
      type: "option",
      icon: RiHashtag,
      // @ts-ignore
      transformOptionFn: (option) => {
        return {
          label: option,
          value: option,
          icon: RiHashtag,
        }
      },
    },
    cell: ({ getValue }) => {
      const courseCode = getValue() as string
      return <p className="text-paragraph-sm font-normal">{courseCode}</p>
    },
  },
]
