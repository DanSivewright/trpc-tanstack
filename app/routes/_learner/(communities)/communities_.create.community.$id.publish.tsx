import { useCallback, useMemo, useState } from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { cn } from "@/utils/cn"
import { formatBytes } from "@/utils/format-bytes"
import {
  RiDeleteBinLine,
  RiExpandDiagonalLine,
  RiImageAddLine,
  RiImageEditLine,
  RiInformationFill,
  RiLoaderLine,
} from "@remixicon/react"
import { useForm, useStore } from "@tanstack/react-form"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useDropzone, type FileWithPath } from "react-dropzone"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import * as Avatar from "@/components/ui/avatar"
import * as AvatarGroupCompact from "@/components/ui/avatar-group-compact"
import * as Badge from "@/components/ui/badge"
import * as Button from "@/components/ui/button"
import * as CompactButton from "@/components/ui/compact-button"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Hint from "@/components/ui/hint"
import * as Modal from "@/components/ui/modal"
import * as Switch from "@/components/ui/switch"
import * as Tooltip from "@/components/ui/tooltip"
import { DotPattern } from "@/components/dot-pattern"
import FieldInfo from "@/components/field-info"
import { Grid } from "@/components/grid"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create/community/$id/publish"
)({
  loader: async ({ context, params: { id } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.communities.detail.queryOptions({
        id,
      })
    )
    return {
      step: "publish",
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { notification } = useNotification()
  const navigate = useNavigate()
  const { step } = Route.useLoaderData()

  const MAX_FILES = 5
  const MAX_SIZE = 5 * 1024 * 1024
  const FILE_TYPES = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
  // const [files, setFiles] = useState<File[]>([])

  const qc = useQueryClient()
  const trpc = useTRPC()

  const community = useSuspenseQuery(
    trpc.communities.detail.queryOptions({
      id,
    })
  )
  const updateCommunity = useMutation(trpc.communities.update.mutationOptions())

  const schema = z.object({
    files: z
      .array(
        z
          .object({
            file: z.instanceof(File),
            isLogo: z.boolean(),
            isCover: z.boolean(),
          })
          .or(
            z.object({
              path: z.string(),
              isLogo: z.boolean(),
              isCover: z.boolean(),
            })
          )
      )
      .min(2, { message: "At least 2 files are required" })
      .max(MAX_FILES, { message: `Maximum ${MAX_FILES} files allowed` }),
  })

  const defaultFiles = [
    ...(
      community?.data?.featureImages?.filter(
        (x) =>
          x !== community?.data?.featureImageUrl &&
          x !== community?.data?.logoUrl
      ) ?? []
    ).map((x) => ({
      path: x,
      isLogo: false,
      isCover: false,
    })),
    ...(community?.data?.featureImageUrl
      ? [
          {
            path: community?.data?.featureImageUrl,
            isLogo: false,
            isCover: true,
          },
        ]
      : []),
    ...(community?.data?.logoUrl
      ? [
          {
            path: community?.data?.logoUrl,
            isLogo: true,
            isCover: false,
          },
        ]
      : []),
  ]
  const form = useForm({
    defaultValues: {
      files: defaultFiles || [],
    } as z.infer<typeof schema>,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async (data) => {
      console.log("data:::", data)
    },
  })

  const files = useStore(form.store, (state) => state.values.files)

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const totalFiles = files.length + acceptedFiles.length

      if (totalFiles > MAX_FILES) {
        console.log("totalFiles error:::", totalFiles)
        const diff = totalFiles - MAX_FILES
        notification({
          title: "File Upload Limit Exceeded",
          description: `Maximum ${MAX_FILES} files allowed. ${diff} file${
            diff === 1 ? "" : "s"
          } rejected.`,
        })
        if (files.length < MAX_FILES) {
          const diff = MAX_FILES - files.length
          const newFiles = [
            ...form.getFieldValue("files"),
            ...acceptedFiles.slice(0, diff).map((x) => ({
              file: x,
              isLogo: false,
              isCover: false,
            })),
          ]

          if (!newFiles.some((x) => x.isCover)) {
            newFiles[0].isCover = true
          }

          if (!newFiles.some((x) => x.isLogo)) {
            newFiles[1].isLogo = true
          }

          form.setFieldValue("files", newFiles)
        }
        return
      }

      const newFiles = [
        ...form.getFieldValue("files"),
        ...acceptedFiles.map((x) => ({
          file: x,
          isLogo: false,
          isCover: false,
        })),
      ]

      if (!newFiles.some((x) => x.isCover)) {
        newFiles[0].isCover = true
      }

      if (!newFiles.some((x) => x.isLogo)) {
        const fileAtAtIndexOne = newFiles?.[1]
        if (fileAtAtIndexOne) {
          newFiles[1].isLogo = true
        } else {
          newFiles[0].isLogo = true
        }
      }

      form.setFieldValue("files", [...newFiles])
    },
    [files.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": FILE_TYPES,
    },
    maxSize: MAX_SIZE,
    // maxFiles: MAX_FILES,
    onDropRejected: (fileRejections) => {
      // Group rejections by error type
      const sizeErrors = fileRejections.filter((r) =>
        r.errors.some((e) => e.code === "file-too-large")
      )
      const typeErrors = fileRejections.filter((r) =>
        r.errors.some((e) => e.code === "file-invalid-type")
      )

      if (sizeErrors.length > 0) {
        console.log("sizeErrors error:::", sizeErrors)
        notification({
          title: "Files Too Large",
          description: `${sizeErrors.length} file${
            sizeErrors.length === 1 ? " exceeds" : "s exceed"
          } the ${(MAX_SIZE / (1024 * 1024)).toFixed(1)}MB size limit.`,
        })
      }

      if (typeErrors.length > 0) {
        console.log("typeErrors error:::", typeErrors)
        notification({
          title: "Invalid File Type",
          description: `Only ${FILE_TYPES.join(", ")} file${
            FILE_TYPES.length === 1 ? " is" : "s are"
          } allowed. ${typeErrors.length} file${
            typeErrors.length === 1 ? " was" : "s were"
          } rejected.`,
        })
      }
    },
  })

  const coverPreview = useMemo(() => {
    // if (!files || ) return null
    const cover = files?.find((x) => x.isCover)
    if (!cover) return null
    if ("path" in cover) {
      return cover.path
    }
    return URL.createObjectURL(cover.file)
  }, [files])

  const logoPreview = useMemo(() => {
    const logo = files?.find((x) => x.isLogo)
    if (!logo) return null
    if ("path" in logo) {
      return logo.path
    }
    return URL.createObjectURL(logo.file)
  }, [files])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex h-[calc(100dvh-93px)] w-screen overflow-hidden bg-bg-white-0"
    >
      <div className="h-full w-1/2 p-2">
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-20 bg-bg-weak-50 px-6">
          <DotPattern
            className={cn(
              "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
              "translate-x-[5%] translate-y-[15%]",
              "opacity-25"
            )}
          />
          <div className="mx-auto flex h-full w-full max-w-[500px] flex-col items-start justify-center gap-4">
            <header className="flex flex-col gap-1">
              <h2 className="text-title-h6 font-normal">Preview</h2>
              <p className="text-body-sm font-light text-text-soft-400">
                This is how your community will appear.
              </p>
            </header>

            <div className="relative z-10 w-full">
              <div className="relative z-10 flex w-full flex-col gap-2 rounded-10 bg-bg-white-0 p-2 drop-shadow-2xl">
                <div
                  className={cn(
                    "aspect-video w-full overflow-hidden rounded-10 object-cover",
                    {
                      "flex items-center justify-center border border-stroke-sub-300 bg-bg-sub-300":
                        !coverPreview,
                    }
                  )}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview ?? undefined}
                      alt="Image Preview"
                      className="h-full w-full rounded-md border object-cover"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <RiImageAddLine className="size-14 fill-text-soft-400" />
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar.Root size="24">
                        {logoPreview ? (
                          <Avatar.Image src={logoPreview ?? undefined} />
                        ) : (
                          <span>{community?.data?.name?.slice(0, 2)}</span>
                        )}
                      </Avatar.Root>
                      <h2 className="line-clamp-2 text-title-h6 font-light">
                        {community?.data?.name}
                      </h2>
                    </div>
                    <p className="line-clamp-3 text-pretty text-subheading-sm font-light text-text-soft-400">
                      {community?.data?.headline}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {community?.data?.tags?.map((t) => (
                        <Badge.Root
                          variant="lighter"
                          size="small"
                          key={community?.data?.id + t}
                        >
                          {t}
                        </Badge.Root>
                      ))}
                    </div>
                  </div>
                  <AvatarGroupCompact.Root
                    size="24"
                    className="bg-bg-weak-50 shadow-regular-sm"
                  >
                    <AvatarGroupCompact.Stack>
                      <Avatar.Root>
                        <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/emma.png" />
                      </Avatar.Root>
                      <Avatar.Root>
                        <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/james.png" />
                      </Avatar.Root>
                      <Avatar.Root>
                        <Avatar.Image src="https://www.alignui.com/images/avatar/illustration/sophia.png" />
                      </Avatar.Root>
                    </AvatarGroupCompact.Stack>
                    <AvatarGroupCompact.Overflow>
                      +9
                    </AvatarGroupCompact.Overflow>
                  </AvatarGroupCompact.Root>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-20 bg-bg-weak-50"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100dvh-93px)] w-1/2 flex-col overflow-y-auto bg-bg-white-0 p-2">
        <div className="mx-auto flex min-h-min w-full max-w-[500px] flex-col gap-4 pt-[25%]">
          <RiImageAddLine className="size-10 fill-primary-base opacity-70" />
          <header className="flex flex-col gap-1.5">
            <h2 className="text-title-h5 font-normal">
              Add your community images
            </h2>
            <p className="text-body-xs font-light text-text-soft-400">
              Showcase your community with quality visuals
            </p>
          </header>

          <form.Field
            name="files"
            mode="array"
            children={(field) => {
              return (
                <>
                  <div className="flex w-full flex-col gap-1">
                    <div
                      className={cn(
                        "flex w-full cursor-pointer flex-col items-center gap-5 rounded-xl border border-dashed border-stroke-sub-300 bg-bg-white-0 p-8 text-center",
                        "transition duration-200 ease-out",
                        "hover:bg-bg-weak-50",
                        {
                          "border-primary-base bg-primary-alpha-24":
                            isDragActive,
                        }
                      )}
                      {...getRootProps()}
                    >
                      <input
                        {...getInputProps()}
                        disabled={files.length >= MAX_FILES}
                        multiple
                        type="file"
                        tabIndex={-1}
                        className="hidden"
                      />
                      <div className="space-y-1.5">
                        <div className="text-label-sm text-text-strong-950">
                          Choose a file or drag & drop it here.
                        </div>
                        <div className="text-paragraph-xs text-text-sub-600">
                          JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
                        </div>
                      </div>
                      <Button.Root
                        disabled={files.length >= MAX_FILES}
                        type="button"
                        size="xxsmall"
                      >
                        Browse Files
                      </Button.Root>
                    </div>
                    <FieldInfo
                      field={field}
                      fallback={`${files.length} ${
                        files.length === 1 ? "file" : "files"
                      }, ${formatBytes(
                        files.reduce((acc, file) => {
                          if ("file" in file) {
                            return acc + file.file.size
                          }
                          return acc
                        }, 0)
                      )}`}
                      fallbackIcon={RiInformationFill}
                    />
                    <div className="flex w-full flex-col gap-2">
                      {field.state.value?.map((fileField, i) => {
                        const name =
                          "path" in fileField
                            ? fileField.path
                            : fileField.file.name
                        const previewImage =
                          "path" in fileField
                            ? fileField.path
                            : URL.createObjectURL(fileField.file)
                        return (
                          <div
                            key={name + i}
                            className="group flex w-full flex-row items-center justify-between rounded-lg border p-1 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={previewImage ?? undefined}
                                alt="Preview"
                                className="h-10 w-10 rounded-md border object-cover"
                                style={{ objectFit: "cover" }}
                              />
                              <div className="flex flex-col items-start justify-start">
                                <Tooltip.Root delayDuration={10}>
                                  <Tooltip.Trigger>
                                    <p className="truncate hover:cursor-help">
                                      {name}
                                    </p>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>
                                    <p>{name}</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                                <p className="text-label-xs text-text-soft-400">
                                  {"file" in fileField
                                    ? formatBytes(fileField.file.size)
                                    : "Already uploaded"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                              <form.Field name={`files[${i}].isLogo`}>
                                {(subField) => {
                                  return (
                                    <Tooltip.Root delayDuration={10}>
                                      <Tooltip.Trigger>
                                        <Switch.Root
                                          checked={subField.state.value}
                                          onCheckedChange={(checked) => {
                                            if (!checked) {
                                              notification({
                                                title: "Logo Required",
                                                description:
                                                  "You must set a logo for your community. Click another switch to set it as logo.",
                                                variant: "lighter",
                                                status: "information",
                                              })
                                              return
                                            }
                                            subField.handleChange(checked)

                                            if (checked) {
                                              field.state.value.forEach(
                                                (editFile, editFileIndex) => {
                                                  if (
                                                    editFileIndex !== i &&
                                                    editFile.isLogo
                                                  ) {
                                                    form.setFieldValue(
                                                      `files[${editFileIndex}].isLogo`,
                                                      false
                                                    )
                                                  }
                                                }
                                              )
                                            }
                                          }}
                                        />
                                      </Tooltip.Trigger>
                                      <Tooltip.Content>
                                        <p>Set as logo</p>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  )
                                }}
                              </form.Field>
                              <form.Field name={`files[${i}].isCover`}>
                                {(subField) => {
                                  return (
                                    <Tooltip.Root delayDuration={10}>
                                      <Tooltip.Trigger>
                                        <Switch.Root
                                          checked={subField.state.value}
                                          onCheckedChange={(checked) => {
                                            if (!checked) {
                                              notification({
                                                title: "Cover image Required",
                                                description:
                                                  "You must set a cover for your community. Click another switch to set it as cover.",
                                                variant: "lighter",
                                                status: "information",
                                              })
                                              return
                                            }
                                            subField.handleChange(checked)

                                            if (checked) {
                                              field.state.value.forEach(
                                                (editFile, editFileIndex) => {
                                                  if (
                                                    editFileIndex !== i &&
                                                    editFile.isCover
                                                  ) {
                                                    form.setFieldValue(
                                                      `files[${editFileIndex}].isCover`,
                                                      false
                                                    )
                                                  }
                                                }
                                              )
                                            }
                                          }}
                                        />
                                      </Tooltip.Trigger>
                                      <Tooltip.Content>
                                        <p>Set as cover image</p>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  )
                                }}
                              </form.Field>

                              <CompactButton.Root
                                onClick={() => field.removeValue(i)}
                                variant="ghost"
                              >
                                <CompactButton.Icon
                                  className="size-4 text-warning-base"
                                  as={RiDeleteBinLine}
                                />
                              </CompactButton.Root>
                              <Modal.Root>
                                <Modal.Trigger asChild>
                                  <CompactButton.Root>
                                    <CompactButton.Icon
                                      as={RiExpandDiagonalLine}
                                    />
                                  </CompactButton.Root>
                                </Modal.Trigger>
                                <Modal.Content className="max-w-[440px]">
                                  <Modal.Body className="flex items-start gap-4">
                                    <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center rounded-xl bg-neutral-100">
                                      <img
                                        src={previewImage}
                                        alt="Image Preview"
                                        className="h-full w-full rounded-md border object-cover"
                                        style={{ objectFit: "cover" }}
                                      />
                                    </div>
                                  </Modal.Body>
                                </Modal.Content>
                              </Modal.Root>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            }}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <FancyButton.Root
                variant="primary"
                type="submit"
                disabled={!canSubmit}
                className="mt-4 w-full"
              >
                Publish
                {isSubmitting && (
                  <FancyButton.Icon
                    className={cn(isSubmitting && "animate-spin")}
                    as={RiLoaderLine}
                  />
                )}
              </FancyButton.Root>
            )}
          />
        </div>
      </div>
    </form>
  )
}
