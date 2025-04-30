import {
  RiCheckboxCircleLine,
  RiCircleLine,
  RiDonutChartLine,
  RiRecordCircleLine,
  type RemixiconComponentType,
} from "@remixicon/react"

export type User = {
  id: string
  name: string
  picture: string
}

export type Issue = {
  id: string
  title: string
  description?: string
  status: "backlog" | "todo" | "in-progress" | "done"
  assignee?: User
  labelIds?: string[]
  startDate?: Date
  endDate?: Date
  estimatedHours?: number
}

export type IssueStatus = {
  value: Issue["status"]
  name: string
  icon: RemixiconComponentType
}

export const issueStatuses: IssueStatus[] = [
  {
    value: "backlog",
    name: "Backlog",
    icon: RiDonutChartLine,
  },
  {
    value: "todo",
    name: "Todo",
    icon: RiCircleLine,
  },
  {
    value: "in-progress",
    name: "In Progress",
    icon: RiRecordCircleLine,
  },
  {
    value: "done",
    name: "Done",
    icon: RiCheckboxCircleLine,
  },
] as const

export type IssueLabel = {
  value: string
  name: string
  color:
    | "red"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose"
    | "neutral"
}

export const issueLabels: IssueLabel[] = [
  {
    value: "bug",
    name: "Bug",
    color: "red",
  },
  {
    value: "feature",
    name: "Feature",
    color: "green",
  },
  {
    value: "enhancement",
    name: "Enhancement",
    color: "blue",
  },
  {
    value: "docs",
    name: "Documentation",
    color: "neutral",
  },
  {
    value: "performance",
    name: "Performance",
    color: "yellow",
  },
  {
    value: "security",
    name: "Security",
    color: "orange",
  },
  {
    value: "ui",
    name: "User Interface",
    color: "cyan",
  },
  {
    value: "testing",
    name: "Testing",
    color: "purple",
  },
  {
    value: "refactor",
    name: "Refactor",
    color: "indigo",
  },
  {
    value: "urgent",
    name: "Urgent",
    color: "rose",
  },
  {
    value: "database",
    name: "Database",
    color: "teal",
  },
  {
    value: "api",
    name: "API",
    color: "violet",
  },
]

export const labelStylesBg: Record<string, string> = {
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

export const labelStyles: Record<string, string> = {
  red: "bg-red-100 border-red-200 text-red-800 dark:bg-red-800 dark:border-red-700 dark:text-red-100",
  orange:
    "bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100",
  amber:
    "bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-800 dark:border-amber-700 dark:text-amber-100",
  yellow:
    "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:border-yellow-700 dark:text-yellow-100",
  lime: "bg-lime-100 border-lime-200 text-lime-800 dark:bg-lime-800 dark:border-lime-700 dark:text-lime-100",
  green:
    "bg-green-100 border-green-200 text-green-800 dark:bg-green-800 dark:border-green-700 dark:text-green-100",
  emerald:
    "bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:border-emerald-700 dark:text-emerald-100",
  teal: "bg-teal-100 border-teal-200 text-teal-800 dark:bg-teal-800 dark:border-teal-700 dark:text-teal-100",
  cyan: "bg-cyan-100 border-cyan-200 text-cyan-800 dark:bg-cyan-800 dark:border-cyan-700 dark:text-cyan-100",
  sky: "bg-sky-100 border-sky-200 text-sky-800 dark:bg-sky-800 dark:border-sky-700 dark:text-sky-100",
  blue: "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-800 dark:border-blue-700 dark:text-blue-100",
  indigo:
    "bg-indigo-100 border-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:border-indigo-700 dark:text-indigo-100",
  violet:
    "bg-violet-100 border-violet-200 text-violet-800 dark:bg-violet-800 dark:border-violet-700 dark:text-violet-100",
  purple:
    "bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-800 dark:border-purple-700 dark:text-purple-100",
  fuchsia:
    "bg-fuchsia-100 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-800 dark:border-fuchsia-700 dark:text-fuchsia-100",
  pink: "bg-pink-100 border-pink-200 text-pink-800 dark:bg-pink-800 dark:border-pink-700 dark:text-pink-100",
  rose: "bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-800 dark:border-rose-700 dark:text-rose-100",
  neutral:
    "bg-neutral-100 border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100",
}
