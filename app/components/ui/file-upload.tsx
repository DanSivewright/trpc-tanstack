// AlignUI FileUpload v0.0.0

import * as React from "react"
import { cn } from "@/utils/cn"
import type { PolymorphicComponentProps } from "@/utils/polymorphic"
import { Slot } from "@radix-ui/react-slot"

const FileUpload = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    asChild?: boolean
  }
>(({ className, asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : "label"

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center gap-5 rounded-xl border border-dashed border-stroke-sub-300 bg-bg-white-0 p-8 text-center",
        "transition duration-200 ease-out",
        // hover
        "hover:bg-bg-weak-50",
        className
      )}
      {...rest}
    />
  )
})
FileUpload.displayName = "FileUpload"

const FileUploadButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean
  }
>(({ className, asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : "div"

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg bg-bg-white-0 px-2.5 text-label-sm text-text-sub-600",
        "pointer-events-none ring-1 ring-inset ring-stroke-soft-200",
        className
      )}
      {...rest}
    />
  )
})
FileUploadButton.displayName = "FileUploadButton"

function FileUploadIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || "div"

  return (
    <Component
      className={cn("size-6 text-text-sub-600", className)}
      {...rest}
    />
  )
}

export {
  FileUpload as Root,
  FileUploadButton as Button,
  FileUploadIcon as Icon,
}

// // AlignUI FileUpload v0.0.0
// import * as React from "react"
// import { useCallback } from "react"
// import { cn } from "@/utils/cn"
// import { formatBytes } from "@/utils/format-bytes"
// import { type PolymorphicComponentProps } from "@/utils/polymorphic"
// import { Slot } from "@radix-ui/react-slot"
// import { RiDeleteBinLine, RiExpandDiagonalLine } from "@remixicon/react"
// import { useDropzone, type Accept, type FileWithPath } from "react-dropzone"

// import { useNotification } from "@/hooks/use-notification"
// import * as CompactButton from "@/components/ui/compact-button"
// import * as Modal from "@/components/ui/modal"
// import { Tooltip } from "@/components/ui/tooltip"

// // Define supported file type categories
// type FileTypeCategory = "images" | "documents" | "videos" | "audio"

// // Map file type categories to their MIME types
// const fileTypeMappings: Record<FileTypeCategory, Accept> = {
//   images: {
//     "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
//   },
//   documents: {
//     "application/pdf": [".pdf"],
//     "application/msword": [".doc"],
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
//       ".docx",
//     ],
//     "text/plain": [".txt"],
//   },
//   videos: {
//     "video/*": [".mp4", ".webm", ".ogg"],
//   },
//   audio: {
//     "audio/*": [".mp3", ".wav", ".ogg"],
//   },
// }

// type FileUploadProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
//   asChild?: boolean
//   files: File[]
//   setFiles: React.Dispatch<React.SetStateAction<File[]>>
//   fileTypes?: FileTypeCategory[]
//   maxSize?: number
//   maxFiles?: number
// }

// const FileUpload = React.forwardRef<HTMLLabelElement, FileUploadProps>(
//   (
//     {
//       className,
//       asChild,
//       files,
//       setFiles,
//       fileTypes = ["images"],
//       maxSize = 5 * 1024 * 1024,
//       maxFiles = 1,
//       children,
//       ...rest
//     },
//     forwardedRef
//   ) => {
//     const { notification } = useNotification()

//     const acceptedFileTypes = fileTypes.reduce<Accept>(
//       (acc, type) => ({
//         ...acc,
//         ...fileTypeMappings[type],
//       }),
//       {}
//     )

//     const onDrop = useCallback(
//       (acceptedFiles: FileWithPath[]) => {
//         const totalFiles = files.length + acceptedFiles.length

//         if (totalFiles > maxFiles) {
//           notification({
//             title: "File Upload Limit Exceeded",
//             description: `Maximum ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed. ${
//               acceptedFiles.length
//             } file${acceptedFiles.length === 1 ? "" : "s"} rejected.`,
//           })
//           return
//         }

//         setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
//       },
//       [files.length, maxFiles, setFiles, notification]
//     )

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//       onDrop,
//       accept: acceptedFileTypes,
//       maxSize,
//       multiple: maxFiles > 1,
//       onDropRejected: (fileRejections) => {
//         // Group rejections by error type
//         const sizeErrors = fileRejections.filter((r) =>
//           r.errors.some((e) => e.code === "file-too-large")
//         )
//         const typeErrors = fileRejections.filter((r) =>
//           r.errors.some((e) => e.code === "file-invalid-type")
//         )

//         if (sizeErrors.length > 0) {
//           notification({
//             title: "Files Too Large",
//             description: `${sizeErrors.length} file${
//               sizeErrors.length === 1 ? " exceeds" : "s exceed"
//             } the ${(maxSize / (1024 * 1024)).toFixed(1)}MB size limit.`,
//           })
//         }

