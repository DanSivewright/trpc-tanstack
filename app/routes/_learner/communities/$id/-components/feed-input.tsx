import { useCallback, useMemo, useState } from "react"
import { storage } from "@/integrations/firebase/client"
import { useTRPC } from "@/integrations/trpc/react"
import { communityThreadSchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import type { paletteSchema } from "@/integrations/trpc/routers/palette/schemas/palette-schema"
import { cn } from "@/utils/cn"
import { formatBytes } from "@/utils/format-bytes"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiInformationFill,
  RiLoaderLine,
  RiSearchLine,
} from "@remixicon/react"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Vibrant } from "node-vibrant/browser"
import { useDropzone, type FileWithPath } from "react-dropzone"
import { z } from "zod"

import { useNotification } from "@/hooks/use-notification"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CompactButton } from "@/components/ui/compact-button"
import { Divider } from "@/components/ui/divider"
import { FancyButton } from "@/components/ui/fancy-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip } from "@/components/ui/tooltip"
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/expandable"
import FieldInfo from "@/components/field-info"
import type { Option } from "@/components/multi-select"
import MultipleSelector from "@/components/multi-select"

import { communityTags } from "../../create/$id/community"

type Props = {
  width: number
}
const FeedInput: React.FC<Props> = ({ width }) => {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())
  const params = useParams({
    from: "/_learner/communities/$id",
  })
  const { notification } = useNotification()

  const MAX_FILES = 5
  const MAX_SIZE = 5 * 1024 * 1024
  const FILE_TYPES = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
  const VIDEO_TYPES = [".mp4", ".mov"]
  const [isExpanded, setIsExpanded] = useState(false)

  const createThread = useMutation(
    trpc.communities.createThread.mutationOptions()
  )

  const formSchema = communityThreadSchema
    .pick({
      id: true,
      title: true,
      author: true,
      authorUid: true,
      type: true,
      communityId: true,
      status: true,
      accessibile: true,
      tags: true,
    })
    .merge(
      communityThreadSchema
        .pick({
          caption: true,
          meta: true,
        })
        .extend({
          images: z
            .array(
              z.object({
                id: z.string(),
                file: z.instanceof(File).optional().nullable(),
                featured: z.boolean(),
                name: z.string(),
                url: z.string().optional().nullable(),
                path: z.string().optional().nullable(),
                size: z.number().optional().nullable(),
              })
            )
            .max(MAX_FILES, {
              message: `Maximum ${MAX_FILES} images allowed`,
            })
            .optional()
            .nullable(),
        })
        .partial()
    )

  const form = useForm({
    defaultValues: {
      id: "",
      title: "",
      caption: "",
      type: "thread",
      authorUid: me.data?.uid,
      author: {
        id: me.data?.uid,
        name: `${me.data?.firstName} ${me.data?.lastName}`,
        avatarUrl: me.data?.imageUrl,
      },
      communityId: params.id,
      status: "published",
      accessibile: "community",
      tags: [],
      images: [],
      meta: {
        colors: null,
      },
    } as z.infer<typeof formSchema>,
    validators: {
      onSubmit: formSchema,
    },
    onSubmitInvalid: () => {
      notification({
        title: "Invalid Form",
        description: "Please fill in all fields correctly.",
        variant: "lighter",
        status: "error",
      })
    },
    onSubmit: async (data) => {
      const threadId = crypto.randomUUID()

      const { images: formImages, ...rest } = data?.value

      let payload = {
        ...rest,
        id: threadId,
      } as z.infer<typeof formSchema>

      if (formImages && formImages?.length > 0) {
        const uploadedImages = await Promise.all(
          formImages?.map(async (f) => {
            if ("file" in f && f.file) {
              const storageRef = ref(
                storage,
                `communities/${params.id}/${f.name}`
              )
              const uploadTask = await uploadBytes(storageRef, f.file)
              const url = await getDownloadURL(uploadTask.ref)
              return {
                ...f,
                url,
                path: `communities/${params.id}/${f.name}`,
              }
            }
            return f
          })
        )
        const featureImage = uploadedImages.find((x) => x.featured)
        let palette
        if (featureImage && "file" in featureImage && featureImage.file) {
          palette = (await Vibrant.from(URL.createObjectURL(featureImage.file))
            .getPalette()
            .then((p) => ({
              Vibrant: {
                rgb: p.Vibrant?.rgb,
                population: p.Vibrant?.population,
                bodyTextColor: p.Vibrant?.bodyTextColor,
                titleTextColor: p.Vibrant?.titleTextColor,
                hex: p.Vibrant?.hex,
              },
              DarkVibrant: {
                rgb: p.DarkVibrant?.rgb,
                population: p.DarkVibrant?.population,
                bodyTextColor: p.DarkVibrant?.bodyTextColor,
                titleTextColor: p.DarkVibrant?.titleTextColor,
                hex: p.DarkVibrant?.hex,
              },
              LightVibrant: {
                rgb: p.LightVibrant?.rgb,
                population: p.LightVibrant?.population,
                bodyTextColor: p.LightVibrant?.bodyTextColor,
                titleTextColor: p.LightVibrant?.titleTextColor,
                hex: p.LightVibrant?.hex,
              },
              Muted: {
                rgb: p.Muted?.rgb,
                population: p.Muted?.population,
                bodyTextColor: p.Muted?.bodyTextColor,
                titleTextColor: p.Muted?.titleTextColor,
                hex: p.Muted?.hex,
              },
              DarkMuted: {
                rgb: p.DarkMuted?.rgb,
                population: p.DarkMuted?.population,
                bodyTextColor: p.DarkMuted?.bodyTextColor,
                titleTextColor: p.DarkMuted?.titleTextColor,
                hex: p.DarkMuted?.hex,
              },
              LightMuted: {
                rgb: p.LightMuted?.rgb,
                population: p.LightMuted?.population,
                bodyTextColor: p.LightMuted?.bodyTextColor,
                titleTextColor: p.LightMuted?.titleTextColor,
                hex: p.LightMuted?.hex,
              },
            }))) as z.infer<typeof paletteSchema>
        }
        let imagesWithoutFile = uploadedImages.map((f) => ({
          id: f.id,
          featured: f.featured,
          url: f.url,
          name: f.name,
          path: f.path,
          size: f.size,
        }))

        payload.images = imagesWithoutFile
        payload.meta = {
          colors: palette,
        }
      }
      const createdThread = await createThread.mutateAsync(payload)
      console.log(":::", createdThread)

      notification({
        title: "Thread Created",
        description: "Your thread has been created successfully.",
        variant: "lighter",
        status: "success",
      })
      setIsExpanded(false)
      form.reset()
    },
  })

  const images = useStore(form.store, (state) => state.values.images)

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const totalFiles = (images?.length || 0) + acceptedFiles.length

      if (totalFiles > MAX_FILES) {
        const diff = totalFiles - MAX_FILES
        notification({
          title: "File Upload Limit Exceeded",
          description: `Maximum ${MAX_FILES} files allowed. ${diff} file${
            diff === 1 ? "" : "s"
          } rejected.`,
        })

        if (images && images.length < MAX_FILES) {
          const diff = MAX_FILES - images.length
          const newFiles = [
            ...images,
            ...acceptedFiles.slice(0, diff).map((x) => ({
              id: crypto.randomUUID(),
              file: x,
              featured: false,
              url: "",
              name: x.name,
              path: "",
              size: x.size,
            })),
          ]

          if (!newFiles.some((x) => x.featured)) {
            newFiles[0].featured = true
          }

          form.setFieldValue("images", newFiles)
        }
        return
      }

      const newFiles = [
        ...(form.getFieldValue("images") || []),
        ...acceptedFiles.map((x) => ({
          id: crypto.randomUUID(),
          file: x,
          featured: false,
          url: "",
          name: x.name,
          path: "",
          size: x.size,
        })),
      ]

      if (!newFiles.some((x) => x.featured)) {
        newFiles[0].featured = true
      }

      form.setFieldValue("images", newFiles)
    },
    [images]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": FILE_TYPES,
      "video/*": VIDEO_TYPES,
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

  const getPreviewImage = useCallback((fileField: any) => {
    if ("file" in fileField && fileField.file) {
      return URL.createObjectURL(fileField.file)
    }
    return fileField.url
  }, [])
  const preViewImages = useMemo(() => {
    return images?.map((image) => getPreviewImage(image))
  }, [images])

  const tags: Option[] = communityTags.map((tag) => ({
    label: tag.title,
    value: tag.title,
  }))

  return (
    <Expandable
      expanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      expandDirection="vertical"
      expandBehavior="replace"
      //   initialDelay={0.2}
    >
      {({ isExpanded }) => (
        <ExpandableCard
          className="relative w-full"
          collapsedSize={{ width: width }}
          expandedSize={{ width: width }}
          hoverToExpand={false}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <ExpandableCardContent className="p-0">
              <div className="flex w-full items-center">
                <form.Field name="title">
                  {(field) => (
                    <Input.Root
                      className={cn(
                        "relative z-10 w-[calc(100%-38px)] shadow-none before:ring-0",
                        {
                          "rounded-bl-none": isExpanded,
                        }
                      )}
                    >
                      <Input.Wrapper className="">
                        <Input.Icon as={RiSearchLine} />
                        <Input.Field
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          value={field.state.value}
                          type="text"
                          placeholder="What's on your mind?"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  )}
                </form.Field>

                <ExpandableTrigger itemType="button">
                  <FancyButton.Root
                    type="button"
                    className="relative z-0 -ml-[5px] w-[calc(100%+10px)] rounded-l-none"
                    size="small"
                    variant="neutral"
                  >
                    <FancyButton.Icon as={RiAddLine} />
                  </FancyButton.Root>
                </ExpandableTrigger>
              </div>

              <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                <Divider.Root variant="solid-text">
                  Configure Your Post
                </Divider.Root>
                <div className="flex flex-col gap-8 px-5 pb-8 pt-4">
                  <form.Field name="title">
                    {(field) => {
                      return (
                        <div className="flex flex-col gap-2">
                          <Label.Root htmlFor={field.name}>
                            Post Title
                            <Label.Asterisk />
                          </Label.Root>
                          <Input.Root>
                            <Input.Wrapper>
                              <Input.Field
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                value={field.state.value}
                                placeholder="Give your post a title"
                                type="text"
                              />
                            </Input.Wrapper>
                          </Input.Root>
                          <FieldInfo field={field} />
                        </div>
                      )
                    }}
                  </form.Field>
                  <form.Field name="caption">
                    {(field) => {
                      return (
                        <div className="flex flex-col gap-2">
                          <Label.Root htmlFor={field.name}>
                            Post Caption
                            <Label.Asterisk />
                          </Label.Root>
                          <Textarea.Root
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                            placeholder="Describe your post in 1 - 2 sentences"
                            rows={5}
                          >
                            <Textarea.CharCounter
                              current={field.state.value?.length}
                              max={1000}
                            />
                          </Textarea.Root>

                          <FieldInfo field={field} />
                        </div>
                      )
                    }}
                  </form.Field>

                  <form.Field name="tags" mode="array">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <Label.Root>Tags</Label.Root>
                        <MultipleSelector
                          commandProps={{
                            label: "Select tags",
                          }}
                          onChange={(value) => {
                            field.setValue(value.map((tag) => tag.value))
                          }}
                          value={field.state.value?.map((tag) => ({
                            label: tag,
                            value: tag,
                          }))}
                          defaultOptions={tags}
                          placeholder="Select tags"
                          hidePlaceholderWhenSelected
                          emptyIndicator={
                            <p className="text-sm text-center">No tags found</p>
                          }
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field
                    name="images"
                    mode="array"
                    children={(field) => {
                      return (
                        <>
                          <div className="flex w-full flex-col gap-1">
                            <Label.Root htmlFor={field.name}>
                              Post Images
                              <Label.Asterisk />
                            </Label.Root>
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
                                disabled={
                                  images && images?.length >= MAX_FILES
                                    ? true
                                    : false
                                }
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
                                disabled={
                                  images && images?.length >= MAX_FILES
                                    ? true
                                    : false
                                }
                                type="button"
                                size="xxsmall"
                              >
                                Browse Files
                              </Button.Root>
                            </div>
                            <FieldInfo
                              field={field}
                              fallback={`${images?.length} ${
                                images?.length === 1 ? "file" : "files"
                              }, ${formatBytes(
                                images?.reduce((acc, file) => {
                                  return acc + (file.size || 0)
                                }, 0) || 0
                              )}`}
                              fallbackIcon={RiInformationFill}
                            />
                            <div className="flex w-full flex-wrap items-center gap-2">
                              {field.state.value?.map((fileField, i) => {
                                const name = fileField.name
                                const previewImage =
                                  preViewImages?.[i] ?? undefined

                                return (
                                  <Tooltip.Root
                                    delayDuration={0}
                                    key={name + i}
                                  >
                                    <Tooltip.Trigger type="button">
                                      <div>
                                        <img
                                          src={previewImage ?? undefined}
                                          alt="Preview"
                                          className={cn(
                                            "h-10 w-10 rounded-md object-cover",
                                            {
                                              "outline outline-2 outline-primary-base":
                                                fileField.featured,
                                            }
                                          )}
                                          style={{ objectFit: "cover" }}
                                        />
                                      </div>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content
                                      variant="light"
                                      size="medium"
                                    >
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={previewImage ?? undefined}
                                          alt="Preview"
                                          className="h-10 w-10 rounded-md object-cover"
                                          style={{ objectFit: "cover" }}
                                        />
                                        <div>
                                          <div className="text-text-strong-950">
                                            {name}
                                          </div>
                                          <div className="mt-1 flex items-center gap-2">
                                            <form.Field
                                              name={`images[${i}].featured`}
                                            >
                                              {(subField) => {
                                                return (
                                                  <div className="flex items-center gap-2">
                                                    <Checkbox.Root
                                                      checked={
                                                        !!subField.state.value
                                                      }
                                                      onCheckedChange={(
                                                        checked
                                                      ) => {
                                                        if (!checked) {
                                                          notification({
                                                            title:
                                                              "Cover image Required",
                                                            description:
                                                              "You must set a cover for your community. Click another switch to set it as cover.",
                                                            variant: "lighter",
                                                            status:
                                                              "information",
                                                          })
                                                          return
                                                        }
                                                        subField.handleChange(
                                                          checked
                                                        )

                                                        if (checked) {
                                                          field.state.value?.forEach(
                                                            (
                                                              editFile,
                                                              editFileIndex
                                                            ) => {
                                                              if (
                                                                editFileIndex !==
                                                                  i &&
                                                                editFile.featured
                                                              ) {
                                                                form.setFieldValue(
                                                                  `images[${editFileIndex}].featured`,
                                                                  false
                                                                )
                                                              }
                                                            }
                                                          )
                                                        }
                                                      }}
                                                    />
                                                    <p className="text-label-xs text-text-soft-400">
                                                      Featured
                                                    </p>
                                                  </div>
                                                )
                                              }}
                                            </form.Field>

                                            <CompactButton.Root
                                              type="button"
                                              onClick={() =>
                                                field.removeValue(i)
                                              }
                                              variant="ghost"
                                            >
                                              <CompactButton.Icon
                                                type="button"
                                                className="size-4 text-warning-base"
                                                as={RiDeleteBinLine}
                                              />
                                            </CompactButton.Root>
                                          </div>
                                        </div>
                                      </div>
                                    </Tooltip.Content>
                                  </Tooltip.Root>
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )
                    }}
                  />
                </div>
              </ExpandableContent>
            </ExpandableCardContent>
            <ExpandableContent preset="slide-up">
              <ExpandableCardFooter className="flex w-full items-center gap-2 pt-2">
                <FancyButton.Root
                  type="button"
                  onClick={() => {
                    form.reset()
                    setIsExpanded(false)
                  }}
                  className="w-full"
                  variant="basic"
                >
                  Cancel
                </FancyButton.Root>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <FancyButton.Root
                      variant="primary"
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit}
                    >
                      Create
                      <FancyButton.Icon
                        className={cn(isSubmitting && "animate-spin")}
                        as={isSubmitting ? RiLoaderLine : RiArrowRightSLine}
                      />
                    </FancyButton.Root>
                  )}
                />
              </ExpandableCardFooter>
            </ExpandableContent>
          </form>
        </ExpandableCard>
      )}
    </Expandable>
  )
}
export default FeedInput
