export const getPathFromGoogleStorage = (url: string) => {
  if (!url || url === "") return null

  // Handle storage.googleapis.com URLs
  const googleStorageMatch = url.match(/\/o\/([^?]+)/)
  if (googleStorageMatch) {
    return decodeURIComponent(googleStorageMatch[1])
  }

  // Handle storage.beta.i-win.io URLs
  const iWinMatch = url.match(/storage\.beta\.i-win\.io\/(.+)/)
  if (iWinMatch) {
    return iWinMatch[1]
  }

  return null
}

export function formatImagePath(path: string): string {
  const parts = path.split("/")
  const filename = parts.pop()
  if (!filename) return path // fallback if path is malformed
  const encodedFilename = encodeURIComponent(filename)
  return [...parts, encodedFilename].join("/")
}
