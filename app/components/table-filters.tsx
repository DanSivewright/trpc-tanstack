import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { cn } from "@/utils/cn"
import {
  createNumberRange,
  dateFilterDetails,
  determineNewOperator,
  filterTypeOperatorDetails,
  getColumn,
  getColumnMeta,
  isColumnOptionArray,
  isFilterableColumn,
  multiOptionFilterDetails,
  numberFilterDetails,
  optionFilterDetails,
  textFilterDetails,
  type ColumnDataType,
  type ColumnOption,
  type ElementType,
  type FilterModel,
} from "@/utils/filters"
import {
  RiArrowRightLine,
  RiCloseLine,
  RiFilterLine,
  RiMoreLine,
  RiSearch2Line,
} from "@remixicon/react"
import type { Column, ColumnMeta, RowData, Table } from "@tanstack/react-table"
import { Command } from "cmdk"
import { format, isEqual } from "date-fns"
import type { DateRange } from "react-day-picker"

import { take, uniq } from "@/lib/array"
import { useIsMobile } from "@/hooks/use-is-mobile"
import * as Button from "@/components/ui/button"
import * as ButtonGroup from "@/components/ui/button-group"
import * as Checkbox from "@/components/ui/checkbox"
import * as CommandMenu from "@/components/ui/command-menu"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Input from "@/components/ui/input"
import * as Popover from "@/components/ui/popover"
import * as SegmentedControl from "@/components/ui/segmented-control"
import * as Slider from "@/components/ui/slider"
import * as Tooltip from "@/components/ui/tooltip"

import { Calendar } from "./ui/datepicker"

type Props<TData> = {
  table: Table<TData>
}

const TableFilters = <TData, _>({ table }: Props<TData>) => {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex gap-1">
          <FilterSelector table={table} />
          <FilterActions table={table} />
        </div>
        <ActiveFiltersMobileContainer>
          <ActiveFilters table={table} />
        </ActiveFiltersMobileContainer>
      </div>
    )
  }

  return (
    <div className="flex w-full items-start justify-between gap-2">
      <div className="flex w-full flex-1 gap-2 md:flex-wrap">
        <FilterSelector table={table} />
        <ActiveFilters table={table} />
      </div>
      <FilterActions table={table} />
    </div>
  )
}
export function ActiveFiltersMobileContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(true)

  // Check if there's content to scroll and update blur states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0)

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  // Log blur states for debugging
  // useEffect(() => {
  //   console.log('left:', showLeftBlur, '  right:', showRightBlur)
  // }, [showLeftBlur, showRightBlur])

  // Set up ResizeObserver to monitor container size
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll()
      })
      resizeObserver.observe(scrollContainerRef.current)
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Update blur states when children change
  useEffect(() => {
    checkScroll()
  }, [children])

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Left blur effect */}
      {showLeftBlur && (
        <div className="from-background pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r to-transparent animate-in fade-in-0" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex gap-2 overflow-x-scroll"
        onScroll={checkScroll}
      >
        {children}
      </div>

      {/* Right blur effect */}
      {showRightBlur && (
        <div className="from-background pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l to-transparent animate-in fade-in-0" />
      )}
    </div>
  )
}

export function FilterActions<TData>({ table }: { table: Table<TData> }) {
  const hasFilters = table.getState().columnFilters.length > 0

  function clearFilters() {
    table.setColumnFilters([])
    table.setGlobalFilter("")
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <FancyButton.Root
          size="xsmall"
          onClick={clearFilters}
          className={cn(!hasFilters && "hidden")}
        >
          <FancyButton.Icon as={RiFilterLine} />
          <span className="hidden md:block">Clear</span>
        </FancyButton.Root>
      </Tooltip.Trigger>
      <Tooltip.Content>Clear Filters</Tooltip.Content>
    </Tooltip.Root>
  )
}

