import { z } from "zod"

export const CalendarViewSchema = z.enum(["month", "week", "day", "agenda"])
export type CalendarView = z.infer<typeof CalendarViewSchema>

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  calendarId?: string
  allDay?: boolean
  color?: EventColor
  label?: string
  location?: string
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "teal"
