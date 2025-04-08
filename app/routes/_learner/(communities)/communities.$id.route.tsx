import {
  RiAddLine,
  RiArrowRightSLine,
  RiContactsBookLine,
  RiExpandUpDownLine,
  RiShareForwardBoxLine,
  RiShareLine,
  RiUserLine,
} from "@remixicon/react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as CompactButton from "@/components/ui/compact-button"
import * as Divider from "@/components/ui/divider"
import * as Dropdown from "@/components/ui/dropdown"
import * as Switch from "@/components/ui/switch"
import * as TabMenuVertical from "@/components/ui/tab-menu-vertical"

const items = [
  {
    label: "Profile Settings",
    icon: RiUserLine,
  },
  {
    label: "Contact Information",
    icon: RiContactsBookLine,
  },
  {
    label: "Social Links",
    icon: RiShareLine,
  },
  {
    label: "Export Data",
    icon: RiShareForwardBoxLine,
  },
]

export const Route = createFileRoute("/_learner/(communities)/communities/$id")(
  {
    component: RouteComponent,
    loader: () => ({
      crumb: "Origami",
    }),
  }
)

function RouteComponent() {
  return (
    <div className="flex h-full w-full bg-bg-soft-200 pr-2">
      <div className="h-[calc(100vh-92px)] w-[20vw] px-2 pb-2">
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button className="flex w-full items-center gap-3 whitespace-nowrap pb-3 text-left outline-none transition-all duration-200 ease-out focus:outline-none">
              <Avatar.Root size="48" color="purple">
                <Avatar.Image src="https://hr-template.alignui.com/images/placeholder/synergy.svg" />
              </Avatar.Root>
              <div className="flex-1 space-y-1">
                <div className="text-label-sm">Synergy</div>
                <div className="text-paragraph-xs text-text-sub-600">
                  HR Management
                </div>
              </div>
              <CompactButton.Root>
                <CompactButton.Icon as={RiExpandUpDownLine} />
              </CompactButton.Root>
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content align="start" side="right">
            <Dropdown.Item>
              <button className="flex w-full items-center gap-3 whitespace-nowrap text-left outline-none transition-all duration-200 ease-out focus:outline-none">
                <Avatar.Root size="48" color="purple">
                  <Avatar.Image src="https://hr-template.alignui.com/images/placeholder/synergy.svg" />
                </Avatar.Root>
                <div className="flex-1 space-y-1">
                  <div className="text-label-sm">Synergy</div>
                  <div className="text-paragraph-xs text-text-sub-600">
                    HR Management
                  </div>
                </div>
              </button>
            </Dropdown.Item>
            <Dropdown.Item>
              <button className="flex w-full items-center gap-3 whitespace-nowrap text-left outline-none transition-all duration-200 ease-out focus:outline-none">
                <Avatar.Root size="48" color="purple">
                  <Avatar.Image src="https://hr-template.alignui.com/images/placeholder/synergy.svg" />
                </Avatar.Root>
                <div className="flex-1 space-y-1">
                  <div className="text-label-sm">Synergy</div>
                  <div className="text-paragraph-xs text-text-sub-600">
                    HR Management
                  </div>
                </div>
              </button>
            </Dropdown.Item>
            <Dropdown.Item>
              <button className="flex w-full items-center gap-3 whitespace-nowrap text-left outline-none transition-all duration-200 ease-out focus:outline-none">
                <Avatar.Root size="48" color="purple">
                  <Avatar.Image src="https://hr-template.alignui.com/images/placeholder/synergy.svg" />
                </Avatar.Root>
                <div className="flex-1 space-y-1">
                  <div className="text-label-sm">Synergy</div>
                  <div className="text-paragraph-xs text-text-sub-600">
                    HR Management
                  </div>
                </div>
              </button>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
        <TabMenuVertical.Root defaultValue="Profile Settings">
          <TabMenuVertical.List>
            {items.map(({ label, icon: Icon }) => (
              <TabMenuVertical.Trigger key={label} value={label}>
                <TabMenuVertical.Icon as={Icon} />
                {label}
                <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
              </TabMenuVertical.Trigger>
            ))}
          </TabMenuVertical.List>
        </TabMenuVertical.Root>
      </div>
      <div className="shadow-lg h-[calc(100vh-100px)] grow rounded-10 bg-bg-white-0 shadow-custom-lg">
        <Outlet />
      </div>
    </div>
  )
}
