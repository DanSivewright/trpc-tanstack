import { dateFormatter } from "@/utils/date-formatter"
import { defineMeta, filterFn } from "@/utils/filters"
import {
  RiAccountCircleLine,
  RiArchiveLine,
  RiCalendarLine,
  RiCloseLine,
  RiH1,
  RiListCheck,
  RiLoaderLine,
  RiSpam3Line,
  RiTodoLine,
} from "@remixicon/react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import IndeterminateCheckbox from "@/components/indeterminate-checkbox"

const author = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
})
const activity = z.object({
  id: z.string(),
  author,
  verb: z.enum(["created", "updated", "deleted", "expired"]),
  descriptor: z.string(),
  relatedTo: z.string(),
  relatedToId: z.string(),
})
const baseTask = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(),
  status: z.enum(["todo", "in-progress", "blocked", "closed", "archived"]),
  comments: z
    .array(
      z.object({
        id: z.string(),
        author,
        createdAt: z.string(),
      })
    )
    .optional()
    .nullable(),
  assignees: z.array(author),
  assignedBy: author,
  activity: z.array(activity).optional().nullable(),
})

export const taskSchema = baseTask.extend({
  parent: baseTask.optional().nullable(),
  subTasks: z.array(baseTask).optional().nullable(),
})

const statuses = [
  {
    value: "todo",
    name: "Todo",
    icon: RiTodoLine,
    color: "green",
  },
  {
    value: "in-progress",
    name: "In Progress",
    icon: RiLoaderLine,
    color: "blue",
  },
  {
    value: "blocked",
    name: "Blocked",
    icon: RiSpam3Line,
    color: "red",
  },
  {
    value: "closed",
    name: "Closed",
    icon: RiCloseLine,
    color: "gray",
  },
  {
    value: "archived",
    name: "Archived",
    icon: RiArchiveLine,
    color: "gray",
  },
] as const
export const ColumnsTasks: ColumnDef<z.infer<typeof taskSchema>>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    filterFn: filterFn("text"),
    meta: {
      displayName: "Title",
      type: "text",
      icon: RiH1,
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
          <span className="text-paragraph-sm font-normal">{value}</span>
        </div>
      )
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    filterFn: filterFn("option"),
    meta: {
      displayName: "Status",
      type: "option",
      icon: RiAccountCircleLine,
      options: statuses.map((x) => ({ ...x, label: x.name })),
    },
    cell: ({ row }) => {
      const status = statuses.find((x) => x.value === row.original.status)!

      return (
        <Badge.Root
          size="medium"
          variant="lighter"
          className="capitalize"
          color={status.color}
        >
          {status.icon && (
            <Badge.Icon
              {...(status.value === "in-progress"
                ? { className: "animate-spin" }
                : {})}
              as={status.icon}
            />
          )}
          {status.name}
        </Badge.Root>
      )
    },
  },
  {
    id: "subTasks",
    accessorFn: (row) => row?.subTasks?.length ?? 0,
    header: "Sub Tasks",
    filterFn: filterFn("number"),
    meta: {
      displayName: "Sub Tasks",
      type: "number",
      icon: RiListCheck,
      max: 100,
    },
  },
  {
    id: "assignees",
    accessorKey: "assignees",
    header: "Assignees",
    filterFn: filterFn("multiOption"),
    // @ts-ignore
    meta: defineMeta((row) => row.assignees, {
      displayName: "Assignees",
      type: "multiOption",
      icon: RiAccountCircleLine,
      transformOptionFn: (u) => ({
        value: u.id,
        label: u.name,
        icon: (
          <Avatar.Root size="24">
            {u.avatarUrl ? (
              <Avatar.Image src={u.avatarUrl} />
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
    cell: ({ row }) => {
      if (row.original.assignees.length > 0) {
        return (
          <AvatarGroupCompact.Root size="24" variant="stroke">
            <AvatarGroupCompact.Stack>
              {row.original.assignees.slice(0, 3).map((assignee) => (
                <Avatar.Root>
                  <Avatar.Image src={assignee.avatarUrl} />
                </Avatar.Root>
              ))}
            </AvatarGroupCompact.Stack>
            {row.original.assignees.length > 3 && (
              <AvatarGroupCompact.Overflow>
                {`+${row.original.assignees.length - 3}`}
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
    id: "dueDate",
    accessorKey: "dueDate",
    header: "Due Date",
    filterFn: filterFn("date"),
    meta: {
      displayName: "Due Date",
      type: "date",
      icon: RiCalendarLine,
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 *:text-text-sub-600">
          <RiCalendarLine className="size-4" />
          <span className="text-paragraph-sm font-normal">
            {row.original.dueDate
              ? dateFormatter(row.original.dueDate)
              : "None"}
          </span>
        </div>
      )
    },
  },
]
