import { useEffect, useMemo, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import * as Datepicker from "@/components/ui/datepicker"
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEvent, EventColor } from "@/components/event-calendar"
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/components/event-calendar/constants"

import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Modal } from "../ui/modal"
import { Popover } from "../ui/popover"
import { Radio } from "../ui/radio"
import { Select } from "../ui/select"

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("blue")
  const [error, setError] = useState<string | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // Debug log to check what event is being passed
  useEffect(() => {
    console.log("EventDialog received event:", event)
  }, [event])

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")

      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(start)
      setEndDate(end)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay || false)
      setLocation(event.location || "")
      setColor((event.color as EventColor) || "sky")
      setError(null) // Reset error when opening dialog
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate(new Date())
    setEndDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setAllDay(false)
    setLocation("")
    setColor("blue")
    setError(null)
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "h:mm a")
        options.push({ value, label })
      }
    }
    return options
  }, []) // Empty dependency array ensures this only runs once

  const handleSave = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime
        .split(":")
        .map(Number)
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number)

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(
          `Selected time must be between ${StartHour}:00 and ${EndHour}:00`
        )
        return
      }

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date")
      return
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)"

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
    })
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  // Updated color options to match types.ts
  const colorOptions: Array<{
    value: EventColor
    label: string
    bgClass: string
    borderClass: string
  }> = [
    {
      value: "blue",
      label: "Blue",
      bgClass: "bg-blue-400 ",
      borderClass: "",
    },
    {
      value: "violet",
      label: "Violet",
      bgClass: "bg-feature-base ",
      borderClass: "",
    },
    {
      value: "rose",
      label: "Rose",
      bgClass: "bg-highlighted-base ",
      borderClass: "",
    },
    {
      value: "emerald",
      label: "Emerald",
      bgClass: "bg-stable-base ",
      borderClass: "",
    },
    {
      value: "orange",
      label: "Orange",
      bgClass: "bg-away-base ",
      borderClass: "",
    },
  ]

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="sm:max-w-[425px]">
        <Modal.Header>
          <Modal.Title>{event?.id ? "Edit Event" : "Create Event"}</Modal.Title>
          <Modal.Description className="sr-only">
            {event?.id
              ? "Edit the details of this event"
              : "Add a new event to your calendar"}
          </Modal.Description>
        </Modal.Header>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="*:not-first:mt-1.5">
            <Label.Root>Title</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Field
                  //
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className="*:not-first:mt-1.5">
            <Label.Root htmlFor="description">Description</Label.Root>
            <Textarea.Root
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="*:not-first:mt-1.5 flex-1">
              <Label.Root htmlFor="start-date">Start Date</Label.Root>
              <Popover.Root
                open={startDateOpen}
                onOpenChange={setStartDateOpen}
              >
                <Popover.Trigger asChild>
                  <Button.Root
                    id="start-date"
                    variant="neutral"
                    mode="stroke"
                    // variant={"outline"}
                    // className={cn(
                    //   "bg-background hover:bg-background border-input group w-full justify-between px-3 font-normal outline-none outline-offset-0 focus-visible:outline-[3px]",
                    //   !startDate && "text-muted-foreground"
                    // )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <Button.Icon as={RiCalendarLine} />
                  </Button.Root>
                </Popover.Trigger>
                <Popover.Content
                  className="w-auto p-0"
                  showArrow={false}
                  align="start"
                >
                  <Datepicker.Calendar
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        // If end date is before the new start date, update it to match the start date
                        if (isBefore(endDate, date)) {
                          setEndDate(date)
                        }
                        setError(null)
                        setStartDateOpen(false)
                      }
                    }}
                  />
                </Popover.Content>
              </Popover.Root>
            </div>

            {!allDay && (
              <div className="*:not-first:mt-1.5 min-w-28">
                <Label.Root htmlFor="start-time">Start Time</Label.Root>
                <Select.Root value={startTime} onValueChange={setStartTime}>
                  <Select.Trigger id="start-time">
                    <Select.Value placeholder="Select time" />
                  </Select.Trigger>
                  <Select.Content>
                    {timeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="*:not-first:mt-1.5 flex-1">
              <Label.Root htmlFor="end-date">End Date</Label.Root>
              <Popover.Root open={endDateOpen} onOpenChange={setEndDateOpen}>
                <Popover.Trigger asChild>
                  <Button.Root
                    id="end-date"
                    variant="neutral"
                    mode="stroke"
                    // variant={"outline"}
                    // className={cn(
                    //   "bg-background hover:bg-background border-input group w-full justify-between px-3 font-normal outline-none outline-offset-0 focus-visible:outline-[3px]",
                    //   !endDate && "text-muted-foreground"
                    // )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button.Root>
                </Popover.Trigger>
                <Popover.Content className="w-auto p-2" align="start">
                  <Datepicker.Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setError(null)
                        setEndDateOpen(false)
                      }
                    }}
                  />
                </Popover.Content>
              </Popover.Root>
            </div>

            {!allDay && (
              <div className="*:not-first:mt-1.5 min-w-28">
                <Label.Root htmlFor="end-time">End Time</Label.Root>
                <Select.Root value={endTime} onValueChange={setEndTime}>
                  <Select.Trigger id="end-time">
                    <Select.Value placeholder="Select time" />
                  </Select.Trigger>
                  <Select.Content>
                    {timeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox.Root
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label.Root htmlFor="all-day">All day</Label.Root>
          </div>

          <div className="*:not-first:mt-1.5">
            <Label.Root htmlFor="location">Location</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Field
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <fieldset className="space-y-4">
            <legend className="text-foreground text-sm font-medium leading-none">
              Etiquette
            </legend>
            <Radio.Group
              className="flex gap-1.5"
              defaultValue={colorOptions[0]?.value}
              value={color}
              onValueChange={(value: EventColor) => setColor(value)}
            >
              {colorOptions.map((colorOption) => (
                <div className="group/radio size-6" key={colorOption.value}>
                  <Radio.Item
                    id={`color-${colorOption.value}`}
                    value={colorOption.value}
                    aria-label={colorOption.label}
                    className="hidden"
                  />
                  <label
                    htmlFor={`color-${colorOption.value}`}
                    className={cn(
                      "flex size-6 cursor-pointer items-center justify-between rounded-full shadow-none",
                      colorOption.bgClass,
                      colorOption.borderClass
                    )}
                  >
                    <div className="ml-[7px] size-2 rounded-full bg-white opacity-0 group-has-[[data-state=checked]]/radio:opacity-100"></div>
                  </label>
                </div>
              ))}
            </Radio.Group>
          </fieldset>
        </div>
        <Modal.Footer className="flex-row sm:justify-between">
          {event?.id && (
            <Button.Root
              size="small"
              variant="error"
              onClick={handleDelete}
              aria-label="Delete event"
            >
              <Button.Icon as={RiDeleteBinLine} aria-hidden="true" />
            </Button.Root>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" onClick={onClose}>
              Cancel
            </Button.Root>
            <Button.Root onClick={handleSave}>Save</Button.Root>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
