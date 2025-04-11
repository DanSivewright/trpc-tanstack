import React, { useEffect, useState } from "react"
import { faker } from "@faker-js/faker"
import {
  compareItems,
  rankItem,
  type RankingInfo,
} from "@tanstack/match-sorter-utils"
import { createFileRoute } from "@tanstack/react-router"
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
import type { z } from "zod"

import * as Table from "@/components/ui/table"
import { Section } from "@/components/section"
import TableFilters from "@/components/table-filters"

import { ColumnsTasks, type taskSchema } from "./-components/columns-tasks"

const range = (len: number) => {
  const arr: Array<number> = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newTask = (num: number): z.infer<typeof taskSchema> => {
  return {
    id: num.toString(),
    title: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    completed: faker.datatype.boolean(),
    status: faker.helpers.shuffle<z.infer<typeof taskSchema>["status"]>([
      "todo",
      "in-progress",
      "blocked",
      "closed",
      "archived",
    ])[0],
    assignees: Array.from(
      { length: faker.number.int({ min: 0, max: 6 }) },
      () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        avatarUrl: faker.image.avatar(),
      })
    ),
    assignedBy: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
    },
    dueDate: faker.date.future().toISOString(),
  }
}

export function makeData(...lens: Array<number>) {
  const makeDataLevel = (depth = 0): Array<z.infer<typeof taskSchema>> => {
    const len = lens[depth]
    return range(len).map((index): z.infer<typeof taskSchema> => {
      const task = newTask(index)
      const numSubtasks = faker.number.int({ min: 0, max: 10 })
      const subtasks =
        numSubtasks > 0
          ? range(numSubtasks).map((subIndex) => ({
              ...newTask(subIndex),
              parent: task,
            }))
          : undefined

      return {
        ...task,
        subTasks: subtasks,
      }
    })
  }

  return makeDataLevel()
}

export const Route = createFileRoute(
  "/_learner/(communities)/communities/$id/tasks"
)({
  loader: () => ({
    leaf: "Tasks",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const [data] = useState(() => makeData(10))

  const table = useReactTable({
    data,
    columns: ColumnsTasks,
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

  console.log("data:::", data)

  return (
    <Section side="b" className="w-full px-3">
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
