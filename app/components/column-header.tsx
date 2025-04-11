import type { Column } from "@tanstack/react-table"

interface Props<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

function ColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: Props<TData, TValue>) {
  return <div>x</div>
}
export default ColumnHeader