export function FilterSelector<TData>({ table }: { table: Table<TData> }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [property, setProperty] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const column = property ? getColumn(table, property) : undefined
  const columnMeta = property ? getColumnMeta(table, property) : undefined

  const properties = table.getAllColumns().filter(isFilterableColumn)

  const hasFilters = table.getState().columnFilters.length > 0

  useEffect(() => {
    if (property && inputRef) {
      inputRef.current?.focus()
      setValue("")
    }
  }, [property])

  useEffect(() => {
    if (!open) setTimeout(() => setValue(""), 150)
  }, [open])

  const content = useMemo(
    () =>
      property && column && columnMeta ? (
        <FitlerValueController
          id={property}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      ) : (
        <Command
          className={cn(
            "divide-y divide-stroke-soft-200",
            "grid min-h-0 auto-cols-auto grid-flow-row",
            "[&>[cmdk-label]+*]:!border-t-0"
          )}
        >
          <div className="group/cmd-input flex h-12 w-full items-center gap-2 px-5">
            <RiSearch2Line
              className={cn(
                "size-5 shrink-0 text-text-soft-400",
                "transition duration-200 ease-out",
                // focus within
                "group-focus-within/cmd-input:text-primary-base"
              )}
            />
            <CommandMenu.Input
              value={value}
              onValueChange={setValue}
              ref={inputRef}
              placeholder="Search..."
            />
          </div>
          <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
            <CommandMenu.Group>
              {properties.map((column) => (
                <FilterableColumn
                  key={column.id}
                  column={column}
                  table={table}
                  setProperty={setProperty}
                />
              ))}
            </CommandMenu.Group>
          </CommandMenu.List>
        </Command>
      ),
    [property, column, columnMeta, value, table, properties]
  )

  return (
    <Popover.Root
      open={open}
      onOpenChange={async (value) => {
        setOpen(value)
        if (!value) setTimeout(() => setProperty(undefined), 100)
      }}
    >
      <Popover.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="xsmall">
          <Button.Icon as={RiFilterLine} />
          {!hasFilters && <span>Filter</span>}
        </Button.Root>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        side="bottom"
        sideOffset={5}
        showArrow={false}
        className="origin-(--radix-popover-content-transform-origin) w-fit p-0"
      >
        {content}
      </Popover.Content>
    </Popover.Root>
  )
}

export function FilterableColumn<TData>({
  column,
  setProperty,
}: {
  column: Column<TData>
  table: Table<TData>
  setProperty: (value: string) => void
}) {
  const Icon = column.columnDef.meta?.icon!
  return (
    <CommandMenu.Item onSelect={() => setProperty(column.id)} className="group">
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex items-center gap-1.5">
          {<Icon strokeWidth={2.25} className="size-4" />}
          <span>{column.columnDef.meta?.displayName}</span>
        </div>
        <RiArrowRightLine className="size-4 opacity-0 group-aria-selected:opacity-100" />
      </div>
    </CommandMenu.Item>
  )
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Input
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Input.Wrapper>
    </Input.Root>
  )
}

export function ActiveFilters<TData>({ table }: { table: Table<TData> }) {
  const filters = table.getState().columnFilters

  return (
    <>
      {filters.map((filter) => {
        const { id } = filter

        const column = getColumn(table, id)
        const meta = getColumnMeta(table, id)

        // Skip if no filter value
        if (!filter.value) return null

        // Narrow the type based on meta.type and cast filter accordingly
        switch (meta.type) {
          case "text":
            return renderFilter<TData, "text">(
              filter as { id: string; value: FilterModel<"text", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "text" },
              table
            )
          case "number":
            return renderFilter<TData, "number">(
              filter as { id: string; value: FilterModel<"number", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "number" },
              table
            )
          case "date":
            return renderFilter<TData, "date">(
              filter as { id: string; value: FilterModel<"date", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "date" },
              table
            )
          case "option":
            return renderFilter<TData, "option">(
              filter as { id: string; value: FilterModel<"option", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "option" },
              table
            )
          case "multiOption":
            return renderFilter<TData, "multiOption">(
              filter as {
                id: string
                value: FilterModel<"multiOption", TData>
              },
              column,
              meta as ColumnMeta<TData, unknown> & {
                type: "multiOption"
              },
              table
            )
          default:
            return null // Handle unknown types gracefully
        }
      })}
    </>
  )
}

// Generic render function for a filter with type-safe value
function renderFilter<TData, T extends ColumnDataType>(
  filter: { id: string; value: FilterModel<T, TData> },
  column: Column<TData, unknown>,
  meta: ColumnMeta<TData, unknown> & { type: T },
  table: Table<TData>
) {
  const { value } = filter

  return (
    <div key={`filter-${filter.id}`} className="flex items-center gap-2">
      <ButtonGroup.Root size="xxsmall">
        <FilterSubject meta={meta} />
        <FilterOperator column={column} columnMeta={meta} filter={value} />
        <FilterValue
          id={filter.id}
          column={column}
          columnMeta={meta}
          table={table}
        />
      </ButtonGroup.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <FancyButton.Root
            style={{
              height: "30px",
              width: "30px",
            }}
            size="xsmall"
            variant="destructive"
            onClick={() =>
              table.getColumn(filter.id)?.setFilterValue(undefined)
            }
          >
            <FancyButton.Icon as={RiCloseLine} />
          </FancyButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>Clear Filter</Tooltip.Content>
      </Tooltip.Root>

      {/* <Button.Root
        variant="neutral"
        mode="stroke"
        size="xsmall"
        onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
      >
        <Button.Icon as={RiCloseLine} />
      </Button.Root> */}
    </div>
  )
}

