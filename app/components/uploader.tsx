import { useCallback } from "react"
import { formatBytes } from "@/utils/format-bytes"
import { RiDeleteBinLine, RiUploadCloudLine } from "@remixicon/react"
import { useDropzone, type FileWithPath } from "react-dropzone"

import { cn } from "@/lib/utils"

import * as FancyButton from "./ui/fancy-button"

type Props = {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  fileTypes?: string[]
  fileListClassName?: string
}
export const Uploader: React.FC<Props> = ({
  files,
  setFiles,
  fileListClassName,
  fileTypes,
}) => {
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  })
  const handleDelete = (index: number) => {
    if (index >= 0 && index < files.length) {
      const updatedFiles = [...files]
      updatedFiles.splice(index, 1)
      setFiles(updatedFiles)
    }
  }
  return (
    <>
      <article>
        <header className="border-border border-b p-0">
          <div className="flex flex-row items-center justify-start gap-2 px-4 py-2">
            <div className="flex flex-row items-center justify-center rounded-full border p-2 dark:border-neutral-700">
              <RiUploadCloudLine className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="mb-0 font-semibold">Upload images</p>
              <p className="text-sm -mt-1 text-neutral-500">
                Drag and drop your images
              </p>
            </div>
          </div>
        </header>
        <div className="m-0 p-0">
          <div
            {...getRootProps()}
            className="border-border m-2 flex flex-col items-center justify-start rounded-xl border-[1.5px] border-dashed px-4 py-2 hover:cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-start gap-2">
              <RiUploadCloudLine
                className={cn(
                  "my-4 h-5 w-5 text-neutral-600",
                  false && "text-blue-500"
                )}
              />
              <p className="font-semibold">
                Choose a file or drag & drop it here
              </p>
              <p className="text-sm text-neutral-500">
                Only files. Up to 5 MB.
              </p>
              <FancyButton.Root size="xsmall">
                <FancyButton.Icon as={RiUploadCloudLine} />
                Select Files
              </FancyButton.Root>
              {/* <div
                className={
                  buttonVariants({
                    variant: "outline",
                  }).root
                }
              >
                Select Files
              </div> */}
            </div>
          </div>
          {files.length > 0 && (
            <div
              className={cn(
                "flex max-h-52 w-full flex-col items-center justify-start gap-2 overflow-auto border-t px-2 py-2 dark:border-neutral-700",
                fileListClassName
              )}
            >
              <div className="flex w-full flex-row items-center justify-end">
                <p className="text-sm rounded-full bg-neutral-100 px-2 py-1 text-neutral-500">
                  {files.length} {files.length === 1 ? "file" : "files"},{" "}
                  {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}
                </p>
              </div>
              {files.map((file, index) => {
                const previewImage = URL.createObjectURL(file)
                return (
                  <div
                    key={index}
                    className="group flex w-full flex-row items-center justify-between rounded-lg border px-2 py-1 dark:border-neutral-700"
                  >
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div>
                        <div className="relative h-10 w-10">
                          <img
                            src={previewImage ?? undefined}
                            alt="Preview"
                            className="h-full w-full rounded-md border object-cover"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-start gap-1">
                        <div className="flex flex-row items-center justify-start gap-2">
                          <div className="max-w-[300px] truncate">
                            {/* <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="truncate hover:cursor-help">
                                  {file.name}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{file.name}</p>
                              </TooltipContent>
                            </Tooltip> */}
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-start gap-2">
                          <p className="text-xs text-neutral-500">
                            {formatBytes(file.size)}
                          </p>
                          <div className="text-xs flex flex-row items-center justify-start gap-1 rounded-full px-2 py-[0.5px]">
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                            <p className="text-neutral-500">
                              Staged For Upload
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2">
                      {/* <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="hidden flex-row justify-end rounded-lg bg-neutral-100 p-1 text-neutral-400 transition-all hover:cursor-pointer hover:text-black group-hover:flex"
                          >
                            <Expand className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>{file.name}</DialogTitle>
                          <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center rounded-xl bg-neutral-100">
                            <Image
                              src={previewImage}
                              alt="Image Preview"
                              fill
                              className="h-full w-full rounded-md border"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog> */}
                      <button
                        type="button"
                        className="hidden flex-row justify-end rounded-lg bg-neutral-100 p-1 text-neutral-400 transition-all hover:cursor-pointer hover:text-black group-hover:flex"
                        onClick={() => handleDelete(index)}
                      >
                        <RiDeleteBinLine className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </article>
    </>
  )
}
