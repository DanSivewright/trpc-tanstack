import { useTRPC } from "@/integrations/trpc/react"
import { RiLoaderLine, RiRefreshLine } from "@remixicon/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CompactButton } from "./ui/compact-button"

type Props = {}
const CacheBuster: React.FC<Props> = ({}) => {
  if (process.env.NODE_ENV === "production") return null
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const cacheBuster = useMutation({
    ...trpc.cache.bust.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries()

      return undefined
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })
  return (
    <CompactButton.Root
      disabled={cacheBuster.isPending}
      onClick={() => {
        cacheBuster.mutate()
      }}
      className="fixed bottom-2 left-16 z-50"
    >
      <CompactButton.Icon
        className={cacheBuster.isPending ? "animate-spin" : ""}
        as={cacheBuster.isPending ? RiLoaderLine : RiRefreshLine}
      />
    </CompactButton.Root>
  )
}
export default CacheBuster