/****** Property Filter Subject ******/

export function FilterSubject<TData>({
  meta,
}: {
  meta: ColumnMeta<TData, string>
}) {
  const hasIcon = !!meta?.icon
  return (
    <ButtonGroup.Item size="xsmall">
      {hasIcon && <ButtonGroup.Icon as={meta.icon} />}
      {meta.displayName}
    </ButtonGroup.Item>
  )
}

/****** Property Filter Operator ******/

// Renders the filter operator display and menu for a given column filter
// The filter operator display is the label and icon for the filter operator
// The filter operator menu is the dropdown menu for the filter operator
export function FilterOperator<TData, T extends ColumnDataType>({
  column,
  columnMeta,
  filter,
}: {
  column: Column<TData, unknown>
  columnMeta: ColumnMeta<TData, unknown>
  filter: FilterModel<T, TData>
}) {
  const [open, setOpen] = useState<boolean>(false)

  const close = () => setOpen(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <ButtonGroup.Item size="xsmall">
          <FilterOperatorDisplay filter={filter} filterType={columnMeta.type} />
        </ButtonGroup.Item>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        sideOffset={5}
        showArrow={false}
        className="origin-(--radix-popover-content-transform-origin) w-fit p-0"
      >
        <Command
          className={cn(
            "divide-y divide-stroke-soft-200",
            "grid min-h-0 auto-cols-auto grid-flow-row",
            "[&>[cmdk-label]+*]:!border-t-0"
          )}
          loop
        >
          <div className="group/cmd-input flex h-12 w-full items-center gap-2 px-5">
            <RiSearch2Line
              className={cn(
                "size-5 shrink-0 text-text-soft-400",
                "transition duration-200 ease-out",
                // focus within
                "group-focus-within/cmd-input:text-primary-base"
              )}
            />
            <CommandMenu.Input placeholder="Search..." />
          </div>

          {/* <CommandEmpty>No results.</CommandEmpty> */}
          <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
            <FilterOperatorController column={column} closeController={close} />
          </CommandMenu.List>
        </Command>
      </Popover.Content>
    </Popover.Root>
  )
}

export function FilterOperatorDisplay<TData, T extends ColumnDataType>({
  filter,
  filterType,
}: {
  filter: FilterModel<T, TData>
  filterType: T
}) {
  const details = filterTypeOperatorDetails[filterType][filter.operator]

  return <span>{details.label}</span>
}

interface FilterOperatorControllerProps<TData> {
  column: Column<TData, unknown>
  closeController: () => void
}

export function FilterOperatorController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const { type } = column.columnDef.meta!

  switch (type) {
    case "option":
      return (
        <FilterOperatorOptionController
          column={column}
          closeController={closeController}
        />
      )
    case "multiOption":
      return (
        <FilterOperatorMultiOptionController
          column={column}
          closeController={closeController}
        />
      )
    case "date":
      return (
        <FilterOperatorDateController
          column={column}
          closeController={closeController}
        />
      )
    case "text":
      return (
        <FilterOperatorTextController
          column={column}
          closeController={closeController}
        />
      )
    case "number":
      return (
        <FilterOperatorNumberController
          column={column}
          closeController={closeController}
        />
      )
    default:
      return null
  }
}

function FilterOperatorOptionController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const filter = column.getFilterValue() as FilterModel<"option", TData>
  const filterDetails = optionFilterDetails[filter.operator]

  const relatedFilters = Object.values(optionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  )

  const changeOperator = (value: string) => {
    column.setFilterValue((old: typeof filter) => ({ ...old, operator: value }))
    closeController()
  }

  return (
    <CommandMenu.Group heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandMenu.Item
            onSelect={changeOperator}
            value={r.value}
            key={r.value}
          >
            {r.label}
          </CommandMenu.Item>
        )
      })}
    </CommandMenu.Group>
  )
}

function FilterOperatorMultiOptionController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const filter = column.getFilterValue() as FilterModel<"multiOption", TData>
  const filterDetails = multiOptionFilterDetails[filter.operator]

  const relatedFilters = Object.values(multiOptionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  )

  const changeOperator = (value: string) => {
    column.setFilterValue((old: typeof filter) => ({ ...old, operator: value }))
    closeController()
  }

  return (
    <CommandMenu.Group heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandMenu.Item
            onSelect={changeOperator}
            value={r.value}
            key={r.value}
          >
            {r.label}
          </CommandMenu.Item>
        )
      })}
    </CommandMenu.Group>
  )
}

