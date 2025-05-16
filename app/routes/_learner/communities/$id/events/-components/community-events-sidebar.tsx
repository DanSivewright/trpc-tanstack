import * as React from "react"
import { RiCheckLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function CommunityEventsSidebar({
  calendars,
  visibleCalendars,
  setVisibleCalendars,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  visibleCalendars: string[]
  setVisibleCalendars: React.Dispatch<React.SetStateAction<string[]>>
  calendars: {
    id: string
    name: string
    color: string
    background: string
    isActive: boolean
  }[]
}) {
  // const { isColorVisible, toggleColorVisibility } = useCalendarContext()
  const { open } = useSidebar()
  return (
    <Sidebar
      variant="inset"
      {...props}
      className={cn("z-0 bg-bg-weak-50 max-lg:p-3 lg:pe-1", {
        "sticky top-[92px] h-[calc(100dvh-92px)]": open,
      })}
    >
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2">
          <button className="inline-flex">
            <span className="sr-only">Logo</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <path
                fill="#52525C"
                d="m10.661.863-2.339 1.04 5.251 11.794L1.521 9.072l-.918 2.39 12.053 4.627-11.794 5.25 1.041 2.34 11.794-5.252L9.071 30.48l2.39.917 4.626-12.052 5.251 11.793 2.339-1.04-5.251-11.795 12.052 4.627.917-2.39-12.052-4.627 11.794-5.25-1.041-2.34-11.794 5.252L22.928 1.52l-2.39-.917-4.626 12.052L10.662.863Z"
              />
              <path
                fill="#F4F4F5"
                d="M17.28 0h-2.56v12.91L5.591 3.78l-1.81 1.81 9.129 9.129H0v2.56h12.91L3.78 26.409l1.81 1.81 9.129-9.129V32h2.56V19.09l9.128 9.129 1.81-1.81-9.128-9.129H32v-2.56H19.09l9.129-9.129-1.81-1.81-9.129 9.129V0Z"
              />
            </svg>
          </button>
          <SidebarTrigger className="text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent!" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* <SidebarGroup className="px-1">
          <SidebarCalendar />
        </SidebarGroup> */}
        <SidebarGroup className="mt-3 border-t px-0 pt-4">
          <SidebarGroupLabel>
            <span className="text-label-xs uppercase text-text-soft-400">
              Calendars
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calendars.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className="relative cursor-pointer justify-between rounded-md transition-colors hover:bg-bg-soft-200 [&>svg]:size-auto"
                  >
                    <span>
                      <span className="flex items-center justify-between gap-3 font-medium">
                        <Checkbox.Root
                          id={item.id}
                          className="peer sr-only hidden"
                          // className="peer sr-only hidden"
                          checked={!visibleCalendars.includes(item.id)}
                          onCheckedChange={() =>
                            setVisibleCalendars((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />
                        <RiCheckLine
                          className="peer-data-[state=checked]:invisible"
                          size={16}
                          aria-hidden="true"
                        />
                        <label
                          htmlFor={item.id}
                          className="text-label-md after:absolute after:inset-0 peer-data-[state=checked]:text-text-soft-400 peer-data-[state=checked]:line-through"
                        >
                          {item.name}
                        </label>
                      </span>

                      <span
                        className={cn("size-1.5 rounded-full", item.background)}
                      ></span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
