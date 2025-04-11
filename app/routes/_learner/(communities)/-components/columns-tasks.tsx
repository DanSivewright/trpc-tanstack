import { dateFormatter } from "@/utils/date-formatter"
import {
  RiAccountCircleLine,
  RiArchiveLine,
  RiCalendarLine,
  RiCloseLine,
  RiLoaderLine,
  RiSpam3Line,
  RiTodoLine,
} from "@remixicon/react"
import type { ColumnDef } from "@tanstack/react-table"
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
export const ColumnsTasks: ColumnDef<z.infer<typeof taskSchema>>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
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
    cell: ({ getValue }) => {
      const value = getValue() as string
      const colorMap: Record<
        string,
        | "green"
        | "blue"
        | "red"
        | "gray"
        | "orange"
        | "yellow"
        | "purple"
        | "sky"
        | "pink"
        | "teal"
      > = {
        todo: "green",
        "in-progress": "blue",
        blocked: "red",
        closed: "gray",
        archived: "gray",
      }
      const iconMap: Record<string, React.ElementType> = {
        todo: RiTodoLine,
        "in-progress": RiLoaderLine,
        blocked: RiSpam3Line,
        closed: RiCloseLine,
        archived: RiArchiveLine,
      }
      const icon = iconMap[value]
      return (
        <Badge.Root
          size="medium"
          variant="lighter"
          className="capitalize"
          color={colorMap[value]}
        >
          {icon && (
            <Badge.Icon
              {...(value === "in-progress"
                ? { className: "animate-spin" }
                : {})}
              as={icon}
            />
          )}
          {value.replace(/-/g, " ")}
        </Badge.Root>
      )
    },
  },
  {
    id: "subTasks",
    accessorKey: "subTasks",
    cell: ({ row }) => row?.original?.subTasks?.length ?? "",
    header: "Sub Tasks",
  },
  {
    id: "assignees",
    accessorKey: "assignees",
    header: "Assignees",
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
    header: "Due Date",
  },
]
