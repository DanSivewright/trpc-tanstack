import { useEffect, useRef } from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import * as Checkbox from "@/components/ui/checkbox"

type Props = {
  indeterminate?: boolean
  className?: string
} & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
const IndeterminateCheckbox: React.FC<Props> = ({
  className,
  indeterminate,
  ...rest
}) => {
  const ref = useRef<any>(null!)

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <Checkbox.Root
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  )
}
export default IndeterminateCheckbox
