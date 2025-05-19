import React, { useState, type CSSProperties } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { EnrolmentSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-all-schema"
import type { EnrolmentsDetailSchema } from "@/integrations/trpc/routers/enrolments/schemas/enrolments-detail-schema"
import { filterFn } from "@/utils/filters"
import { highlightText } from "@/utils/highlight-text"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiBook2Line,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCheckboxFill,
  RiCheckFill,
  RiErrorWarningFill,
  RiExternalLinkLine,
  RiFilterLine,
  RiHeading,
  RiHomeSmile2Line,
  RiInformationLine,
  RiRecordCircleLine,
  RiSearchLine,
  RiSortDesc,
  RiTableLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  addDays,
  differenceInDays,
  endOfDay,
  format,
  formatDistance,
  isAfter,
  isBefore,
  isFuture,
  isPast,
  isThisYear,
  isToday,
  isWithinInterval,
  startOfDay,
} from "date-fns"
import { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { useViewportSize } from "@/hooks/use-viewport-size"
import { Avatar } from "@/components/ui/avatar"
import { AvatarGroupCompact } from "@/components/ui/avatar-group-compact"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { LinkButton } from "@/components/ui/link-button"
import { StatusBadge } from "@/components/ui/status-badge"
import { StarRating } from "@/components/ui/svg-rating-icons"
import { Table } from "@/components/ui/table"
import { Grid } from "@/components/grid"
import { Section } from "@/components/section"

type ColumnType = z.infer<typeof EnrolmentSchema> & {
  modules: z.infer<
    typeof EnrolmentsDetailSchema.shape.publication.shape.material
  >
}

export const Route = createFileRoute("/_learner/")({
  validateSearch: z.object({
    q: z.string().default(""),
  }),
  search: {
    middlewares: [stripSearchParams({ q: "" })],
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.enrolments.all.queryOptions({
        query: {
          contentType: "digital,mixded",
          include: "completed",
          limit: 1000,
        },
      })
    )
  },
  component: RouteComponent,
  pendingComponent: () => <div>Loading...</div>,
})

