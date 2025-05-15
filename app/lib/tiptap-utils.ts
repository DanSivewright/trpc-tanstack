import { storage } from "@/integrations/firebase/client"
import { Editor } from "@tiptap/react"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Checks if a mark exists in the editor schema
 *
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 */
export const isMarkInSchema = (markName: string, editor: Editor | null) =>
  editor?.schema.spec.marks.get(markName) !== undefined

/**
 * Checks if a node exists in the editor schema
 *
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 */
export const isNodeInSchema = (nodeName: string, editor: Editor | null) =>
  editor?.schema.spec.nodes.get(nodeName) !== undefined

/**
 * Handles image upload with progress tracking and abort capability
 */
export const handleImageUpload = async (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  try {
    const storageRef = ref(storage, `communities/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    // Handle upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.({ progress })
      },
      (error) => {
        throw error
      }
    )

    // Wait for upload to complete
    await uploadTask
    const url = await getDownloadURL(uploadTask.snapshot.ref)
    return url
  } catch (error) {
    if (abortSignal?.aborted) {
      throw new Error("Upload cancelled")
    }
    throw error
  }
}

/**
 * Converts a File to base64 string
 */
export const convertFileToBase64 = (
  file: File,
  abortSignal?: AbortSignal
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const abortHandler = () => {
      reader.abort()
      reject(new Error("Upload cancelled"))
    }

    if (abortSignal) {
      abortSignal.addEventListener("abort", abortHandler)
    }

    reader.onloadend = () => {
      if (abortSignal) {
        abortSignal.removeEventListener("abort", abortHandler)
      }

      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert File to base64"))
      }
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