function FilterOperatorDateController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const filter = column.getFilterValue() as FilterModel<"date", TData>
  const filterDetails = dateFilterDetails[filter.operator]

  const relatedFilters = Object.values(dateFilterDetails).filter(
    (o) => o.target === filterDetails.target
  )

  const changeOperator = (value: string) => {
    column.setFilterValue((old: typeof filter) => ({ ...old, operator: value }))
    closeController()
  }

  return (
    <CommandMenu.Group>
      {relatedFilters.map((r) => {
        return (
          <CommandMenu.Item
            onSelect={changeOperator}
            value={r.value}
            key={r.value}
          >
            {r.label}
          </CommandMenu.Item>
        )
      })}
    </CommandMenu.Group>
  )
}

export function FilterOperatorTextController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const filter = column.getFilterValue() as FilterModel<"text", TData>
  const filterDetails = textFilterDetails[filter.operator]

  const relatedFilters = Object.values(textFilterDetails).filter(
    (o) => o.target === filterDetails.target
  )

  const changeOperator = (value: string) => {
    column.setFilterValue((old: typeof filter) => ({ ...old, operator: value }))
    closeController()
  }

  return (
    <CommandMenu.Group heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandMenu.Item
            onSelect={changeOperator}
            value={r.value}
            key={r.value}
          >
            {r.label}
          </CommandMenu.Item>
        )
      })}
    </CommandMenu.Group>
  )
}

function FilterOperatorNumberController<TData>({
  column,
  closeController,
}: FilterOperatorControllerProps<TData>) {
  const filter = column.getFilterValue() as FilterModel<"number", TData>

  // Show all related operators
  const relatedFilters = Object.values(numberFilterDetails)
  const relatedFilterOperators = relatedFilters.map((r) => r.value)

  const changeOperator = (value: (typeof relatedFilterOperators)[number]) => {
    column.setFilterValue((old: typeof filter) => {
      // Clear out the second value when switching to single-input operators
      const target = numberFilterDetails[value].target

      const newValues =
        target === "single" ? [old.values[0]] : createNumberRange(old.values)

      return { ...old, operator: value, values: newValues }
    })
    closeController()
  }

  return (
    <div>
      <CommandMenu.Group heading="Operators">
        {relatedFilters.map((r) => (
          <CommandMenu.Item
            onSelect={() => changeOperator(r.value)}
            value={r.value}
            key={r.value}
          >
            {r.label} {/**/}
          </CommandMenu.Item>
        ))}
      </CommandMenu.Group>
    </div>
  )
}

/****** Property Filter Value ******/

export function FilterValue<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: {
  id: string
  column: Column<TData>
  columnMeta: ColumnMeta<TData, TValue>
  table: Table<TData>
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <ButtonGroup.Item size="xsmall">
          <FilterValueDisplay
            id={id}
            column={column}
            columnMeta={columnMeta}
            table={table}
          />
        </ButtonGroup.Item>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        side="bottom"
        sideOffset={5}
        showArrow={false}
        className="origin-(--radix-popover-content-transform-origin) w-fit p-0"
      >
        <FitlerValueController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      </Popover.Content>
    </Popover.Root>
  )
}

interface FilterValueDisplayProps<TData, TValue> {
  id: string
  column: Column<TData>
  columnMeta: ColumnMeta<TData, TValue>
  table: Table<TData>
}

export function FilterValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: FilterValueDisplayProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
      return (
        <FilterValueOptionDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "multiOption":
      return (
        <FilterValueMultiOptionDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "date":
      return (
        <FilterValueDateDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "text":
      return (
        <FilterValueTextDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "number":
      return (
        <FilterValueNumberDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    default:
      return null
  }
}

export function FilterValueOptionDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: FilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[]
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null)
  const uniqueVals = uniq(columnVals)

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    )
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    )
  }

  const filter = column.getFilterValue() as FilterModel<"option", TData>
  const selected = options.filter((o) => filter?.values.includes(o.value))

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0]
    const hasIcon = !!Icon
    return (
      <span className="inline-flex items-center gap-1">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="text-primary size-4" />
          ))}
        <span>{label}</span>
      </span>
    )
  }
  const name = columnMeta.displayName.toLowerCase()
  const pluralName = name.endsWith("s") ? `${name}es` : `${name}s`

  const hasOptionIcons = !options?.some((o) => !o.icon)

  return (
    <div className="inline-flex items-center gap-0.5">
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }) => {
          const Icon = icon!
          return isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon key={value} className="size-4" />
          )
        })}
      <span className={cn(hasOptionIcons && "ml-1.5")}>
        {selected.length} {pluralName}
      </span>
    </div>
  )
}