function RouteComponent() {
  const trpc = useTRPC()
  const enrolments = useSuspenseQuery(
    trpc.enrolments.all.queryOptions({
      query: {
        contentType: "digital,mixded",
        include: "completed",
        limit: 1000,
      },
    })
  )
  const me = useSuspenseQuery(trpc.people.me.queryOptions())

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [data, setData] = useState<ColumnType[]>(
    enrolments.data?.enrolments?.map((enrolment) => ({
      ...enrolment,
      modules: [],
    })) ?? []
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
    data,
    // defaultColumn: {
    //   minSize:
    //     (width ?? 0) / columns.length < 300
    //       ? 300
    //       : (width ?? 0) / columns.length,
    // },
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    // getRowCanExpand: (row) => row.original.modules.length > 0,
    // getSubRows: (row) => row?.modules ?? undefined,
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
    <>
      <Section className="flex flex-col gap-8">
        <header className="mx-auto flex w-full max-w-screen-lg flex-col gap-4">
          <div className="flex items-center gap-3">
            <AvatarGroupCompact.Root className="bg-bg-weak-50">
              <AvatarGroupCompact.Stack>
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/emma.png" />
                </Avatar.Root>
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                </Avatar.Root>
                <Avatar.Root>
                  <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/sophia.png" />
                </Avatar.Root>
              </AvatarGroupCompact.Stack>
              <AvatarGroupCompact.Overflow>+9</AvatarGroupCompact.Overflow>
            </AvatarGroupCompact.Root>
            <div className="flex flex-col gap-2">
              <StarRating rating={0.5} />
              <div className="flex gap-1">
                <span className="text-paragraph-sm text-text-strong-950">
                  0.5 ∙ 5.2K Ratings
                </span>
                <LinkButton.Root size="medium" variant="gray" underline>
                  18 reviews
                </LinkButton.Root>
              </div>
            </div>
          </div>
          <h1 className="w-full text-pretty text-title-h2 lg:w-3/4">
            Revolutionizing Rooms, Elevating Luxury Interiors
          </h1>
        </header>
        <Grid className="gap-3 px-4" gap="none">
          <div className="col-span-12 aspect-video rounded-10 bg-bg-soft-200 lg:col-span-7"></div>
          <div className="col-span-12 flex flex-1 flex-col gap-4 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="aspect-square w-1/3 rounded-10 bg-bg-soft-200"></div>
                <div className="aspect-square w-1/3 rounded-10 bg-bg-soft-200"></div>
                <div className="aspect-square w-1/3 rounded-10 bg-bg-soft-200"></div>
              </div>
              <p className="line-clamp-4 text-paragraph-sm text-text-soft-400">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Consequatur commodi, sit animi, similique nobis saepe autem
                veritatis illum obcaecati eius nesciunt repellat nihil
                blanditiis quidem omnis sint soluta cum maiores.
              </p>
            </div>
            <div className="w-full grow rounded-10 bg-blue-50"></div>
          </div>
        </Grid>
      </Section>

      <Section side="b" className="flex flex-col gap-6">
        <Breadcrumb.Root className="px-8">
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
        <div className="flex items-center gap-2 px-8">
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
        <div className="w-full max-w-full overflow-x-auto">
          <Table.Root
            className="mx-auto px-8"
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
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                          ...getCommonPinningStyles(header.column),
                        }}
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
                table.getRowModel().rows.map((row, i, arr) => (
                  <React.Fragment key={row.id}>
                    <Table.Row data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell
                          className="h-9 w-full items-center bg-bg-white-0 py-0"
                          style={{ ...getCommonPinningStyles(cell.column) }}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                    {/* {i < arr.length - 1 && <Table.RowDivider />} */}
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
      </Section>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

const columns: ColumnDef<ColumnType>[] = [
  {
    id: "title",
    header: "Title",
    accessorKey: "publication.content.title",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Title",
      type: "text",
      icon: RiHeading,
    },
    size: 500,
    cell: ({ row, getValue, table }) => {
      const value = getValue() as string
      const globalFilter = (table.getState().globalFilter || "").toLowerCase()
      const imageUrl = row.original?.publication?.featureImageUrl

      return (
        <div className="group flex w-full items-center gap-2">
          <Avatar.Root
            {...(!imageUrl && {
              color:
                row?.original?.publication?.type === "course"
                  ? "sky"
                  : row?.original?.publication?.type === "program"
                    ? "purple"
                    : "gray",
            })}
            size="20"
          >
            {imageUrl ? (
              <Avatar.Image src={imageUrl} />
            ) : (
              <>
                {row?.original?.publication?.type === "course" ? (
                  <RiBook2Line className="size-3 fill-sky-800" />
                ) : row?.original?.publication?.type === "program" ? (
                  <RiTableLine className="size-3 fill-purple-800" />
                ) : (
                  <RiExternalLinkLine className="size-3 fill-gray-800" />
                )}
              </>
            )}
          </Avatar.Root>
          <span className="line-clamp-1 w-full max-w-56 text-paragraph-sm font-normal group-hover:text-primary-base group-hover:underline">
            {highlightText(value, globalFilter)}
          </span>
        </div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "currentState",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <StatusBadge.Root
          className="capitalize"
          {...(value === "completed" && {
            status: "completed",
          })}
          {...(value === "in-progress" && {
            status: "pending",
            className:
              "bg-information-lighter capitalize text-information-dark",
          })}
          {...(value === "not-started" && {
            status: "disabled",
          })}
          variant="light"
        >
          {value === "completed" && (
            <StatusBadge.Icon as={RiCheckboxCircleFill} />
          )}
          {value === "in-progress" && (
            <StatusBadge.Icon
              className="text-information-dark"
              as={RiRecordCircleLine}
            />
          )}
          {value === "not-started" && (
            <StatusBadge.Icon as={RiInformationLine} />
          )}
          {value.replace("-", " ")}
        </StatusBadge.Root>
      )
    },
  },
  {
    id: "dueDate",
    header: "Due Date",
    accessorKey: "dueDate",
    filterFn: filterFn("date"),
    size: 150,
    meta: {
      displayName: "Due Date",
      type: "date",
      icon: RiCalendarLine,
    },
    cell: ({ getValue, row, table }) => {
      const value = getValue() as string
      const formattedDate = value ? format(new Date(value), "MMM d") : null
      if (!formattedDate) return null

      const dueWithin7Days = isWithinInterval(new Date(value), {
        start: startOfDay(new Date()),
        end: addDays(startOfDay(new Date()), 7),
      })
      const dueDateToday = isToday(startOfDay(new Date(value)))
      const isCompleted = row.original?.currentState === "completed"

      // due today
      if (!isCompleted && dueDateToday) {
        return (
          <div className="flex h-full items-center gap-2 bg-warning-lighter px-2 text-warning-dark">
            <RiErrorWarningFill className="size-5 fill-error-base" />
            <span className="text-paragraph-sm font-normal">Due Today</span>
          </div>
        )
      }

      // incomplete and not due soon
      if (!isCompleted && !dueWithin7Days) {
        return (
          <div className="flex h-full items-center gap-2">
            <RiErrorWarningFill className="size-5 fill-information-base" />
            <span className="text-paragraph-sm font-normal">
              {formattedDate}
            </span>
          </div>
        )
      }

      // incomplete and due soon
      if (!isCompleted && dueWithin7Days && !dueDateToday) {
        return (
          <div className="flex h-full items-center gap-2 bg-information-lighter px-2 text-information-dark">
            <RiErrorWarningFill className="size-5 fill-information-base" />
            <span className="text-paragraph-sm font-normal">
              Due in {formatDistance(new Date(value), new Date(), {})}
            </span>
          </div>
        )
      }

      // incomplete and late
      if (
        !isCompleted &&
        isBefore(endOfDay(new Date(value)), endOfDay(new Date()))
      ) {
        return (
          <div className="flex h-full items-center gap-2 bg-error-lighter px-2 text-error-dark">
            <RiErrorWarningFill className="size-5 fill-error-base" />
            <span className="text-paragraph-sm font-normal">
              {formattedDate} (
              {formatDistance(endOfDay(new Date(value)), new Date())} Overdue)
            </span>
          </div>
        )
      }

      return null
    },
  },
  {
    id: "topics",
    header: "Topics",
    accessorKey: "publication.topics",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string[]
      if (!value || value.length === 0) return null
      return (
        <div className="flex items-center gap-1.5">
          {value.slice(0, 1).map((topic) => (
            <Badge.Root
              className="shrink-0"
              variant="light"
              key={topic}
              size="small"
            >
              {topic}
            </Badge.Root>
          ))}
          {value.length > 1 && (
            <Badge.Root className="shrink-0" variant="light" size="small">
              +{value.length - 1}
            </Badge.Root>
          )}
        </div>
      )
    },
  },
  {
    id: "enrolledAt",
    header: "Enrolled At",
    accessorKey: "createdAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "startedAt",
    header: "Started At",
    accessorKey: "startedAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "completedAt",
    header: "Completed At",
    accessorKey: "completedAt",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as string
      if (!value) return null
      return (
        <span className="text-paragraph-sm font-normal">
          {format(
            new Date(value),
            isThisYear(new Date(value)) ? "MMM d" : "MMM d, yyyy"
          )}
        </span>
      )
    },
  },
  {
    id: "rating",
    header: "Rating",
    accessorKey: "feedback.rating",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue() as number
      if (!value) return null
      return <StarRating rating={value} />
    },
  },
]

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
