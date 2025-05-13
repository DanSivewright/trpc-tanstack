import { useTRPC } from "@/integrations/trpc/react"
import type { interactionsCountForCollectionGroupSchema } from "@/integrations/trpc/routers/communities/queries"
import { cn } from "@/utils/cn"
import { type VariantProps } from "@/utils/tv"
import {
  RiHeartFill,
  RiHeartLine,
  RiLoaderLine,
  type RemixiconComponentType,
} from "@remixicon/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"

type Props = z.infer<typeof interactionsCountForCollectionGroupSchema> &
  VariantProps<typeof buttonVariants> & {
    iconLine?: RemixiconComponentType
    iconFill?: RemixiconComponentType
    hideText?: boolean
  }
const LikesButton: React.FC<Omit<Props, "interactionType">> = ({
  collectionGroup,
  collectionGroupDocId,
  communityId,
  mode = "stroke",
  size = "xxsmall",
  variant = "neutral",
  iconLine = RiHeartLine,
  iconFill = RiHeartFill,
  hideText = false,
}) => {
  const interactionType = "likes"
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const queryClient = useQueryClient()

  const handleLikeMutation = useMutation({
    ...trpc.communities.handleLike.mutationOptions(),
    onMutate: async (newLike) => {
      await queryClient.cancelQueries({
        queryKey:
          trpc.communities.interactionsCountForCollectionGroup.queryOptions({
            collectionGroup,
            collectionGroupDocId,
            interactionType,
            communityId,
          }).queryKey,
      })

      queryClient.setQueryData(
        trpc.communities.interactionsCountForCollectionGroup.queryOptions({
          collectionGroup,
          collectionGroupDocId,
          interactionType,
          communityId,
        }).queryKey,
        (old) => ({
          ...old,
          total: newLike?.id ? (old?.total || 1) - 1 : (old?.total || 0) + 1,
          byMe: newLike?.id ? false : true,
          id: newLike?.id || null,
        })
      )
      return undefined
    },
    onError: (_, previousLikesCount) => {
      queryClient.setQueryData(
        trpc.communities.interactionsCountForCollectionGroup.queryOptions({
          collectionGroup,
          interactionType,
          collectionGroupDocId,
          communityId,
        }).queryKey,
        // @ts-ignore
        previousLikesCount
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey:
          trpc.communities.interactionsCountForCollectionGroup.queryOptions({
            collectionGroup,
            collectionGroupDocId,
            communityId,
            interactionType,
          }).queryKey,
      })
    },
  })

  const likesCount = useQuery(
    trpc.communities.interactionsCountForCollectionGroup.queryOptions({
      collectionGroup,
      collectionGroupDocId,
      interactionType,
      communityId,
    })
  )

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button.Root
          disabled={me.isLoading || handleLikeMutation.isPending}
          onClick={() => {
            handleLikeMutation.mutate({
              id: likesCount.data?.id || null,
              authorUid: me.data?.uid || "",
              author: {
                id: me.data?.uid || "",
                name: `${me.data?.firstName} ${me.data?.lastName}` || "",
                avatarUrl: me.data?.imageUrl || "",
              },
              collectionGroup,
              collectionGroupDocId,
              communityId,
              createdAt: new Date().toISOString(),
            })
          }}
          variant={variant}
          mode={mode}
          size={size}
        >
          <Button.Icon
            className={cn(
              likesCount.data?.byMe && "fill-primary-base",
              handleLikeMutation.isPending && "animate-spin"
            )}
            as={
              handleLikeMutation.isPending
                ? RiLoaderLine
                : likesCount.data?.byMe
                  ? iconFill
                  : iconLine
            }
          />
          {!hideText && <>Likes </>}
          {likesCount?.data?.total && likesCount?.data?.total > 0
            ? likesCount.data?.total
            : 0}
        </Button.Root>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">Likes</Tooltip.Content>
    </Tooltip.Root>
  )
}
export default LikesButton