export function FilterValueMultiOptionDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: FilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[]
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null)
  const uniqueVals = uniq(columnVals)

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    )
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    )
  }

  const filter = column.getFilterValue() as FilterModel<"multiOption", TData>
  const selected = options.filter((o) => filter?.values[0].includes(o.value))

  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0]
    const hasIcon = !!Icon
    return (
      <span className="inline-flex items-center gap-1.5">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="text-primary size-4" />
          ))}

        <span>{label}</span>
      </span>
    )
  }

  const name = columnMeta.displayName.toLowerCase()

  const hasOptionIcons = !columnMeta.options?.some((o) => !o.icon)

  return (
    <div className="inline-flex items-center gap-1.5">
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {take(selected, 3).map(({ value, icon }) => {
            const Icon = icon!
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: value })
            ) : (
              <Icon key={value} className="size-4" />
            )
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  )
}

function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth()
  const sameYear = start.getFullYear() === end.getFullYear()

  if (sameMonth && sameYear) {
    return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`
  }

  if (sameYear) {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
  }

  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`
}

export function FilterValueDateDisplay<TData, TValue>({
  column,
}: FilterValueDisplayProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"date", TData>)
    : undefined

  if (!filter) return null
  if (filter.values.length === 0) return <RiMoreLine className="size-4" />
  if (filter.values.length === 1) {
    const value = filter.values[0]

    const formattedDateStr = format(value, "MMM d, yyyy")

    return <span>{formattedDateStr}</span>
  }

  const formattedRangeStr = formatDateRange(filter.values[0], filter.values[1])

  return <span>{formattedRangeStr}</span>
}

export function FilterValueTextDisplay<TData, TValue>({
  column,
}: FilterValueDisplayProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"text", TData>)
    : undefined

  if (!filter) return null
  if (filter.values.length === 0 || filter.values[0].trim() === "")
    return <RiMoreLine className="size-4" />

  const value = filter.values[0]

  return <span>{value}</span>
}

export function FilterValueNumberDisplay<TData, TValue>({
  column,
  columnMeta,
}: FilterValueDisplayProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max
  const cappedMax = maxFromMeta ?? 2147483647

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"number", TData>)
    : undefined

  if (!filter) return null

  if (
    filter.operator === "is between" ||
    filter.operator === "is not between"
  ) {
    const minValue = filter.values[0]
    const maxValue =
      filter.values[1] === Number.POSITIVE_INFINITY ||
      filter.values[1] >= cappedMax
        ? `${cappedMax}+`
        : filter.values[1]

    return (
      <span className="tabular-nums tracking-tight">
        {minValue} and {maxValue}
      </span>
    )
  }

  if (!filter.values || filter.values.length === 0) {
    return null
  }

  const value = filter.values[0]
  return <span className="tabular-nums tracking-tight">{value}</span>
}

