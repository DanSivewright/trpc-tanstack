import { useState } from "react"
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { useElementSize } from "@/hooks/use-element-size"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icon"

type Props = {}
const routeApi = getRouteApi("/_learner")
const NavigationLearnerHeader: React.FC<Props> = ({}) => {
  const [open, setOpen] = useState(false)
  const navigate = routeApi.useNavigate()
  const { sidebar } = routeApi.useSearch()

  const { ref, width } = useElementSize()
  return (
    <>
      <CommandDialog
        dialogContentStyle={{
          width: `${width + 16}px`,
          maxWidth: "none",
          left: ref.current?.getBoundingClientRect().left - 8 + "px",
        }}
        dialogContentClassName="translate-y-0 rounded-none translate-x-0 w-full top-0"
        open={open}
        onOpenChange={setOpen}
      >
        <div className="flex h-[56px] items-center border-b px-2">
          <div className="bg-muted relative w-full rounded-full">
            <Input
              autoFocus={false}
              onClick={() => setOpen(true)}
              style={{
                background: "none",
              }}
              className="peer rounded-full border-none bg-none ps-9 shadow-none"
              placeholder={`Search ${width}px`}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <Icon name="Search" />
            </div>
          </div>
        </div>
        <CommandList className="w-full">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <header
        className={cn(
          "gutter bg-background/70 sticky top-0 z-10 flex w-full items-center gap-x-2 border-b py-1.5 backdrop-blur-md sm:gap-x-3",
          {
            "bg-background border-none": open,
          }
        )}
      >
        <nav className="flex h-11 items-center gap-x-4 py-1 md:h-[unset] md:gap-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate({
                search: {
                  sidebar: !sidebar,
                },
              })
            }
          >
            <Icon name="Menu" className="text-muted-foreground" />
          </Button>
          <Link to="/" className="h-6 w-6 rounded-br-lg bg-blue-500" />
          <div className="bg-accent inset-shadow-foreground inset-shadow flex items-center gap-0.5 rounded-full p-1 text-sm">
            <Link
              activeProps={{
                className: "bg-background shadow",
              }}
              to="/"
              className="rounded-full px-3 py-1"
            >
              <span>Home</span>
            </Link>
            <Link
              activeProps={{
                className: "bg-background shadow",
              }}
              to="/communities"
              className="rounded-full px-3 py-1"
            >
              <span>Communities</span>
            </Link>
            <Link
              activeProps={{
                className: "bg-background shadow",
              }}
              to="/explore"
              className="rounded-full px-3 py-1"
            >
              <span>Explore</span>
            </Link>
          </div>
        </nav>
        <div className="w-full grow px-6">
          <div ref={ref} className="bg-muted relative w-full rounded-full">
            <Input
              onClick={() => setOpen(true)}
              style={{
                background: "none",
              }}
              className="peer rounded-full border-none bg-none ps-9 shadow-none"
              placeholder={`Search ${width}px`}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <Icon name="Search" />
            </div>
          </div>
        </div>
        <Avatar>
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
      </header>
    </>
  )
}
export default NavigationLearnerHeader
