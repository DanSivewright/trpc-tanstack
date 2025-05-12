import {
  RiBarChartLine,
  RiExpandUpDownLine,
  RiFlashlightLine,
  RiFolder2Fill,
  RiHomeLine,
  RiInboxLine,
  RiLayoutGridLine,
  RiSettingsLine,
} from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"

import { Avatar } from "@/components/ui/avatar"

export const Route = createFileRoute("/x/sidebar")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="h-screen w-screen bg-bg-weak-50 py-24">
      <div className="mx-auto flex h-full w-full max-w-[400px] flex-col justify-between gap-2 rounded-[14px] bg-bg-strong-950 p-2">
        <div className="flex flex-col gap-2">
          <header className="flex items-center justify-between gap-4 rounded-10 bg-bg-surface-800 p-3">
            <div className="flex items-center gap-2">
              <Avatar.Root size="24">
                <Avatar.Image src="https://www.alignui.com/images/logo/apex.svg" />
              </Avatar.Root>
              <span className="text-label-md font-medium text-text-white-0">
                Apex Studio
              </span>
            </div>
            <RiExpandUpDownLine className="size-4 text-text-white-0 opacity-80" />
          </header>
          <div className="flex flex-col gap-2 rounded-10 bg-bg-surface-800 pb-1 pt-3">
            <span className="px-3 text-label-sm font-light text-text-white-0 opacity-80">
              Menu
            </span>
            <ul className="flex flex-col gap-1 px-1.5">
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
                <RiHomeLine />
                <span>Dashboard</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
                <RiInboxLine />
                <span>Data Feed</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
                <RiLayoutGridLine />
                <span>Portfolio</span>
              </li>
              <li className="relative flex items-center gap-2.5 overflow-hidden rounded-10 bg-bg-soft-200 px-1.5 py-2 text-label-sm shadow-fancy-buttons-neutral">
                <div className="absolute inset-x-0 top-0 h-[93%] rounded-b-10 bg-bg-white-0"></div>
                <RiFolder2Fill className="relative z-10" />
                <span className="relative z-10">Collections</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
                <RiBarChartLine />
                <span>Analytics</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 rounded-10 bg-bg-strong-950 pb-1 pt-3">
            <span className="px-3 text-label-sm font-light text-text-white-0 opacity-80">
              Apps
            </span>
            <ul className="flex flex-col gap-1 px-1.5">
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0">
                <Avatar.Root size="24" className="rounded-10">
                  <Avatar.Image src="https://www.alignui.com/images/major-brands/notion.svg" />
                </Avatar.Root>
                <span className="opacity-70">Notion</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0">
                <Avatar.Root size="24" className="bg-transparent">
                  <Avatar.Image src="https://www.alignui.com/images/major-brands/linear.svg" />
                </Avatar.Root>
                <span className="opacity-70">Linear</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0">
                <Avatar.Root size="24" className="bg-transparent">
                  <Avatar.Image src="https://www.alignui.com/images/major-brands/google.svg" />
                </Avatar.Root>
                <span className="opacity-70">Google</span>
              </li>
              <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0">
                <Avatar.Root size="24" className="bg-transparent">
                  <Avatar.Image src="https://www.alignui.com/images/major-brands/adobe.svg" />
                </Avatar.Root>
                <span className="opacity-70">Adobe</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-10 bg-bg-strong-950 pb-1 pt-3">
          <ul className="flex flex-col gap-1 px-1.5">
            <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
              <RiFlashlightLine />
              <span>Integrations</span>
            </li>
            <li className="flex items-center gap-2.5 px-1.5 py-2 text-label-sm text-text-white-0 opacity-70">
              <RiSettingsLine />
              <span>Settings</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
