import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import type { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { PeopleAllSchema } from "@/integrations/trpc/routers/people/schemas/people-all-schema"
import { cn } from "@/utils/cn"
import { filterFn } from "@/utils/filters"
import {
  RiArrowRightSLine,
  RiGlobalLine,
  RiLoaderLine,
  RiUserAddLine,
  RiUserLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
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
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { ColumnDef, Row } from "@tanstack/table-core"
import type { z } from "zod"

import { useElementSize } from "@/hooks/use-element-size"
import { useNotification } from "@/hooks/use-notification"
import * as Avatar from "@/components/ui/avatar"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Modal from "@/components/ui/modal"
import * as Select from "@/components/ui/select"
import * as Table from "@/components/ui/table"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"

import { communitySteps } from "./communities_.create.community.$id.route"

const LIMIT = 100

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
  const me = useQuery(trpc.people.me.queryOptions())
  const people = useInfiniteQuery({
    ...trpc.people.all.infiniteQueryOptions({
      query: {
        limit: LIMIT,
      },
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  const { fetchNextPage, isFetching } = people

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

  const form = useForm({
    defaultValues: {
      members: [],
    } as {
      members: z.infer<typeof communitySchema>["membership"][]
    },
    onSubmitInvalid: (errors) => {
      console.log(errors)
    },
    onSubmit: async (data) => {
      const currentStep = communitySteps.find((x) => x.step === step)
      const nextStep = communitySteps?.[Number(currentStep?.indicator)]
      console.log("nextStep:::", nextStep)

      await updateCommunity.mutateAsync(
        {
          id,
          ...data?.value,
        },
        {
          onSuccess: async () => {
            await Promise.all([
              qc.invalidateQueries({
                queryKey: trpc.communities.joined.queryKey(),
              }),
              qc.invalidateQueries({
                queryKey: trpc.communities.detail.queryKey({ id }),
              }),
            ])
            navigate({
              to: `/communities/create/community/$id/${nextStep.step}`,
              params: { id },
            })
          },
        }
      )
    },
  })

  useEffect(() => {
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)

    form.setFieldValue(
      "members",
      selectedData.map((m) => ({
        role: "member",
        joinedAt: new Date().toISOString(),
        communityId: id,
        uid: m.personUid,
        firstName: m.person.firstName,
        lastName: m.person.lastName,
        email: m.email,
        avatarUrl: m.person.imageUrl,
      }))
    )
  }, [rowSelection, table])

  return (
    <>
      <div className="gutter mx-auto flex h-[calc(100dvh-93px)] w-full max-w-screen-xl flex-col gap-2 pt-8 2xl:px-0">
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
                            "max-w-1/2": cellIndex === 0,
                            grow: cellIndex !== 0,
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
            </Table.Body>
          </Table.Root>
        </div>
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
            <Modal.Root>
              <Modal.Trigger asChild>
                <FancyButton.Root variant="primary" type="button">
                  Next
                  <FancyButton.Icon as={RiArrowRightSLine} />
                </FancyButton.Root>
              </Modal.Trigger>
              <Modal.Content>
                <Modal.Header
                  icon={RiUserAddLine}
                  title="Invite to community"
                  description="Collaborate with members in this community."
                  className="before:border-dashed"
                />
                <Modal.Body className="max-h-96 overflow-scroll">
                  {table.getSelectedRowModel().rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-5 p-12 text-center">
                      <svg
                        width="96"
                        height="96"
                        viewBox="0 0 96 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="48"
                          cy="48.5"
                          r="45"
                          className="fill-bg-weak-50"
                        ></circle>
                        <path
                          d="M11.05 27.01l-.483.128.483-.128zm10.49 39.496l-.483.129.13.486.485-.132-.132-.483zM54 57.667l.131.483.48-.13-.128-.481-.483.128zm-8.37-31.51l.484-.129-.04-.15-.118-.102-.325.38zm-8.946-7.65l.325-.38-.202-.173-.255.07.132.482zm-24.606 6.7l.132.482-.132-.483zm24.814-6.175l.323-.382a.5.5 0 00-.806.51l.483-.128zm8.47 7.161l.131.483a.5.5 0 00.192-.865l-.323.382zm-6.123 1.665l-.483.128a.5.5 0 00.614.354l-.131-.482zm-23.202 3.656a.5.5 0 00.263.965l-.263-.965zm10.671-1.869a.5.5 0 00-.262-.965l.262.965zm-8.255 10.963a.5.5 0 00.262.964l-.262-.965zm22.235-5.019a.5.5 0 00-.263-.965l.263.965zm-21.027 9.565a.5.5 0 10.263.964l-.263-.964zm24.163-5.544a.5.5 0 10-.262-.965l.262.965zM22.076 54.246a.5.5 0 00.262.965l-.262-.965zm18.38-3.969a.5.5 0 10-.263-.964l.263.964zm-17.173 8.516a.5.5 0 00.263.965l-.263-.965zM35.882 56.4a.5.5 0 10-.263-.965l.263.965zm-25.315-29.26l10.49 39.496.966-.257-10.49-39.496-.966.256zm11.105 39.85l32.46-8.84-.263-.964-32.46 8.839.263.965zm32.811-9.45l-8.369-31.51-.966.256 8.369 31.51.966-.256zm-8.527-31.763l-8.948-7.65-.65.76 8.948 7.65.65-.76zm-9.404-7.752l-24.605 6.7.263.965 24.605-6.7-.263-.965zm-25.019 8.858a.974.974 0 01.677-1.193l-.263-.965a1.974 1.974 0 00-1.38 2.414l.966-.256zm25.036-7.468l8.47 7.161.646-.764-8.47-7.16-.646.763zm8.662 6.297l-6.123 1.664.262.965 6.123-1.664-.262-.965zm-5.509 2.018l-2.346-8.825-.967.257 2.347 8.825.966-.257zM16.3 32.479l10.408-2.834-.262-.965-10.409 2.834.263.965zm2.415 9.093l21.973-5.983-.263-.965-21.972 5.983.262.965zm1.209 4.546l23.9-6.508-.262-.965-23.9 6.509.262.964zm2.414 9.093l18.118-4.934-.263-.964-18.117 4.933.262.965zm1.208 4.547L35.882 56.4l-.263-.965-12.336 3.36.263.964z"
                          className="fill-bg-sub-300"
                        ></path>
                        <path
                          d="M51.23 19.994l-.489-.108.488.108zm-9.808 44.393l-.488-.108-.108.486.486.11.11-.488zm36.13 8.113l-.11.488.49.11.108-.49-.488-.108zm7.87-35.623l.488.108.033-.149-.056-.142-.465.183zm-4.83-12.245l.466-.184-.097-.246-.258-.058-.11.488zm-27.1-6.086l.11-.488-.11.488zm26.776 6.705l.465-.184a.5.5 0 00-.955.084l.49.1zm4.795 12.094l-.098.49a.5.5 0 00.563-.674l-.465.184zm-6.987-1.39l-.49-.1a.5.5 0 00.392.59l.098-.49zm-24.315-9.028a.5.5 0 00-.22.976l.22-.976zm12.037 3.728a.5.5 0 00.219-.976l-.22.976zM51.49 37.206a.5.5 0 00-.219.976l.22-.976zm25.442 6.738a.5.5 0 00.219-.976l-.22.976zm-26.579-1.599a.5.5 0 00-.219.976l.22-.975zm26.4 6.953a.5.5 0 10.218-.975l-.219.975zm-28.67 3.327a.5.5 0 00-.218.976l.219-.976zm19.697 5.448a.5.5 0 10.22-.976l-.22.976zm-20.83-.309a.5.5 0 10-.22.976l.22-.976zM60.9 61.922a.5.5 0 10.22-.976l-.22.976zm-10.16-42.036L40.934 64.28l.976.216 9.808-44.393-.977-.216zm-9.429 44.988l36.13 8.114.22-.976-36.13-8.113-.22.975zm36.728 7.734l7.87-35.623-.976-.215-7.87 35.622.976.216zm7.847-35.914l-4.829-12.246-.93.367 4.829 12.246.93-.367zm-5.184-12.55l-27.101-6.086-.22.976 27.101 6.086.22-.976zm-28.986-4.042a1.395 1.395 0 011.666-1.068l.219-.976a2.395 2.395 0 00-2.861 1.828l.977.216zm28.087 5.333l4.794 12.095.93-.369-4.795-12.094-.93.368zm5.356 11.42l-6.986-1.39-.196.98 6.987 1.39.195-.98zm-6.594-.8l2.192-10.704-.98-.2-2.192 10.703.98.201zm-25.024-8.152l12.256 2.752.219-.976-12.256-2.752-.22.976zm-2.27 10.279l25.66 5.762.219-.976-25.66-5.762-.22.976zm-1.138 5.14l26.618 5.976.22-.975-26.619-5.977-.219.975zM47.864 53.6l19.916 4.472.22-.976-19.916-4.472-.22.976zM46.73 58.74l14.171 3.182.22-.976-14.172-3.182-.219.976z"
                          className="fill-bg-sub-300"
                        ></path>
                        <path
                          d="M58.97 72.19l2.759-4.055 13.53 8.969a2.41 2.41 0 01.663 3.374 2.495 2.495 0 01-3.431.674l-13.52-8.963z"
                          className="fill-bg-white-0 stroke-bg-sub-300"
                        ></path>
                        <path
                          d="M64.144 58.469c1.366 9.568-5.282 18.434-14.85 19.803-9.566 1.368-18.43-5.278-19.795-14.846-1.366-9.568 5.282-18.434 14.85-19.803 9.566-1.368 18.43 5.278 19.795 14.846z"
                          className="fill-bg-white-0 stroke-bg-sub-300"
                        ></path>
                        <path
                          d="M58.16 59.59c.897 6.288-3.472 12.114-9.76 13.014-6.286.9-12.11-3.469-13.008-9.756-.898-6.288 3.471-12.114 9.758-13.013 6.287-.9 12.111 3.468 13.01 9.756z"
                          className="fill-illustration-white-0 stroke-bg-sub-300"
                        ></path>
                        <path
                          d="M45.906 63.9v-.068c.007-.73.075-1.312.204-1.744.13-.432.313-.782.55-1.05.239-.267.525-.514.858-.74.2-.137.38-.3.54-.487a2.293 2.293 0 00.52-1.486c.001-.375-.077-.7-.234-.975a1.658 1.658 0 00-.627-.637 1.732 1.732 0 00-.873-.224c-.278 0-.547.066-.806.196-.258.13-.474.334-.648.613-.173.28-.273.645-.3 1.096h-1.286c.027-.65.177-1.207.449-1.67a2.826 2.826 0 011.086-1.06 3.112 3.112 0 011.505-.368c.6 0 1.12.134 1.562.402.445.268.789.635 1.03 1.101.245.467.368.998.368 1.595 0 .42-.058.801-.174 1.141-.112.34-.275.645-.49.912a3.48 3.48 0 01-.765.712c-.3.21-.539.432-.72.665-.18.23-.31.503-.392.82a5.16 5.16 0 00-.133 1.188v.069h-1.224zm.653 3.396a.838.838 0 01-.648-.304 1.059 1.059 0 01-.27-.728c0-.283.09-.526.27-.729a.838.838 0 01.648-.304c.252 0 .468.102.648.304.18.203.27.446.27.729 0 .187-.042.36-.127.516a1.022 1.022 0 01-.332.379.802.802 0 01-.46.137z"
                          className="fill-bg-sub-300"
                        ></path>
                        <path
                          d="M15.87 57.51s-5.929 4.01-2.692 10.229c-3.237-6.22-9.188-2.252-9.188-2.252s5.93-4.01 2.693-10.229c3.236 6.22 9.188 2.252 9.188 2.252zM79.371 8.5s-2.93 3.44.486 6.374c-3.417-2.934-6.371.486-6.371.486s2.93-3.44-.486-6.374c3.417 2.934 6.371-.486 6.371-.486z"
                          className="fill-illustration-white-0 stroke-bg-sub-300"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <h3 className="text-label-md text-text-sub-600">
                          No members selected
                        </h3>
                        <p className="text-paragraph-sm text-text-soft-400">
                          Are you sure you don't want to invite anyone?
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-label-md font-normal">
                        Members with access
                      </h1>

                      <form.Field
                        name="members"
                        mode="array"
                        children={(field) => {
                          return (
                            <div className="mt-3 flex flex-col gap-5">
                              {field.state.value.map((m, i) => {
                                return (
                                  <div
                                    key={m?.uid || "" + i}
                                    className="flex items-center gap-3.5"
                                  >
                                    <Avatar.Root
                                      {...(!m?.avatarUrl && {
                                        color: "sky",
                                      })}
                                      size="32"
                                    >
                                      {m?.avatarUrl ? (
                                        <Avatar.Image src={m?.avatarUrl} />
                                      ) : (
                                        m?.firstName?.[0]
                                      )}
                                    </Avatar.Root>
                                    <div className="flex-1 space-y-1">
                                      <div className="text-label-sm text-text-strong-950">
                                        {m?.firstName} {m?.lastName}
                                      </div>
                                      <div className="text-paragraph-xs text-text-sub-600">
                                        {m?.email}
                                      </div>
                                    </div>
                                    <form.Field
                                      key={i}
                                      name={`members[${i}].role`}
                                    >
                                      {(subField) => {
                                        return (
                                          <Select.Root
                                            defaultValue={m?.role}
                                            name={subField.name}
                                            onValueChange={(value) => {
                                              subField.handleChange(
                                                value as "admin" | "member"
                                              )
                                            }}
                                            value={subField?.state?.value!}
                                            variant="inline"
                                          >
                                            <Select.Trigger>
                                              <Select.Value
                                                placeholder={
                                                  <>
                                                    <div className="flex items-center">
                                                      <Select.TriggerIcon
                                                        as={RiGlobalLine}
                                                      />{" "}
                                                      Role
                                                    </div>
                                                  </>
                                                }
                                              />
                                            </Select.Trigger>
                                            <Select.Content>
                                              <Select.Item value={"admin"}>
                                                Admin
                                              </Select.Item>
                                              <Select.Item value={"member"}>
                                                Member
                                              </Select.Item>
                                            </Select.Content>
                                          </Select.Root>
                                        )
                                      }}
                                    </form.Field>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }}
                      />
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close asChild>
                    <FancyButton.Root
                      variant="neutral"
                      size="small"
                      className="w-full"
                    >
                      Cancel
                    </FancyButton.Root>
                  </Modal.Close>

                  <form.Subscribe
                    selector={(state) => [
                      state.isSubmitting,
                      state.values.members,
                    ]}
                    children={([isSubmitting, members]) => (
                      <FancyButton.Root
                        variant="primary"
                        type="submit"
                        disabled={!!isSubmitting}
                        className="w-full"
                        size="small"
                        onClick={() => form.handleSubmit()}
                      >
                        {members && Array.isArray(members) && members.length > 0
                          ? "Invite"
                          : "Continue without members"}
                        <FancyButton.Icon
                          className={cn(isSubmitting && "animate-spin")}
                          as={isSubmitting ? RiLoaderLine : RiUserAddLine}
                        />
                      </FancyButton.Root>
                    )}
                  />
                </Modal.Footer>
              </Modal.Content>
            </Modal.Root>
          </form>
        </div>
      </footer>
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
  //   {
  //     id: "email",
  //     accessorKey: "email",
  //     header: "Email",
  //     cell: ({ getValue }) => {
  //       const value = getValue() as string
  //       return <span className="text-paragraph-sm font-normal">{value}</span>
  //     },
  //   },
]
