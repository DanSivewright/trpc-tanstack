import { createContext, useContext, useState, type ReactNode } from "react"

interface CalendarContextType {
  // Date management
  currentDate: Date
  setCurrentDate: (date: Date) => void

  // // Etiquette visibility management
  // visibleColors: string[]
  // toggleColorVisibility: (color: string) => void
  // isColorVisible: (color: string | undefined) => boolean
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
)

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendarContext must be used within a CalendarProvider")
  }
  return context
}

interface CalendarProviderProps {
  children: ReactNode
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // const [visibleColors, setVisibleColors] = useState<string[]>(() => {
  //   return calendars.filter((cal) => cal.isActive).map((cal) => cal.color)
  // })

  // // Toggle visibility of a color
  // const toggleColorVisibility = (color: string) => {
  //   setVisibleColors((prev) => {
  //     if (prev.includes(color)) {
  //       return prev.filter((c) => c !== color)
  //     } else {
  //       return [...prev, color]
  //     }
  //   })
  // }

  // // Check if a color is visible
  // const isColorVisible = (color: string | undefined) => {
  //   if (!color) return true // Events without a color are always visible
  //   return visibleColors.includes(color)
  // }

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}
