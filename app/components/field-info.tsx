import {
  RiInformationFill,
  type RemixiconComponentType,
} from "@remixicon/react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Hint } from "@/components/ui/hint"

type Props = {
  field: AnyFieldApi
  fallback?: string
  fallbackIcon?: RemixiconComponentType
}
const FieldInfo: React.FC<Props> = ({ field, fallback, fallbackIcon }) => {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <Hint.Root hasError>
          <Hint.Icon as={RiInformationFill} />
          {field.state.meta.errors.map((err) => err.message).join(",")}
        </Hint.Root>
      ) : fallback ? (
        <Hint.Root>
          {fallbackIcon && <Hint.Icon as={fallbackIcon} />}
          {fallback}
        </Hint.Root>
      ) : null}
    </>
  )
}
export default FieldInfo