//         if (typeErrors.length > 0) {
//           notification({
//             title: "Invalid File Type",
//             description: `Only ${fileTypes.join(", ")} file${
//               fileTypes.length === 1 ? " is" : "s are"
//             } allowed. ${typeErrors.length} file${
//               typeErrors.length === 1 ? " was" : "s were"
//             } rejected.`,
//           })
//         }
//       },
//     })

//     const removeFile = useCallback(
//       (index: number) => {
//         setFiles((files) => files.filter((_, i) => i !== index))
//       },
//       [setFiles]
//     )

//     const Component = asChild ? Slot : "label"

//     return (
//       <div className="flex w-full flex-col gap-2">
//         <Component
//           ref={forwardedRef}
//           className={cn(
//             "flex w-full cursor-pointer flex-col items-center gap-5 rounded-xl border border-dashed border-stroke-sub-300 bg-bg-white-0 p-8 text-center",
//             "transition duration-200 ease-out",
//             isDragActive && "border-primary-500 bg-primary-50",
//             files.length >= maxFiles && "pointer-events-none opacity-50",
//             "hover:bg-bg-weak-50",
//             className
//           )}
//           {...rest}
//           {...getRootProps()}
//         >
//           <input {...getInputProps()} disabled={files.length >= maxFiles} />
//           {children}
//         </Component>
//         <div className="flex w-full flex-row items-center justify-end">
//           <p className="text-sm rounded-full bg-neutral-100 px-2 py-1 text-neutral-500">
//             {files.length} {files.length === 1 ? "file" : "files"},{" "}
//             {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}
//           </p>
//         </div>
//         <div className="flex flex-col gap-2">
//           {files?.map((file, i) => {
//             const previewImage = URL.createObjectURL(file)
//             return (
//               <div
//                 key={i}
//                 className="group flex w-full flex-row items-center justify-between rounded-lg border p-1 dark:border-neutral-700"
//               >
//                 <div className="flex items-center gap-2">
//                   <img
//                     src={previewImage ?? undefined}
//                     alt="Preview"
//                     className="h-10 w-10 rounded-md border object-cover"
//                     style={{ objectFit: "cover" }}
//                   />
//                   <div className="flex flex-col items-start justify-start">
//                     <Tooltip.Root>
//                       <Tooltip.Trigger>
//                         <p className="truncate hover:cursor-help">
//                           {file.name}
//                         </p>
//                       </Tooltip.Trigger>
//                       <Tooltip.Content>
//                         <p>{file.name}</p>
//                       </Tooltip.Content>
//                     </Tooltip.Root>
//                     <p className="text-label-xs text-text-soft-400">
//                       {formatBytes(file.size)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 pr-2">
//                   <CompactButton.Root
//                     onClick={() => removeFile(i)}
//                     variant="ghost"
//                   >
//                     <CompactButton.Icon
//                       className="size-4 text-warning-base"
//                       as={RiDeleteBinLine}
//                     />
//                   </CompactButton.Root>
//                   <Modal.Root>
//                     <Modal.Trigger asChild>
//                       <CompactButton.Root>
//                         <CompactButton.Icon as={RiExpandDiagonalLine} />
//                       </CompactButton.Root>
//                     </Modal.Trigger>
//                     <Modal.Content className="max-w-[440px]">
//                       <Modal.Body className="flex items-start gap-4">
//                         <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center rounded-xl bg-neutral-100">
//                           <img
//                             src={previewImage}
//                             alt="Image Preview"
//                             className="h-full w-full rounded-md border object-cover"
//                             style={{ objectFit: "cover" }}
//                           />
//                         </div>
//                       </Modal.Body>
//                     </Modal.Content>
//                   </Modal.Root>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }
// )
// FileUpload.displayName = "FileUpload"

// const FileUploadButton = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement> & {
//     asChild?: boolean
//   }
// >(({ className, asChild, ...rest }, forwardedRef) => {
//   const Component = asChild ? Slot : "div"

//   return (
//     <Component
//       ref={forwardedRef}
//       className={cn(
//         "inline-flex h-8 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg bg-bg-white-0 px-2.5 text-label-sm text-text-sub-600",
//         "pointer-events-none ring-1 ring-inset ring-stroke-soft-200",
//         className
//       )}
//       {...rest}
//     />
//   )
// })
// FileUploadButton.displayName = "FileUploadButton"

// function FileUploadIcon<T extends React.ElementType>({
//   className,
//   as,
//   ...rest
// }: PolymorphicComponentProps<T>) {
//   const Component = as || "div"

//   return (
//     <Component
//       className={cn("size-6 text-text-sub-600", className)}
//       {...rest}
//     />
//   )
// }

// export {
//   FileUploadButton as Button,
//   FileUploadIcon as Icon,
//   FileUpload as Root,
// }