export function FitlerValueController<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: {
  id: string
  column: Column<TData>
  columnMeta: ColumnMeta<TData, TValue>
  table: Table<TData>
}) {
  switch (columnMeta.type) {
    case "option":
      return (
        <FilterValueOptionController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "multiOption":
      return (
        <FilterValueMultiOptionController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "date":
      return (
        <FilterValueDateController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "text":
      return (
        <FilterValueTextController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    case "number":
      return (
        <FilterValueNumberController
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      )
    default:
      return null
  }
}

interface ProperFilterValueMenuProps<TData, TValue> {
  id: string
  column: Column<TData>
  columnMeta: ColumnMeta<TData, TValue>
  table: Table<TData>
}

export function FilterValueOptionController<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"option", TData>)
    : undefined

  let options: ColumnOption[]
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null)
  const uniqueVals = uniq(columnVals)

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    )
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    )
  }

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce(
    (acc, curr) => {
      const { value } = columnMeta.transformOptionFn
        ? columnMeta.transformOptionFn(curr as ElementType<NonNullable<TValue>>)
        : { value: curr as string }

      acc[value] = (acc[value] ?? 0) + 1
      return acc
    },
    {} as Record<ColumnOption["value"], number>
  )

  function handleOptionSelect(value: string, check: boolean) {
    if (check)
      column?.setFilterValue(
        (old: undefined | FilterModel<"option", TData>) => {
          if (!old || old.values.length === 0)
            return {
              operator: "is",
              values: [value],
              columnMeta: column.columnDef.meta,
            } satisfies FilterModel<"option", TData>

          const newValues = [...old.values, value]

          return {
            operator: "is any of",
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterModel<"option", TData>
        }
      )
    else
      column?.setFilterValue(
        (old: undefined | FilterModel<"option", TData>) => {
          if (!old || old.values.length <= 1) return undefined

          const newValues = old.values.filter((v) => v !== value)
          return {
            operator: newValues.length > 1 ? "is any of" : "is",
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterModel<"option", TData>
        }
      )
  }

  return (
    <Command
      className={cn(
        "divide-y divide-stroke-soft-200",
        "grid min-h-0 auto-cols-auto grid-flow-row",
        "[&>[cmdk-label]+*]:!border-t-0"
      )}
      loop
    >
      <div className="group/cmd-input flex h-12 w-full items-center gap-2 px-5">
        <RiSearch2Line
          className={cn(
            "size-5 shrink-0 text-text-soft-400",
            "transition duration-200 ease-out",
            // focus within
            "group-focus-within/cmd-input:text-primary-base"
          )}
        />
        <CommandMenu.Input autoFocus placeholder="Search..." />
      </div>
      {/* <CommandMenu.Empty>No results.</CommandMenu.Empty> */}
      <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
        <CommandMenu.Group>
          {options.map((v) => {
            const checked = Boolean(filter?.values.includes(v.value))
            const count = optionsCount[v.value] ?? 0

            return (
              <CommandMenu.Item
                key={v.value}
                onSelect={() => {
                  handleOptionSelect(v.value, !checked)
                }}
                className="group flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Checkbox.Root
                    checked={checked}
                    className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                  />
                  {v.icon &&
                    (isValidElement(v.icon) ? (
                      v.icon
                    ) : (
                      <v.icon className="text-primary size-4" />
                    ))}
                  <span>
                    {v.label}
                    <sup
                      className={cn(
                        "text-muted-foreground ml-0.5 tabular-nums tracking-tight",
                        count === 0 && "slashed-zero"
                      )}
                    >
                      {count < 100 ? count : "100+"}
                    </sup>
                  </span>
                </div>
              </CommandMenu.Item>
            )
          })}
        </CommandMenu.Group>
      </CommandMenu.List>
    </Command>
  )
}

export function FilterValueMultiOptionController<
  TData extends RowData,
  TValue,
>({
  id,
  column,
  columnMeta,
  table,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue() as
    | FilterModel<"multiOption", TData>
    | undefined

  let options: ColumnOption[]
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null)
  const uniqueVals = uniq(columnVals)

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    )
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    )
  }

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce(
    (acc, curr) => {
      const value = columnMeta.options
        ? (curr as string)
        : columnMeta.transformOptionFn!(
            curr as ElementType<NonNullable<TValue>>
          ).value

      acc[value] = (acc[value] ?? 0) + 1
      return acc
    },
    {} as Record<ColumnOption["value"], number>
  )

  // Handles the selection/deselection of an option
  function handleOptionSelect(value: string, check: boolean) {
    if (check) {
      column.setFilterValue(
        (old: undefined | FilterModel<"multiOption", TData>) => {
          if (
            !old ||
            old.values.length === 0 ||
            !old.values[0] ||
            old.values[0].length === 0
          )
            return {
              operator: "include",
              values: [[value]],
              columnMeta: column.columnDef.meta,
            } satisfies FilterModel<"multiOption", TData>

          const newValues = [uniq([...old.values[0], value])]

          return {
            operator: determineNewOperator(
              "multiOption",
              old.values,
              newValues,
              old.operator
            ),
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterModel<"multiOption", TData>
        }
      )
    } else
      column.setFilterValue(
        (old: undefined | FilterModel<"multiOption", TData>) => {
          if (!old?.values[0] || old.values[0].length <= 1) return undefined

          const newValues = [
            uniq([...old.values[0], value]).filter((v) => v !== value),
          ]

          return {
            operator: determineNewOperator(
              "multiOption",
              old.values,
              newValues,
              old.operator
            ),
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterModel<"multiOption", TData>
        }
      )
  }

  return (
    <Command
      className={cn(
        "divide-y divide-stroke-soft-200",
        "grid min-h-0 auto-cols-auto grid-flow-row",
        "[&>[cmdk-label]+*]:!border-t-0"
      )}
      loop
    >
      <div className="group/cmd-input flex h-12 w-full items-center gap-2 px-5">
        <RiSearch2Line
          className={cn(
            "size-5 shrink-0 text-text-soft-400",
            "transition duration-200 ease-out",
            // focus within
            "group-focus-within/cmd-input:text-primary-base"
          )}
        />
        <CommandMenu.Input autoFocus placeholder="Search..." />
      </div>
      {/* <CommandEmpty>No results.</CommandEmpty> */}
      <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
        <CommandMenu.Group>
          {options.map((v) => {
            const checked = Boolean(filter?.values[0]?.includes(v.value))
            const count = optionsCount[v.value] ?? 0

            return (
              <CommandMenu.Item
                key={v.value}
                onSelect={() => {
                  handleOptionSelect(v.value, !checked)
                }}
                className="group flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Checkbox.Root
                    checked={checked}
                    className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                  />
                  {v.icon &&
                    (isValidElement(v.icon) ? (
                      v.icon
                    ) : (
                      <v.icon className="text-primary size-4" />
                    ))}
                  <span>
                    {v.label}
                    <sup
                      className={cn(
                        "text-muted-foreground ml-0.5 tabular-nums tracking-tight",
                        count === 0 && "slashed-zero"
                      )}
                    >
                      {count < 100 ? count : "100+"}
                    </sup>
                  </span>
                </div>
              </CommandMenu.Item>
            )
          })}
        </CommandMenu.Group>
      </CommandMenu.List>
    </Command>
  )
}

export function FilterValueDateController<TData, TValue>({
  column,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"date", TData>)
    : undefined

  const [date, setDate] = useState<DateRange | undefined>({
    from: filter?.values[0] ?? new Date(),
    to: filter?.values[1] ?? undefined,
  })

  function changeDateRange(value: DateRange | undefined) {
    const start = value?.from
    const end =
      start && value && value.to && !isEqual(start, value.to)
        ? value.to
        : undefined

    setDate({ from: start, to: end })

    const isRange = start && end

    const newValues = isRange ? [start, end] : start ? [start] : []

    column.setFilterValue((old: undefined | FilterModel<"date", TData>) => {
      if (!old || old.values.length === 0)
        return {
          operator: newValues.length > 1 ? "is between" : "is",
          values: newValues,
          columnMeta: column.columnDef.meta,
        } satisfies FilterModel<"date", TData>

      return {
        operator:
          old.values.length < newValues.length
            ? "is between"
            : old.values.length > newValues.length
              ? "is"
              : old.operator,
        values: newValues,
        columnMeta: column.columnDef.meta,
      } satisfies FilterModel<"date", TData>
    })
  }

  return (
    <Command
      className={cn(
        "divide-y divide-stroke-soft-200",
        "grid min-h-0 auto-cols-auto grid-flow-row",
        "[&>[cmdk-label]+*]:!border-t-0"
      )}
    >
      {/* <CommandInput placeholder="Search..." /> */}
      {/* <CommandEmpty>No results.</CommandEmpty> */}
      <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
        <CommandMenu.Group>
          <div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={changeDateRange}
              numberOfMonths={1}
            />
          </div>
        </CommandMenu.Group>
      </CommandMenu.List>
    </Command>
  )
}

export function FilterValueTextController<TData, TValue>({
  column,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"text", TData>)
    : undefined

  const changeText = (value: string | number) => {
    column.setFilterValue((old: undefined | FilterModel<"text", TData>) => {
      if (!old || old.values.length === 0)
        return {
          operator: "contains",
          values: [String(value)],
          columnMeta: column.columnDef.meta,
        } satisfies FilterModel<"text", TData>
      return { operator: old.operator, values: [String(value)] }
    })
  }

  return (
    <Command
      className={cn(
        "divide-y divide-stroke-soft-200",
        "grid min-h-0 auto-cols-auto grid-flow-row",
        "[&>[cmdk-label]+*]:!border-t-0"
      )}
    >
      <CommandMenu.List className="h-full max-h-96 overflow-y-auto">
        <CommandMenu.Group>
          <CommandMenu.Item>
            <DebouncedInput
              placeholder="Search..."
              autoFocus
              value={filter?.values[0] ?? ""}
              onChange={changeText}
            />
          </CommandMenu.Item>
        </CommandMenu.Group>
      </CommandMenu.List>
    </Command>
  )
}

export function FilterValueNumberController<TData, TValue>({
  table,
  column,
  columnMeta,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max
  const cappedMax = maxFromMeta ?? Number.MAX_SAFE_INTEGER

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterModel<"number", TData>)
    : undefined

  const isNumberRange =
    !!filter && numberFilterDetails[filter.operator].target === "multiple"

  const [datasetMin] = column.getFacetedMinMaxValues() ?? [0, 0]

  const initialValues = () => {
    if (filter?.values) {
      return filter.values.map((val) =>
        val >= cappedMax ? `${cappedMax}+` : val.toString()
      )
    }
    return [datasetMin.toString()]
  }

  const [inputValues, setInputValues] = useState<string[]>(initialValues)

  const changeNumber = (value: number[]) => {
    const sortedValues = [...value].sort((a, b) => a - b)

    column.setFilterValue((old: undefined | FilterModel<"number", TData>) => {
      if (!old || old.values.length === 0) {
        return {
          operator: "is",
          values: sortedValues,
        }
      }

      const operator = numberFilterDetails[old.operator]
      let newValues: number[]

      if (operator.target === "single") {
        newValues = [sortedValues[0]]
      } else {
        newValues = [
          sortedValues[0] >= cappedMax ? cappedMax : sortedValues[0],
          sortedValues[1] >= cappedMax
            ? Number.POSITIVE_INFINITY
            : sortedValues[1],
        ]
      }

      return {
        operator: old.operator,
        values: newValues,
      }
    })
  }

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues]
    if (isNumberRange && Number.parseInt(value, 10) >= cappedMax) {
      newValues[index] = `${cappedMax}+`
    } else {
      newValues[index] = value
    }

    setInputValues(newValues)

    const parsedValues = newValues.map((val) => {
      if (val.trim() === "") return 0
      if (val === `${cappedMax}+`) return cappedMax
      return Number.parseInt(val, 10)
    })

    changeNumber(parsedValues)
  }

  const changeType = (type: "single" | "range") => {
    column.setFilterValue((old: undefined | FilterModel<"number", TData>) => {
      if (type === "single") {
        return {
          operator: "is",
          values: [old?.values[0] ?? 0],
        }
      }
      const newMaxValue = old?.values[0] ?? cappedMax
      return {
        operator: "is between",
        values: [0, newMaxValue],
      }
    })

    if (type === "single") {
      setInputValues([inputValues[0]])
    } else {
      const maxValue = inputValues[0] || cappedMax.toString()
      setInputValues(["0", maxValue])
    }
  }

  const slider = {
    value: inputValues.map((val) =>
      val === "" || val === `${cappedMax}+`
        ? cappedMax
        : Number.parseInt(val, 10)
    ),
    onValueChange: (value: number[]) => {
      const values = value.map((val) => (val >= cappedMax ? cappedMax : val))
      setInputValues(
        values.map((v) => (v >= cappedMax ? `${cappedMax}+` : v.toString()))
      )
      changeNumber(values)
    },
  }

  return (
    <Command
      className={cn(
        "divide-y divide-stroke-soft-200",
        "grid min-h-0 auto-cols-auto grid-flow-row",
        "[&>[cmdk-label]+*]:!border-t-0"
      )}
    >
      <CommandMenu.List className="w-[300px] px-2 py-2">
        <CommandMenu.Group>
          <div className="flex w-full flex-col">
            <SegmentedControl.Root
              value={isNumberRange ? "range" : "single"}
              onValueChange={(v) =>
                changeType(v === "range" ? "range" : "single")
              }
            >
              <SegmentedControl.List className="*:text-xs w-full">
                <SegmentedControl.Trigger value="single">
                  Single
                </SegmentedControl.Trigger>
                <SegmentedControl.Trigger value="range">
                  Range
                </SegmentedControl.Trigger>
              </SegmentedControl.List>
              <SegmentedControl.Content
                value="single"
                className="mt-4 flex flex-col gap-4"
              >
                <Slider.Root
                  value={[Number(inputValues[0])]}
                  onValueChange={(value) => {
                    handleInputChange(0, value[0].toString())
                  }}
                  min={datasetMin}
                  max={cappedMax}
                  step={1}
                  aria-orientation="horizontal"
                >
                  <Slider.Thumb />
                </Slider.Root>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Value</span>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id="single"
                        type="number"
                        value={inputValues[0]}
                        onChange={(e) => handleInputChange(0, e.target.value)}
                        max={cappedMax}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {/* <Input
                    id="single"
                    type="number"
                    value={inputValues[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                    max={cappedMax}
                  /> */}
                </div>
              </SegmentedControl.Content>
              <SegmentedControl.Content
                value="range"
                className="mt-4 flex flex-col gap-4"
              >
                <Slider.Root
                  value={slider.value}
                  onValueChange={slider.onValueChange}
                  min={datasetMin}
                  max={cappedMax}
                  step={1}
                  aria-orientation="horizontal"
                >
                  <Slider.Thumb />
                  <Slider.Thumb />
                </Slider.Root>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Min</span>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="number"
                          value={inputValues[0]}
                          onChange={(e) => handleInputChange(0, e.target.value)}
                          max={cappedMax}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Max</span>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="text"
                          value={inputValues[1]}
                          placeholder={`${cappedMax}+`}
                          onChange={(e) => handleInputChange(1, e.target.value)}
                          max={cappedMax}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                </div>
              </SegmentedControl.Content>
            </SegmentedControl.Root>
          </div>
        </CommandMenu.Group>
      </CommandMenu.List>
    </Command>
  )
}

export default TableFilters
